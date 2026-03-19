import { aiRouter } from "./routers/ai";
import { bookmarkRouter } from "./routers/bookmark";
import { categoryRouter } from "./routers/category";
import { exportRouter } from "./routers/export";
import { tagRouter } from "./routers/tag";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  category: categoryRouter,
  bookmark: bookmarkRouter,
  tag: tagRouter,
  user: userRouter,
  ai: aiRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
