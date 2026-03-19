import { categories } from "@markme/db/schema";
import { asc, eq } from "drizzle-orm";
import type { AppDb } from "../context";

export async function buildBookmarkContextText(db: AppDb, userId: string) {
  const cats = await db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: asc(categories.position),
    with: { bookmarks: true },
  });
  return cats
    .map((c) => {
      const lines = c.bookmarks.map(
        (b) =>
          `  - "${b.title}" ${b.url} [tags: ${b.tags?.join(", ") || "none"}]${b.pinned ? " (pinned)" : ""}${b.note ? ` note: ${b.note}` : ""}`,
      );
      return `Category "${c.name}" (${c.emoji}, tags: ${c.tags?.join(", ") || "none"}):\n${lines.join("\n")}`;
    })
    .join("\n\n");
}
