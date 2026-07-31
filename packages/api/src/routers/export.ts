import { bookmarks, categories } from "@markme/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { mapCategory } from "../lib/mappers";
import { importJsonSchema } from "../schemas/export";
import { protectedProcedure, router } from "../trpc";

export const exportRouter = router({
  toJSON: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.categories.findMany({
      where: eq(categories.userId, ctx.session.userId),
      orderBy: asc(categories.position),
      with: { bookmarks: true },
    });
    return rows.map(mapCategory);
  }),

  fromJSON: protectedProcedure.input(importJsonSchema).mutation(async ({ ctx, input }) => {
    const uid = ctx.session.userId;
    const mode = input.mode ?? "replace";

    await ctx.db.transaction(async (tx) => {
      if (mode === "replace") {
        await tx.delete(categories).where(eq(categories.userId, uid));
      }

      const existingCats =
        mode === "merge"
          ? await tx.query.categories.findMany({
              where: eq(categories.userId, uid),
              with: { bookmarks: true },
            })
          : [];
      const existingById = new Map(existingCats.map((c) => [c.id, c]));
      const existingByName = new Map(existingCats.map((c) => [c.name.toLowerCase(), c]));
      let nextPosition = existingCats.length;

      for (const [i, c] of input.categories.entries()) {
        let categoryId = c.id;
        const byId = existingById.get(c.id);
        const byName = existingByName.get(c.name.toLowerCase());
        const match = byId ?? byName;

        if (mode === "merge" && match) {
          categoryId = match.id;
          await tx
            .update(categories)
            .set({
              name: c.name,
              emoji: c.icon,
              color: c.color,
              tags: c.tags,
            })
            .where(and(eq(categories.id, match.id), eq(categories.userId, uid)));
        } else {
          await tx.insert(categories).values({
            id: c.id,
            userId: uid,
            name: c.name,
            emoji: c.icon,
            color: c.color,
            tags: c.tags,
            position: mode === "replace" ? i : nextPosition++,
          });
          categoryId = c.id;
        }

        const existingBmIds = new Set(
          mode === "merge" && match ? match.bookmarks.map((b) => b.id) : [],
        );
        const existingBmUrls = new Set(
          mode === "merge" && match
            ? match.bookmarks.map((b) => b.url.toLowerCase())
            : [],
        );

        for (const b of c.bookmarks) {
          if (mode === "merge" && existingBmIds.has(b.id)) {
            await tx
              .update(bookmarks)
              .set({
                title: b.title,
                url: b.url,
                note: b.note ?? null,
                tags: b.tags,
                pinned: b.pinned ?? false,
                categoryId,
              })
              .where(and(eq(bookmarks.id, b.id), eq(bookmarks.userId, uid)));
            continue;
          }
          if (mode === "merge" && existingBmUrls.has(b.url.toLowerCase())) {
            continue;
          }
          await tx.insert(bookmarks).values({
            id: b.id,
            categoryId,
            userId: uid,
            title: b.title,
            url: b.url,
            note: b.note ?? null,
            tags: b.tags,
            pinned: b.pinned ?? false,
            createdAt: b.addedAt ? new Date(b.addedAt) : new Date(),
          });
          existingBmIds.add(b.id);
          existingBmUrls.add(b.url.toLowerCase());
        }
      }
    });

    const rows = await ctx.db.query.categories.findMany({
      where: eq(categories.userId, uid),
      orderBy: asc(categories.position),
      with: { bookmarks: true },
    });
    return rows.map(mapCategory);
  }),
});
