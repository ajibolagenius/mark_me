import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../lib/globals.css";
import type { AuthState } from "../lib/storage";
import { useExtensionAuth } from "../lib/hooks";
import { createExtensionTrpcClient, trpcReact } from "../lib/trpc";
import { NewTab } from "./NewTab";

function AuthenticatedProviders({ auth }: { auth: AuthState | false }) {
  const [trpcClient] = useState(() => createExtensionTrpcClient(auth ? auth.token : null));
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NewTab auth={auth} />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
}

function App() {
  const auth = useExtensionAuth();

  if (auth === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mm-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-mm-border border-t-mm-primary" />
      </div>
    );
  }

  const key = auth ? auth.token : "anon";
  return <AuthenticatedProviders key={key} auth={auth} />;
}

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
