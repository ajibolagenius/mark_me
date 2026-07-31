import { applyOutboxEntry } from "./optimistic";
import { createOutboxId, isOffline, queueMutation } from "./outbox";
import { notifyOutboxChanged } from "./hooks";
import type { CategoryListItem, OutboxEntry, OutboxProcedure } from "./types";

type CategoryListUtils = {
  setData: (
    input: undefined,
    updater: (old: CategoryListItem[] | undefined) => CategoryListItem[],
  ) => void;
};

export type QueueAndPatchResult =
  | { queued: true; clientId?: string }
  | { queued: false; clientId?: string; optimistic: true };

/**
 * Always apply an optimistic cache patch.
 * When offline, also enqueue for later sync.
 * When online, caller should run the tRPC mutation and invalidate/rollback on error.
 */
export async function queueAndPatch(
  categoryList: CategoryListUtils,
  procedure: OutboxProcedure,
  input: Record<string, unknown>,
  options?: { clientId?: string },
): Promise<QueueAndPatchResult> {
  const clientId =
    options?.clientId ??
    (procedure === "category.create" || procedure === "bookmark.create"
      ? createOutboxId()
      : undefined);

  if (isOffline()) {
    const entry = await queueMutation(procedure, input, { clientId });
    categoryList.setData(undefined, (old) => applyOutboxEntry(old ?? [], entry));
    notifyOutboxChanged();
    return { queued: true, clientId };
  }

  const entry: OutboxEntry = {
    id: createOutboxId(),
    procedure,
    input,
    createdAt: Date.now(),
    clientId,
  };
  categoryList.setData(undefined, (old) => applyOutboxEntry(old ?? [], entry));
  return { queued: false, clientId, optimistic: true };
}

/** Remap a temporary optimistic id to the server id after a successful create. */
export function remapOptimisticId(
  categoryList: CategoryListUtils,
  from: string,
  to: string,
): void {
  if (from === to) return;
  categoryList.setData(undefined, (old) => {
    if (!old) return [];
    return old.map((c) => {
      const id = c.id === from ? to : c.id;
      const bookmarks = c.bookmarks.map((b) => ({
        ...b,
        id: b.id === from ? to : b.id,
        categoryId: b.categoryId === from ? to : b.categoryId,
      }));
      return { ...c, id, bookmarks };
    });
  });
}
