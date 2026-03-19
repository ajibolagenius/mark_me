/**
 * Promise-based wrappers for chrome.storage.sync and chrome.storage.local.
 * All auth state goes in sync; offline queue goes in local.
 */

export interface AuthState {
  token: string;
  userId: string;
  expiresAt: number; // unix ms
}

export interface OfflineItem {
  id: string;
  url: string;
  title: string;
  categoryId: string;
  tags: string[];
  notes: string;
  savedAt: number;
}

// --- sync storage helpers (auth, preferences) ---

export async function getAuth(): Promise<AuthState | null> {
  const result = await chrome.storage.sync.get("markme_auth");
  const raw = result.markme_auth as AuthState | undefined;
  if (!raw || !raw.token) return null;
  if (raw.expiresAt < Date.now()) {
    await clearAuth();
    return null;
  }
  return raw;
}

export async function setAuth(auth: AuthState): Promise<void> {
  await chrome.storage.sync.set({ markme_auth: auth });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.sync.remove("markme_auth");
}

// --- local storage helpers (offline queue) ---

export async function getOfflineQueue(): Promise<OfflineItem[]> {
  const result = await chrome.storage.local.get("markme_offline_queue");
  return (result.markme_offline_queue as OfflineItem[] | undefined) ?? [];
}

export async function enqueueOffline(item: OfflineItem): Promise<void> {
  const queue = await getOfflineQueue();
  queue.push(item);
  await chrome.storage.local.set({ markme_offline_queue: queue });
}

export async function dequeueOffline(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const updated = queue.filter((item) => item.id !== id);
  await chrome.storage.local.set({ markme_offline_queue: updated });
}

export async function clearOfflineQueue(): Promise<void> {
  await chrome.storage.local.remove("markme_offline_queue");
}
