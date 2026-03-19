import { listAllTagsForUser } from "../lib/tags";
import { suggestTagsSchema } from "../schemas/tag";
import { protectedProcedure, router } from "../trpc";

export const tagRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return listAllTagsForUser(ctx.db, ctx.session.userId);
  }),

  suggest: protectedProcedure.input(suggestTagsSchema).query(async ({ ctx, input }) => {
    const all = await listAllTagsForUser(ctx.db, ctx.session.userId);
    const p = input.prefix.toLowerCase();
    const filtered = p ? all.filter((t) => t.includes(p) || t.startsWith(p)) : all;
    return filtered.slice(0, input.limit);
  }),
});
