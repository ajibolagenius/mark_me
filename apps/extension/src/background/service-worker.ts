/**
 * mark_me Chrome MV3 Service Worker
 *
 * Responsibilities:
 * 1. Receive auth token from the web app (externally_connectable)
 * 2. Create "Save to mark_me" context menu
 * 3. Handle context menu clicks (save page or selected link)
 * 4. Listen to chrome.bookmarks.onCreated and optionally mirror to mark_me
 * 5. Drain the offline queue when the extension wakes up
 */

import {
  type AuthState,
  dequeueOffline,
  enqueueOffline,
  getAuth,
  getOfflineQueue,
  setAuth,
} from "../lib/storage";
import { createVanillaClient } from "../lib/trpc";

const CONTEXT_MENU_ID = "markme-save";
const CONTEXT_MENU_LINK_ID = "markme-save-link";

// ---------------------------------------------------------------------------
// Install / startup — Chrome manages the service worker lifecycle
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  setupContextMenus();
  drainOfflineQueue();
});

// ---------------------------------------------------------------------------
// Context menus
// ---------------------------------------------------------------------------

function setupContextMenus() {
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
    // Cannot open popup programmatically in all Chrome versions; ignore
    return;
  }

  const isLink = info.menuItemId === CONTEXT_MENU_LINK_ID;
  const url = (isLink ? info.linkUrl : info.pageUrl) ?? "";
  // linkText is not in all Chrome versions; fall back to selectionText or url
  const title = isLink
    ? ((info as unknown as { linkText?: string }).linkText ?? info.selectionText ?? url)
    : (tab?.title ?? url);

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
      return true; // keep channel open for async response
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
      // Cannot save without a category; remove stale item
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
      // Leave in queue; retry on next wake
      break;
    }
  }
}

// Periodic alarm-based drain (every 5 minutes when the SW is awake)
chrome.alarms.create("markme-sync", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "markme-sync") {
    drainOfflineQueue();
  }
});

// ---------------------------------------------------------------------------
// chrome.bookmarks.onCreated — currently a no-op; user saves explicitly via popup
// ---------------------------------------------------------------------------

chrome.bookmarks.onCreated.addListener((_id, bookmark) => {
  // Intentionally not auto-saving: the popup provides intentional, categorized saves.
  // Remove this listener if you want to auto-mirror browser bookmarks.
  void bookmark;
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

  try {
    const cats = await client.category.list.query();
    const categoryId = cats[0]?.id;
    if (!categoryId) return;

    await client.bookmark.create.mutate({
      categoryId,
      url,
      title,
      tags: [],
      note: "",
      pinned: false,
      faviconUrl: null,
    });

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "mark_me",
      message: `"${title.slice(0, 60)}" saved.`,
    });
  } catch {
    await enqueueOffline({
      id: crypto.randomUUID(),
      url,
      title,
      categoryId: "",
      tags: [],
      notes: "",
      savedAt: Date.now(),
    });
  }
}
