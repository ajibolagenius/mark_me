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

let flushing = false;

export async function flushOutbox(
  client: OutboxMutator,
): Promise<{ synced: number; remaining: number }> {
  if (flushing) return { synced: 0, remaining: (await getOutbox()).length };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, remaining: (await getOutbox()).length };
  }

  flushing = true;
  let synced = 0;

  try {
    while (true) {
      const queue = await getOutbox();
      const entry = queue[0];
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
      } catch {
        // Preserve order — retry on the next online/focus event.
        break;
      }
    }
  } finally {
    flushing = false;
  }

  return { synced, remaining: (await getOutbox()).length };
}
