import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../lib/globals.css";
import { useExtensionAuth } from "../lib/hooks";
import { createExtensionTrpcClient, trpcReact } from "../lib/trpc";
import { Popup } from "./Popup";

function App() {
  const auth = useExtensionAuth();

  const [trpcClient] = useState(() =>
    createExtensionTrpcClient(typeof auth === "object" && auth ? auth.token : null),
  );
  const [queryClient] = useState(() => new QueryClient());

  if (auth === null) {
    // Still loading from storage
    return (
      <div className="flex h-[200px] w-[280px] items-center justify-center bg-mm-bg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-mm-border border-t-mm-primary" />
      </div>
    );
  }

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Popup auth={auth || null} />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
}

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
