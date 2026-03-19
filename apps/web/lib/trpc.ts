import type { AppRouter } from "@markme/api";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

function getTrpcUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/trpc`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/trpc`;
  }
  return `http://localhost:${process.env.PORT ?? "3000"}/api/trpc`;
}

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getTrpcUrl(),
        transformer: superjson,
      }),
    ],
  });
}
