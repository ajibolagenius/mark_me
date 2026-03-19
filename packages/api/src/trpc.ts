import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { ApiContext } from "./context";

const t = initTRPC.context<ApiContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUser = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      db: ctx.db,
      session: { userId: ctx.session.userId },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUser);
