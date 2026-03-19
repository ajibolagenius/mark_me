/**
 * tRPC clients for the extension.
 *
 * - `createVanillaClient(token)` – used by the background service worker (no React)
 * - `trpcReact` + `createExtensionTrpcClient(token)` – used by popup and newtab (React + React Query)
 */
import type { AppRouter } from "@markme/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

function getApiUrl(): string {
  return (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";
}

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Vanilla tRPC client (for service worker, no React context needed). */
export function createVanillaClient(token: string | null) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getApiUrl()}/api/trpc`,
        transformer: superjson,
        headers: () => authHeaders(token),
      }),
    ],
  });
}

/** React tRPC instance — import this in popup and newtab. */
export const trpcReact = createTRPCReact<AppRouter>();

/** Creates the tRPC client for React providers. */
export function createExtensionTrpcClient(token: string | null) {
  return trpcReact.createClient({
    links: [
      httpBatchLink({
        url: `${getApiUrl()}/api/trpc`,
        transformer: superjson,
        headers: () => authHeaders(token),
      }),
    ],
  });
}
