import { bookmarks, categories } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { AppDb } from "../context";

export async function requireCategoryForUser(db: AppDb, userId: string, categoryId: string) {
  const row = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  const c = row[0];
  if (!c) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
  }
  return c;
}

export async function requireBookmarkForUser(db: AppDb, userId: string, bookmarkId: string) {
  const row = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)))
    .limit(1);
  const b = row[0];
  if (!b) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Bookmark not found" });
  }
  return b;
}
