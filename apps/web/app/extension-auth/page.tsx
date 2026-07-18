"use client";

import { Logo, T } from "@markme/ui";
import { authClient } from "@/lib/auth/client";
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

      const { token, userId, expiresAt } = (await res.json()) as {
        token: string;
        userId: string;
        expiresAt: number;
      };

      const runtime = window.chrome?.runtime;
      if (!runtime?.sendMessage) {
        throw new Error(
          "Chrome extension API unavailable. Open this page from the extension’s Connect button (Chrome required).",
        );
      }

      await new Promise<void>((resolve, reject) => {
        runtime.sendMessage(
          extId,
          { type: "MARKME_AUTH", token, userId, expiresAt },
          (response) => {
            if (runtime.lastError) {
              reject(new Error(runtime.lastError.message || "Extension did not respond"));
              return;
            }
            if (
              typeof response === "object" &&
              response !== null &&
              (response as { ok?: boolean }).ok
            ) {
              resolve();
              return;
            }
            reject(new Error("Extension rejected the auth token"));
          },
        );
      });

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
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        fontFamily: T.font,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: 400, maxWidth: "100%", textAlign: "center" }}>
        <Logo size={36} />
        <h1
          style={{
            marginTop: 28,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          Connect extension
        </h1>
        <p style={{ marginTop: 10, fontSize: 14, color: T.textSec, lineHeight: 1.5 }}>
          Link this Chrome extension to your mark_me account so you can save bookmarks from any
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
            minHeight: "100vh",
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
