"use client";

import { createIdbPersister } from "@/lib/offline/persister";
import { createTrpcClient, trpc } from "@/lib/trpc";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState, type ReactNode } from "react";

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  const path = queryKey[0];
  if (!Array.isArray(path)) return false;
  const joined = path.join(".");
  return joined === "category.list" || joined === "user.me";
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: SEVEN_DAYS,
            refetchOnWindowFocus: false,
            networkMode: "offlineFirst",
          },
          mutations: {
            networkMode: "offlineFirst",
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTrpcClient());
  const [persister] = useState(() => createIdbPersister());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: SEVEN_DAYS,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
              query.state.status === "success" && shouldPersistQuery(query.queryKey),
          },
        }}
      >
        {children}
      </PersistQueryClientProvider>
    </trpc.Provider>
  );
}
