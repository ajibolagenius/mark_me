/**
 * Auth bridge content script.
 *
 * Firefox has no `externally_connectable`, so the web app can't message the
 * extension directly. This script runs only on the /extension-auth page
 * (see manifest `content_scripts.matches`) and relays the token:
 *
 *   page --window.postMessage--> bridge --runtime.sendMessage--> background
 *
 * Chrome loads it too; the page prefers the direct externally_connectable
 * path when available and falls back to this bridge otherwise.
 *
 * Must stay dependency-free: content scripts are classic scripts, so the
 * built file may not contain ESM imports.
 */

interface AuthMessage {
  source: "markme-web";
  type: "MARKME_AUTH";
  token: string;
  userId: string;
  expiresAt: number;
}

function isAuthMessage(data: unknown): data is AuthMessage {
  if (typeof data !== "object" || data === null) return false;
  const m = data as Record<string, unknown>;
  return (
    m.source === "markme-web" &&
    m.type === "MARKME_AUTH" &&
    typeof m.token === "string" &&
    typeof m.userId === "string" &&
    typeof m.expiresAt === "number"
  );
}

window.addEventListener("message", (event: MessageEvent) => {
  // Only accept messages from the page itself, same origin.
  if (event.source !== window || event.origin !== window.location.origin) return;
  if (!isAuthMessage(event.data)) return;

  const { token, userId, expiresAt } = event.data;
  chrome.runtime.sendMessage({ type: "MARKME_AUTH", token, userId, expiresAt }, (response) => {
    const ok =
      !chrome.runtime.lastError &&
      typeof response === "object" &&
      response !== null &&
      (response as { ok?: boolean }).ok === true;
    window.postMessage(
      { source: "markme-extension", type: "MARKME_AUTH_RESULT", ok },
      window.location.origin,
    );
  });
});

// Let the page know a bridge is present (Firefox flow detection).
window.postMessage(
  { source: "markme-extension", type: "MARKME_BRIDGE_READY" },
  window.location.origin,
);
