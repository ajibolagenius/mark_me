import { categories } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { z } from "zod";
import { mapCategory } from "../lib/mappers";
import { requireCategoryForUser } from "../lib/ownership";
import {
  categoryIdSchema,
  createCategorySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from "../schemas/category";
import { protectedProcedure, router } from "../trpc";

export const categoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.categories.findMany({
      where: eq(categories.userId, ctx.session.userId),
      orderBy: asc(categories.position),
      with: { bookmarks: true },
    });
    return rows.map(mapCategory);
  }),

  create: protectedProcedure.input(createCategorySchema).mutation(async ({ ctx, input }) => {
    const last = await ctx.db
      .select({ position: categories.position })
      .from(categories)
      .where(eq(categories.userId, ctx.session.userId))
      .orderBy(desc(categories.position))
      .limit(1);
    const position = input.position ?? (last[0] ? last[0].position + 1 : 0);

    const [row] = await ctx.db
      .insert(categories)
      .values({
        userId: ctx.session.userId,
        name: input.name,
        emoji: input.emoji,
        color: input.color,
        tags: input.tags,
        position,
      })
      .returning();
    if (!row) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create category",
      });
    }

    const full = await ctx.db.query.categories.findFirst({
      where: eq(categories.id, row.id),
      with: { bookmarks: true },
    });
    if (!full) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Category not found after create",
      });
    }
    return mapCategory(full);
  }),

  update: protectedProcedure.input(updateCategorySchema).mutation(async ({ ctx, input }) => {
    await requireCategoryForUser(ctx.db, ctx.session.userId, input.id);

    const patch: Partial<InferInsertModel<typeof categories>> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.emoji !== undefined) patch.emoji = input.emoji;
    if (input.color !== undefined) patch.color = input.color;
    if (input.tags !== undefined) patch.tags = input.tags;

    await ctx.db
      .update(categories)
      .set(patch)
      .where(and(eq(categories.id, input.id), eq(categories.userId, ctx.session.userId)));

    const full = await ctx.db.query.categories.findFirst({
      where: eq(categories.id, input.id),
      with: { bookmarks: true },
    });
    if (!full) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Category not found after update",
      });
    }
    return mapCategory(full);
  }),

  delete: protectedProcedure
    .input(z.object({ id: categoryIdSchema }))
    .mutation(async ({ ctx, input }) => {
      await requireCategoryForUser(ctx.db, ctx.session.userId, input.id);
      await ctx.db
        .delete(categories)
        .where(and(eq(categories.id, input.id), eq(categories.userId, ctx.session.userId)));
      return { ok: true as const };
    }),

  reorder: protectedProcedure.input(reorderCategoriesSchema).mutation(async ({ ctx, input }) => {
    const owned = await ctx.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(eq(categories.userId, ctx.session.userId), inArray(categories.id, input.orderedIds)),
      );
    if (owned.length !== input.orderedIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "One or more category ids are invalid",
      });
    }
    for (const [i, categoryId] of input.orderedIds.entries()) {
      await ctx.db
        .update(categories)
        .set({ position: i })
        .where(and(eq(categories.id, categoryId), eq(categories.userId, ctx.session.userId)));
    }
    const rows = await ctx.db.query.categories.findMany({
      where: eq(categories.userId, ctx.session.userId),
      orderBy: asc(categories.position),
      with: { bookmarks: true },
    });
    return rows.map(mapCategory);
  }),
});
