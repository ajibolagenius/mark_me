import type { BookmarkListItem, CategoryListItem, OutboxEntry, OutboxProcedure } from "./types";

function cloneCategories(categories: CategoryListItem[]): CategoryListItem[] {
  return categories.map((c) => ({
    ...c,
    tags: [...c.tags],
    bookmarks: c.bookmarks.map((b) => ({ ...b, tags: [...b.tags] })),
  }));
}

function normalizeUrl(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`;
}

export function applyOutboxEntry(
  categories: CategoryListItem[],
  entry: OutboxEntry,
): CategoryListItem[] {
  const next = cloneCategories(categories);
  const { procedure, input, clientId } = entry;

  switch (procedure as OutboxProcedure) {
    case "category.create": {
      const id = clientId ?? String(input.id ?? `tmp_${entry.id}`);
      next.push({
        id,
        name: String(input.name ?? "Untitled"),
        color: Number(input.color ?? 0),
        icon: String(input.emoji ?? "📁"),
        tags: Array.isArray(input.tags) ? (input.tags as string[]) : [],
        bookmarks: [],
      });
      return next;
    }
    case "category.update": {
      const id = String(input.id);
      return next.map((c) =>
        c.id === id
          ? {
              ...c,
              name: input.name !== undefined ? String(input.name) : c.name,
              icon: input.emoji !== undefined ? String(input.emoji) : c.icon,
              color: input.color !== undefined ? Number(input.color) : c.color,
              tags: input.tags !== undefined ? (input.tags as string[]) : c.tags,
            }
          : c,
      );
    }
    case "category.delete": {
      const id = String(input.id);
      return next.filter((c) => c.id !== id);
    }
    case "bookmark.create": {
      const categoryId = String(input.categoryId);
      const id = clientId ?? String(input.id ?? `tmp_${entry.id}`);
      const bm: BookmarkListItem = {
        id,
        categoryId,
        title: String(input.title ?? "Untitled"),
        url: normalizeUrl(String(input.url ?? "")),
        note: input.note ? String(input.note) : undefined,
        tags: Array.isArray(input.tags) ? (input.tags as string[]) : [],
        pinned: Boolean(input.pinned),
        addedAt: Date.now(),
      };
      return next.map((c) =>
        c.id === categoryId ? { ...c, bookmarks: [bm, ...c.bookmarks] } : c,
      );
    }
    case "bookmark.update": {
      const id = String(input.id);
      const nextCategoryId =
        input.categoryId !== undefined ? String(input.categoryId) : undefined;
      let moved: BookmarkListItem | null = null;
      const without = next.map((c) => {
        const idx = c.bookmarks.findIndex((b) => b.id === id);
        if (idx === -1) return c;
        const existing = c.bookmarks[idx]!;
        const updated: BookmarkListItem = {
          ...existing,
          title: input.title !== undefined ? String(input.title) : existing.title,
          url: input.url !== undefined ? normalizeUrl(String(input.url)) : existing.url,
          note:
            input.note === null
              ? undefined
              : input.note !== undefined
                ? String(input.note)
                : existing.note,
          tags: input.tags !== undefined ? (input.tags as string[]) : existing.tags,
          pinned: input.pinned !== undefined ? Boolean(input.pinned) : existing.pinned,
          categoryId: nextCategoryId ?? existing.categoryId,
        };
        if (nextCategoryId && nextCategoryId !== c.id) {
          moved = updated;
          return { ...c, bookmarks: c.bookmarks.filter((b) => b.id !== id) };
        }
        const bookmarks = [...c.bookmarks];
        bookmarks[idx] = updated;
        return { ...c, bookmarks };
      });
      if (!moved) return without;
      return without.map((c) =>
        c.id === moved!.categoryId ? { ...c, bookmarks: [moved!, ...c.bookmarks] } : c,
      );
    }
    case "bookmark.delete": {
      const id = String(input.id);
      return next.map((c) => ({
        ...c,
        bookmarks: c.bookmarks.filter((b) => b.id !== id),
      }));
    }
    case "bookmark.togglePin": {
      const id = String(input.id);
      return next.map((c) => ({
        ...c,
        bookmarks: c.bookmarks
          .map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b))
          .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
      }));
    }
    default:
      return next;
  }
}

export function applyOutbox(
  categories: CategoryListItem[],
  entries: OutboxEntry[],
): CategoryListItem[] {
  return entries.reduce(applyOutboxEntry, categories);
}
