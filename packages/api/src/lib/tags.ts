import { bookmarks, categories } from "@markme/db/schema";
import { eq } from "drizzle-orm";
import type { AppDb } from "../context";

export async function listAllTagsForUser(db: AppDb, userId: string) {
  const catRows = await db
    .select({ tags: categories.tags })
    .from(categories)
    .where(eq(categories.userId, userId));
  const bmRows = await db
    .select({ tags: bookmarks.tags })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  const set = new Set<string>();
  for (const c of catRows) {
    for (const t of c.tags) set.add(t.toLowerCase());
  }
  for (const b of bmRows) {
    for (const t of b.tags) set.add(t.toLowerCase());
  }
  return [...set].sort();
}
