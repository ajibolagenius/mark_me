import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../lib/globals.css";
import { useExtensionAuth } from "../lib/hooks";
import { createExtensionTrpcClient, trpcReact } from "../lib/trpc";
import { NewTab } from "./NewTab";

function App() {
  const auth = useExtensionAuth();

  const token = typeof auth === "object" && auth ? auth.token : null;

  const [trpcClient] = useState(() => createExtensionTrpcClient(token));
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

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
