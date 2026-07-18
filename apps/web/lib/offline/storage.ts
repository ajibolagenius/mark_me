import { get, set, del } from "idb-keyval";
import type { LastUserSnapshot, OutboxEntry } from "./types";

const LAST_USER_KEY = "markme-last-user";
const OUTBOX_KEY = "markme-outbox";

export async function getLastUser(): Promise<LastUserSnapshot | null> {
  return (await get<LastUserSnapshot>(LAST_USER_KEY)) ?? null;
}

export async function setLastUser(user: LastUserSnapshot): Promise<void> {
  await set(LAST_USER_KEY, user);
}

export async function clearLastUser(): Promise<void> {
  await del(LAST_USER_KEY);
}

export async function getOutbox(): Promise<OutboxEntry[]> {
  return (await get<OutboxEntry[]>(OUTBOX_KEY)) ?? [];
}

export async function setOutbox(entries: OutboxEntry[]): Promise<void> {
  await set(OUTBOX_KEY, entries);
}

export async function enqueueOutbox(entry: OutboxEntry): Promise<OutboxEntry[]> {
  const next = [...(await getOutbox()), entry];
  await setOutbox(next);
  return next;
}

export async function dequeueOutbox(id: string): Promise<OutboxEntry[]> {
  const next = (await getOutbox()).filter((e) => e.id !== id);
  await setOutbox(next);
  return next;
}
