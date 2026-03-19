import type { bookmarks, categories } from "@markme/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type CategoryRow = InferSelectModel<typeof categories>;
export type BookmarkRow = InferSelectModel<typeof bookmarks>;

export function mapBookmark(b: BookmarkRow) {
  return {
    id: b.id,
    title: b.title,
    url: b.url,
    note: b.note ?? undefined,
    tags: b.tags,
    pinned: b.pinned,
    addedAt: b.createdAt.getTime(),
  };
}

export function mapCategory(c: CategoryRow & { bookmarks: BookmarkRow[] }) {
  const bookmarksSorted = [...c.bookmarks].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.emoji,
    tags: c.tags,
    bookmarks: bookmarksSorted.map(mapBookmark),
  };
}
