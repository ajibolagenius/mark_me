import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./root";

export type { ApiContext, AppDb, Session } from "./context";
export { createContext } from "./context";
export { appRouter, type AppRouter } from "./root";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export { router, publicProcedure, protectedProcedure } from "./trpc";
export * as schemas from "./schemas";
export { AI_DAILY_LIMIT, consumeAiQuota } from "./lib/ai-quota";

import type { ApiContext } from "./context";
import { appRouter } from "./root";

export type Caller = ReturnType<typeof appRouter.createCaller>;

/** Server-side caller with a fully-formed context (db + session). */
export function createApiCaller(ctx: ApiContext): Caller {
  return appRouter.createCaller(ctx);
}
