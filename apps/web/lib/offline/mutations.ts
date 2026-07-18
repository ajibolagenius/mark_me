import { applyOutboxEntry } from "./optimistic";
import { createOutboxId, isOffline, queueMutation } from "./outbox";
import { notifyOutboxChanged } from "./hooks";
import type { CategoryListItem, OutboxProcedure } from "./types";

type CategoryListUtils = {
  setData: (
    input: undefined,
    updater: (old: CategoryListItem[] | undefined) => CategoryListItem[],
  ) => void;
};

/**
 * When offline, enqueue the mutation and patch the persisted category.list cache.
 * When online, returns false so the caller can run the normal tRPC mutation.
 */
export async function queueAndPatch(
  categoryList: CategoryListUtils,
  procedure: OutboxProcedure,
  input: Record<string, unknown>,
  options?: { clientId?: string },
): Promise<{ queued: true; clientId?: string } | { queued: false }> {
  if (!isOffline()) return { queued: false };

  const clientId =
    options?.clientId ??
    (procedure === "category.create" || procedure === "bookmark.create"
      ? createOutboxId()
      : undefined);

  const entry = await queueMutation(procedure, input, { clientId });
  categoryList.setData(undefined, (old) => applyOutboxEntry(old ?? [], entry));
  notifyOutboxChanged();
  return { queued: true, clientId };
}
