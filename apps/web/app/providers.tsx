"use client";

import { SessionSync } from "@/components/session-sync";
import { createTrpcClient, trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type ReactNode, useState } from "react";

export function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session?: Session | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000 },
          mutations: { retry: 1 },
        },
      }),
  );
  const [trpcClient] = useState(() => createTrpcClient());

  return (
    <SessionProvider session={session}>
      <SessionSync />
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          {children}
        </trpc.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
