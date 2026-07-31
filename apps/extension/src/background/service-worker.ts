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
const CONTEXT_MENU_POPUP_ID = "markme-save-popup";

const TERMINAL_CODES = new Set([
    "BAD_REQUEST",
    "NOT_FOUND",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "CONFLICT",
]);

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

function isTerminalError(err: unknown): boolean {
    if (err && typeof err === "object") {
        const e = err as { data?: { code?: string }; message?: string };
        if (e.data?.code && TERMINAL_CODES.has(e.data.code)) return true;
        if (e.message && /invalid|validation|expected/i.test(e.message)) return true;
    }
    return false;
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
        chrome.contextMenus.create({
            id: CONTEXT_MENU_POPUP_ID,
            title: "Save with options…",
            contexts: ["page", "link"],
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

    if (info.menuItemId === CONTEXT_MENU_POPUP_ID) {
        // Open the extension popup for full save form (title/tags/category)
        try {
            await chrome.action.openPopup();
        } catch {
            notify("mark_me", "Click the mark_me icon to save with options.");
        }
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
// Auth: receive token from the web app.
// ---------------------------------------------------------------------------

function handleAuthMessage(message: unknown, sendResponse: (r: unknown) => void): boolean {
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
    return false;
}

if (chrome.runtime.onMessageExternal) {
    chrome.runtime.onMessageExternal.addListener(
        (
            message: unknown,
            _sender: chrome.runtime.MessageSender,
            sendResponse: (r: unknown) => void,
        ) => handleAuthMessage(message, sendResponse) || undefined,
    );
}

chrome.runtime.onMessage.addListener(
    (message: unknown, sender: chrome.runtime.MessageSender, sendResponse: (r: unknown) => void) => {
        if (sender.id !== chrome.runtime.id) return;
        return handleAuthMessage(message, sendResponse) || undefined;
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
        if (!item.categoryId || !safeHttpUrl(item.url)) {
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
        } catch (err) {
            if (isTerminalError(err)) {
                // Drop permanently failed items so the rest can sync
                await dequeueOffline(item.id);
                continue;
            }
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

// Drain when connectivity returns (ServiceWorkerGlobalScope)
self.addEventListener("online", () => {
    void drainOfflineQueue();
});

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
    let tags: string[] = [];

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

        try {
            const tagged = await client.ai.autoTag.mutate({ title, url });
            tags = tagged.tags ?? [];
        } catch {
            // auto-tag is best-effort for context-menu saves
        }

        await client.bookmark.create.mutate({
            categoryId,
            url,
            title,
            tags,
            note: "",
            pinned: false,
            faviconUrl: null,
        });
        await setPrefs({ lastCategoryId: categoryId });
        const tagNote = tags.length ? ` · ${tags.slice(0, 3).join(", ")}` : "";
        notify("mark_me", `"${title.slice(0, 50)}" saved${tagNote}`);
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
            tags,
            notes: "",
            savedAt: Date.now(),
        });
        notify("mark_me", "Saved offline — will sync when you’re back online.");
    }
}
