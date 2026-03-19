import { useEffect, useState } from "react";
import { type AuthState, getAuth } from "./storage";

/**
 * Reads the extension's auth state from chrome.storage.sync.
 * Returns `null` while loading, `false` if not authenticated, or the AuthState.
 */
export function useExtensionAuth(): AuthState | null | false {
  const [auth, setAuth] = useState<AuthState | null | false>(null);

  useEffect(() => {
    getAuth().then((a) => setAuth(a ?? false));

    // Re-read if storage changes (e.g. background SW stores a new token)
    const listener = () => {
      getAuth().then((a) => setAuth(a ?? false));
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return auth;
}

/** Returns the web app URL for opening tabs. */
export function getWebAppUrl(): string {
  return (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";
}
