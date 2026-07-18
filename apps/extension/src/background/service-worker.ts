/**
 * mark_me Chrome MV3 Service Worker
 *
 * Responsibilities:
 * 1. Receive auth token from the web app (externally_connectable)
 * 2. Create "Save to mark_me" context menu
 * 3. Handle context menu clicks (save page or selected link)
 * 4. Drain the offline queue when the extension wakes up
 */

import {
    type AuthState,
    dequeueOffline,
    enqueueOffline,
    getAuth,
    getOfflineQueue,
    getPrefs,
    setAuth,
    setPrefs,
} from "../lib/storage";
import { createVanillaClient } from "../lib/trpc";
import { safeHttpUrl } from "../lib/urls";

const CONTEXT_MENU_ID = "markme-save";
const CONTEXT_MENU_LINK_ID = "markme-save-link";

function getWebAppUrl(): string {
    return (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";
}

function openConnectTab() {
    const extId = chrome.runtime.id;
    chrome.tabs.create({ url: `${getWebAppUrl()}/extension-auth?ext=${extId}` });
}

function notify(title: string, message: string) {
    if (!chrome.notifications) return;
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title,
        message,
    });
}

// ---------------------------------------------------------------------------
// Install / startup
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
    setupContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
    setupContextMenus();
    void drainOfflineQueue();
});

// ---------------------------------------------------------------------------
// Context menus
// ---------------------------------------------------------------------------

function setupContextMenus() {
    if (!chrome.contextMenus) return;
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: CONTEXT_MENU_ID,
            title: "Save page to mark_me",
            contexts: ["page"],
        });
        chrome.contextMenus.create({
            id: CONTEXT_MENU_LINK_ID,
            title: "Save link to mark_me",
            contexts: ["link"],
        });
    });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const auth = await getAuth();
    if (!auth) {
        notify("mark_me", "Connect your account to save bookmarks.");
        openConnectTab();
        return;
    }

    const isLink = info.menuItemId === CONTEXT_MENU_LINK_ID;
    const url = (isLink ? info.linkUrl : info.pageUrl) ?? "";
    const title = isLink
        ? ((info as unknown as { linkText?: string }).linkText ?? info.selectionText ?? url)
        : (tab?.title ?? url);

    if (!safeHttpUrl(url)) {
        notify("mark_me", "Can’t save this URL.");
        return;
    }

    await saveBookmark({ auth, url, title });
});

// ---------------------------------------------------------------------------
// Auth: receive token from web app via externally_connectable
// ---------------------------------------------------------------------------

chrome.runtime.onMessageExternal.addListener(
    (message: unknown, _sender: chrome.runtime.MessageSender, sendResponse: (r: unknown) => void) => {
        if (
            typeof message === "object" &&
            message !== null &&
            (message as Record<string, unknown>).type === "MARKME_AUTH"
        ) {
            const { token, userId, expiresAt } = message as {
                type: string;
                token: string;
                userId: string;
                expiresAt: number;
            };
            const auth: AuthState = { token, userId, expiresAt };
            setAuth(auth)
                .then(() => sendResponse({ ok: true }))
                .catch(() => sendResponse({ ok: false }));
            return true;
        }
    },
);

// ---------------------------------------------------------------------------
// Offline queue drain
// ---------------------------------------------------------------------------

async function drainOfflineQueue() {
    const auth = await getAuth();
    if (!auth) return;

    const queue = await getOfflineQueue();
    if (queue.length === 0) return;

    const client = createVanillaClient(auth.token);

    for (const item of queue) {
        if (!item.categoryId) {
            await dequeueOffline(item.id);
            continue;
        }
        try {
            await client.bookmark.create.mutate({
                categoryId: item.categoryId,
                url: item.url,
                title: item.title,
                tags: item.tags,
                note: item.notes,
                pinned: false,
                faviconUrl: null,
            });
            await dequeueOffline(item.id);
        } catch {
            break;
        }
    }
}

if (chrome.alarms) {
    chrome.alarms.create("markme-sync", { periodInMinutes: 5 });
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === "markme-sync") {
            void drainOfflineQueue();
        }
    });
}

// ---------------------------------------------------------------------------
// Helper: save a bookmark via the API (or enqueue offline)
// ---------------------------------------------------------------------------

async function saveBookmark({
    auth,
    url,
    title,
}: {
    auth: AuthState;
    url: string;
    title: string;
}) {
    const client = createVanillaClient(auth.token);
    const prefs = await getPrefs();
    let categoryId = prefs.lastCategoryId;

    try {
        const cats = await client.category.list.query();
        categoryId =
            (prefs.lastCategoryId && cats.some((c) => c.id === prefs.lastCategoryId)
                ? prefs.lastCategoryId
                : undefined) ?? cats[0]?.id;

        if (!categoryId) {
            notify("mark_me", "Create a category in the web app first.");
            chrome.tabs.create({ url: `${getWebAppUrl()}/dashboard` });
            return;
        }

        await client.bookmark.create.mutate({
            categoryId,
            url,
            title,
            tags: [],
            note: "",
            pinned: false,
            faviconUrl: null,
        });
        await setPrefs({ lastCategoryId: categoryId });
        notify("mark_me", `"${title.slice(0, 60)}" saved.`);
    } catch {
        if (!categoryId) {
            notify("mark_me", "Couldn’t save — connect online once to load categories.");
            return;
        }
        await enqueueOffline({
            id: crypto.randomUUID(),
            url,
            title,
            categoryId,
            tags: [],
            notes: "",
            savedAt: Date.now(),
        });
        notify("mark_me", "Saved offline — will sync when you’re back online.");
    }
}
