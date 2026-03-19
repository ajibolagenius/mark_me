import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../lib/globals.css";
import type { AuthState } from "../lib/storage";
import { useExtensionAuth } from "../lib/hooks";
import { createExtensionTrpcClient, trpcReact } from "../lib/trpc";
import { Popup } from "./Popup";

/**
 * Mounted only after auth has resolved from chrome.storage.
 * `useState` here fires once with the real token, not null.
 */
function AuthenticatedProviders({ token, auth }: { token: string | null; auth: AuthState | false }) {
  const [trpcClient] = useState(() => createExtensionTrpcClient(token));
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Popup auth={auth || null} />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
}

function App() {
  const auth = useExtensionAuth();

  // auth === null means storage is still being read — hold off mounting providers
  if (auth === null) {
    return (
      <div className="flex h-[200px] w-[280px] items-center justify-center bg-mm-bg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-mm-border border-t-mm-primary" />
      </div>
    );
  }

  return <AuthenticatedProviders token={auth ? auth.token : null} auth={auth} />;
}

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
