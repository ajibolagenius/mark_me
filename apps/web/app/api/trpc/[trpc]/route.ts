import { createApiContext } from "@/lib/api-context";
import { appRouter } from "@markme/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: ({ req: r }) => createApiContext(r),
  });
}

export { handler as GET, handler as POST };
