import { bookmarks, categories } from "@markme/db/schema";
import { asc, eq } from "drizzle-orm";
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
    await ctx.db.transaction(async (tx) => {
      await tx.delete(categories).where(eq(categories.userId, uid));

      for (const [i, c] of input.categories.entries()) {
        await tx.insert(categories).values({
          id: c.id,
          userId: uid,
          name: c.name,
          emoji: c.icon,
          color: c.color,
          tags: c.tags,
          position: i,
        });
        for (const b of c.bookmarks) {
          await tx.insert(bookmarks).values({
            id: b.id,
            categoryId: c.id,
            userId: uid,
            title: b.title,
            url: b.url.startsWith("http") ? b.url : `https://${b.url}`,
            note: b.note ?? null,
            tags: b.tags,
            pinned: b.pinned ?? false,
            createdAt: b.addedAt ? new Date(b.addedAt) : new Date(),
          });
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
