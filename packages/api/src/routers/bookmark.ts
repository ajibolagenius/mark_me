import { bookmarks } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { z } from "zod";
import { mapBookmark } from "../lib/mappers";
import { requireBookmarkForUser, requireCategoryForUser } from "../lib/ownership";
import {
  createBookmarkSchema,
  listBookmarksSchema,
  searchBookmarksSchema,
  updateBookmarkSchema,
} from "../schemas/bookmark";
import { protectedProcedure, router } from "../trpc";

export const bookmarkRouter = router({
  list: protectedProcedure
    .input(listBookmarksSchema.optional())
    .query(async ({ ctx, input: rawInput }) => {
      const input = rawInput ?? {};
      const uid = ctx.session.userId;
      const filterCategoryId = input.categoryId;
      if (filterCategoryId) {
        await requireCategoryForUser(ctx.db, uid, filterCategoryId);
        const rows = await ctx.db
          .select()
          .from(bookmarks)
          .where(and(eq(bookmarks.userId, uid), eq(bookmarks.categoryId, filterCategoryId)))
          .orderBy(desc(bookmarks.pinned), desc(bookmarks.createdAt));
        return rows.map(mapBookmark);
      }
      const rows = await ctx.db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.userId, uid))
        .orderBy(desc(bookmarks.pinned), desc(bookmarks.createdAt));
      return rows.map(mapBookmark);
    }),

  create: protectedProcedure.input(createBookmarkSchema).mutation(async ({ ctx, input }) => {
    await requireCategoryForUser(ctx.db, ctx.session.userId, input.categoryId);
    const [row] = await ctx.db
      .insert(bookmarks)
      .values({
        categoryId: input.categoryId,
        userId: ctx.session.userId,
        title: input.title,
        url: input.url,
        note: input.note ?? null,
        tags: input.tags,
        pinned: input.pinned ?? false,
        faviconUrl: input.faviconUrl ?? null,
      })
      .returning();
    if (!row) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create bookmark",
      });
    }
    return mapBookmark(row);
  }),

  update: protectedProcedure.input(updateBookmarkSchema).mutation(async ({ ctx, input }) => {
    const existing = await requireBookmarkForUser(ctx.db, ctx.session.userId, input.id);
    if (input.categoryId && input.categoryId !== existing.categoryId) {
      await requireCategoryForUser(ctx.db, ctx.session.userId, input.categoryId);
    }

    const patch: Partial<InferInsertModel<typeof bookmarks>> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.url !== undefined) patch.url = input.url;
    if (input.note !== undefined) patch.note = input.note;
    if (input.tags !== undefined) patch.tags = input.tags;
    if (input.pinned !== undefined) patch.pinned = input.pinned;
    if (input.faviconUrl !== undefined) patch.faviconUrl = input.faviconUrl;
    if (input.categoryId !== undefined) patch.categoryId = input.categoryId;

    await ctx.db
      .update(bookmarks)
      .set(patch)
      .where(and(eq(bookmarks.id, input.id), eq(bookmarks.userId, ctx.session.userId)));

    const [row] = await ctx.db.select().from(bookmarks).where(eq(bookmarks.id, input.id)).limit(1);
    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Bookmark not found after update",
      });
    }
    return mapBookmark(row);
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await requireBookmarkForUser(ctx.db, ctx.session.userId, input.id);
      await ctx.db
        .delete(bookmarks)
        .where(and(eq(bookmarks.id, input.id), eq(bookmarks.userId, ctx.session.userId)));
      return { ok: true as const };
    }),

  togglePin: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await requireBookmarkForUser(ctx.db, ctx.session.userId, input.id);
      await ctx.db
        .update(bookmarks)
        .set({ pinned: !existing.pinned })
        .where(and(eq(bookmarks.id, input.id), eq(bookmarks.userId, ctx.session.userId)));
      const [row] = await ctx.db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.id, input.id))
        .limit(1);
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bookmark not found after toggle",
        });
      }
      return mapBookmark(row);
    }),

  search: protectedProcedure.input(searchBookmarksSchema).query(async ({ ctx, input }) => {
    const q = `%${input.query}%`;
    const rows = await ctx.db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, ctx.session.userId),
          or(
            ilike(bookmarks.title, q),
            ilike(bookmarks.url, q),
            ilike(bookmarks.note, q),
            sql`array_to_string(${bookmarks.tags}, ' ') ilike ${q}`,
          ),
        ),
      )
      .limit(input.limit);
    return rows.map(mapBookmark);
  }),
});
