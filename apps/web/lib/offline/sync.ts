import { dequeueOutbox, getOutbox, setOutbox } from "./storage";
import type { OutboxEntry } from "./types";

/** Minimal mutation surface used while flushing the offline outbox. */
export type OutboxMutator = {
  category: {
    create: { mutate: (input: Record<string, unknown>) => Promise<{ id: string }> };
    update: { mutate: (input: Record<string, unknown>) => Promise<unknown> };
    delete: { mutate: (input: Record<string, unknown>) => Promise<unknown> };
  };
  bookmark: {
    create: { mutate: (input: Record<string, unknown>) => Promise<{ id: string }> };
    update: { mutate: (input: Record<string, unknown>) => Promise<unknown> };
    delete: { mutate: (input: Record<string, unknown>) => Promise<unknown> };
    togglePin: { mutate: (input: Record<string, unknown>) => Promise<unknown> };
  };
};

const TERMINAL_CODES = new Set([
  "BAD_REQUEST",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "CONFLICT",
  "PAYLOAD_TOO_LARGE",
  "METHOD_NOT_SUPPORTED",
  "PRECONDITION_FAILED",
  "UNPROCESSABLE_CONTENT",
]);

function errorInfo(err: unknown): { message: string; code?: string } {
  if (err && typeof err === "object") {
    const e = err as { message?: string; data?: { code?: string }; shape?: { data?: { code?: string } } };
    return {
      message: e.message || "Sync failed",
      code: e.data?.code ?? e.shape?.data?.code,
    };
  }
  return { message: "Sync failed" };
}

function isTerminalError(err: unknown): boolean {
  const { code, message } = errorInfo(err);
  if (code && TERMINAL_CODES.has(code)) return true;
  // Zod / validation often surfaces without a stable code on the client
  if (/invalid|validation|expected/i.test(message)) return true;
  return false;
}

function remapIds(entries: OutboxEntry[], from: string, to: string): OutboxEntry[] {
  return entries.map((entry) => {
    const input = { ...entry.input };
    for (const key of Object.keys(input)) {
      if (input[key] === from) input[key] = to;
    }
    return {
      ...entry,
      clientId: entry.clientId === from ? to : entry.clientId,
      input,
    };
  });
}

async function markEntryFailed(entry: OutboxEntry, err: unknown): Promise<void> {
  const info = errorInfo(err);
  const queue = await getOutbox();
  await setOutbox(
    queue.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            status: "failed" as const,
            attempts: (e.attempts ?? 0) + 1,
            lastError: { message: info.message, code: info.code, at: Date.now() },
          }
        : e,
    ),
  );
}

async function bumpAttempt(entry: OutboxEntry, err: unknown): Promise<void> {
  const info = errorInfo(err);
  const queue = await getOutbox();
  await setOutbox(
    queue.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            attempts: (e.attempts ?? 0) + 1,
            lastError: { message: info.message, code: info.code, at: Date.now() },
          }
        : e,
    ),
  );
}

export async function discardOutboxEntry(id: string): Promise<void> {
  await dequeueOutbox(id);
}

export async function retryOutboxEntry(id: string): Promise<void> {
  const queue = await getOutbox();
  await setOutbox(
    queue.map((e) =>
      e.id === id
        ? { ...e, status: "pending" as const, lastError: undefined }
        : e,
    ),
  );
}

export async function discardAllFailed(): Promise<void> {
  const queue = await getOutbox();
  await setOutbox(queue.filter((e) => e.status !== "failed"));
}

let flushing = false;

export async function flushOutbox(
  client: OutboxMutator,
): Promise<{ synced: number; remaining: number; failed: number }> {
  const countFailed = async () =>
    (await getOutbox()).filter((e) => e.status === "failed").length;

  if (flushing) {
    const q = await getOutbox();
    return { synced: 0, remaining: q.length, failed: q.filter((e) => e.status === "failed").length };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const q = await getOutbox();
    return { synced: 0, remaining: q.length, failed: q.filter((e) => e.status === "failed").length };
  }

  flushing = true;
  let synced = 0;

  try {
    while (true) {
      const queue = await getOutbox();
      // Skip failed entries so they don't block the rest of the queue
      const entry = queue.find((e) => e.status !== "failed");
      if (!entry) break;

      try {
        let serverId: string | undefined;

        switch (entry.procedure) {
          case "category.create": {
            const result = await client.category.create.mutate(entry.input);
            serverId = result.id;
            break;
          }
          case "category.update":
            await client.category.update.mutate(entry.input);
            break;
          case "category.delete":
            await client.category.delete.mutate(entry.input);
            break;
          case "bookmark.create": {
            const result = await client.bookmark.create.mutate(entry.input);
            serverId = result.id;
            break;
          }
          case "bookmark.update":
            await client.bookmark.update.mutate(entry.input);
            break;
          case "bookmark.delete":
            await client.bookmark.delete.mutate(entry.input);
            break;
          case "bookmark.togglePin":
            await client.bookmark.togglePin.mutate(entry.input);
            break;
          default:
            break;
        }

        await dequeueOutbox(entry.id);
        synced += 1;

        if (serverId && entry.clientId && entry.clientId !== serverId) {
          const rest = await getOutbox();
          await setOutbox(remapIds(rest, entry.clientId, serverId));
        }
      } catch (err) {
        if (isTerminalError(err)) {
          await markEntryFailed(entry, err);
          // Continue flushing subsequent pending entries
          continue;
        }
        await bumpAttempt(entry, err);
        // Transient — stop and retry on next online/focus
        break;
      }
    }
  } finally {
    flushing = false;
  }

  const remaining = (await getOutbox()).length;
  return { synced, remaining, failed: await countFailed() };
}
