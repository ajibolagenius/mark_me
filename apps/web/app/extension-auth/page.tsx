"use client";

import { authClient } from "@/lib/auth/client";
import { Logo, T } from "@markme/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type Status = "loading" | "need_login" | "connecting" | "success" | "error";

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          responseCallback?: (response: unknown) => void,
        ) => void;
        lastError?: { message?: string };
      };
    };
  }
}

interface TokenPayload {
  token: string;
  userId: string;
  expiresAt: number;
}

/** Chrome/Chromium path: message the extension directly via externally_connectable. */
function sendViaExternalMessage(
  runtime: NonNullable<NonNullable<Window["chrome"]>["runtime"]>,
  extId: string,
  payload: TokenPayload,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    runtime.sendMessage(extId, { type: "MARKME_AUTH", ...payload }, (response) => {
      if (runtime.lastError) {
        reject(new Error(runtime.lastError.message || "Extension did not respond"));
        return;
      }
      if (typeof response === "object" && response !== null && (response as { ok?: boolean }).ok) {
        resolve();
        return;
      }
      reject(new Error("Extension rejected the auth token"));
    });
  });
}

/**
 * Firefox path (works everywhere the auth-bridge content script is injected):
 * post the token to the page; the extension's content script relays it to the
 * background script and posts MARKME_AUTH_RESULT back.
 */
function sendViaBridge(payload: TokenPayload): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const post = () =>
      window.postMessage(
        { source: "markme-web", type: "MARKME_AUTH", ...payload },
        window.location.origin,
      );

    // The bridge content script may attach after our first post — keep
    // re-posting until it acknowledges (saving the token is idempotent).
    const repost = window.setInterval(post, 500);
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Extension didn’t respond. Make sure the mark_me extension is installed, then try again.",
        ),
      );
    }, 5000);

    function cleanup() {
      window.clearInterval(repost);
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
    }

    function onMessage(event: MessageEvent) {
      const data = event.data as { source?: string; type?: string; ok?: boolean } | null;
      if (event.origin !== window.location.origin || typeof data !== "object" || data === null)
        return;
      if (data.source !== "markme-extension" || data.type !== "MARKME_AUTH_RESULT") return;
      cleanup();
      if (data.ok) resolve();
      else reject(new Error("Extension rejected the auth token"));
    }

    window.addEventListener("message", onMessage);
    post();
  });
}

/** Prefer the direct Chromium path, fall back to the content-script bridge. */
async function deliverToken(extId: string, payload: TokenPayload): Promise<void> {
  const runtime = window.chrome?.runtime;
  if (runtime?.sendMessage) {
    try {
      await sendViaExternalMessage(runtime, extId, payload);
      return;
    } catch {
      // fall through to the bridge
    }
  }
  await sendViaBridge(payload);
}

function ExtensionAuthInner() {
  const searchParams = useSearchParams();
  const extId = searchParams.get("ext")?.trim() ?? "";
  const { data: session, isPending } = authClient.useSession();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  const connect = useCallback(async () => {
    if (!extId) {
      setStatus("error");
      setError("Missing extension id. Re-open Connect from the mark_me extension.");
      return;
    }

    setStatus("connecting");
    setError("");

    try {
      const res = await fetch("/api/extension-token", { credentials: "include" });
      if (res.status === 401) {
        setStatus("need_login");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Token request failed (${res.status})`);
      }

      const payload = (await res.json()) as TokenPayload;
      await deliverToken(extId, payload);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not connect the extension");
    }
  }, [extId]);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setStatus("need_login");
      return;
    }
    void connect();
  }, [isPending, session?.user, connect]);

  const loginHref = `/login?next=${encodeURIComponent(
    `/extension-auth?ext=${encodeURIComponent(extId)}`,
  )}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: T.bg,
        color: T.text,
        fontFamily: T.font,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          width: 420,
          height: 420,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: T.primary,
          opacity: 0.05,
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", width: 420, maxWidth: "100%", textAlign: "center" }}>
        <Logo size={40} />
        <h1
          style={{
            marginTop: 28,
            fontSize: "clamp(1.5rem, 4vw, 1.75rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          Connect extension
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 15,
            color: T.textSec,
            lineHeight: 1.55,
            maxWidth: 360,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Link the browser extension to your mark_me account so you can save bookmarks from any
          page.
        </p>

        {(status === "loading" || status === "connecting") && (
          <p style={{ marginTop: 28, fontSize: 13, color: T.textMuted, fontWeight: 600 }}>
            {status === "connecting" ? "Sending token to extension…" : "Checking session…"}
          </p>
        )}

        {status === "need_login" && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 13, color: T.textSec, marginBottom: 16 }}>
              Sign in to continue. You’ll return here to finish connecting.
            </p>
            <a
              href={loginHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: T.primary,
                color: T.onPrimary,
                padding: "12px 22px",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "3px 3px 0 rgba(0,0,0,0.4)",
              }}
            >
              Sign in to connect →
            </a>
          </div>
        )}

        {status === "success" && (
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                background: `${T.success}18`,
                border: `1px solid ${T.success}40`,
                color: T.success,
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              ✓
            </div>
            <p style={{ fontSize: 15, fontWeight: 800 }}>Extension connected</p>
            <p style={{ marginTop: 8, fontSize: 13, color: T.textSec }}>
              You can close this tab and use the mark_me toolbar icon or new tab page.
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={{ marginTop: 28 }}>
            <p
              role="alert"
              style={{
                fontSize: 13,
                color: T.error,
                fontWeight: 600,
                padding: "10px 14px",
                background: `${T.error}15`,
                border: `1px solid ${T.error}30`,
                marginBottom: 16,
                textAlign: "left",
              }}
            >
              {error}
            </p>
            <button
              type="button"
              onClick={() => void connect()}
              style={{
                border: "none",
                cursor: "pointer",
                background: T.primary,
                color: T.onPrimary,
                padding: "12px 22px",
                fontSize: 13,
                fontWeight: 800,
                boxShadow: "3px 3px 0 rgba(0,0,0,0.4)",
                fontFamily: T.font,
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExtensionAuthPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: T.bg,
            color: T.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: T.font,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Loading…
        </div>
      }
    >
      <ExtensionAuthInner />
    </Suspense>
  );
}
