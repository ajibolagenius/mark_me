import { enqueueOutbox, getOutbox } from "./storage";
import type { OutboxEntry, OutboxProcedure } from "./types";

export function createOutboxId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ob_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function queueMutation(
  procedure: OutboxProcedure,
  input: Record<string, unknown>,
  options?: { clientId?: string },
): Promise<OutboxEntry> {
  const entry: OutboxEntry = {
    id: createOutboxId(),
    procedure,
    input,
    createdAt: Date.now(),
    clientId: options?.clientId,
  };
  await enqueueOutbox(entry);
  return entry;
}

export async function peekOutbox(): Promise<OutboxEntry[]> {
  return getOutbox();
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
