"use client";

/**
 * /extension-auth?ext=<extensionId>
 *
 * Opened by the Chrome extension when the user clicks "Connect to mark_me".
 * If the user is already logged in, fetches a short-lived extension token and
 * sends it to the extension via chrome.runtime.sendMessage (externally_connectable).
 * If not logged in, redirects to the login page and returns here afterward.
 */

import { Logo } from "@markme/ui";
import { BookmarkCheck, Loader2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Status = "loading" | "success" | "no-extension" | "not-logged-in" | "error";

function ExtensionAuthInner() {
  const params = useSearchParams();
  const extId = params.get("ext");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!extId) {
      setStatus("no-extension");
      return;
    }

    async function connect() {
      try {
        // Get extension token from the API
        const res = await fetch("/api/extension-token");

        if (res.status === 401) {
          // Not logged in — redirect to login, return here after
          const returnUrl = `/extension-auth?ext=${extId}`;
          window.location.href = `/login?callbackUrl=${encodeURIComponent(returnUrl)}`;
          return;
        }

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = (await res.json()) as {
          token: string;
          userId: string;
          expiresAt: number;
        };

        // Send token to extension via externally_connectable
        type ChromeRuntime = {
          runtime: {
            sendMessage(extId: string, msg: unknown, cb: (r: unknown) => void): void;
            lastError?: { message: string };
          };
        };
        const chrome = (window as Window & { chrome?: ChromeRuntime }).chrome;
        if (!chrome?.runtime?.sendMessage) {
          setStatus("no-extension");
          return;
        }

        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage(
            extId!,
            { type: "MARKME_AUTH", ...data },
            (response: unknown) => {
              if (chrome.runtime.lastError || !response || !(response as { ok?: boolean }).ok) {
                reject(new Error("Extension did not acknowledge"));
              } else {
                resolve();
              }
            },
          );
        });

        setStatus("success");

        // Close this tab after a short delay
        setTimeout(() => window.close(), 2000);
      } catch {
        setStatus("error");
      }
    }

    connect();
  }, [extId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mm-bg px-5">
      <div className="flex flex-col items-center gap-5 text-center">
        <Logo size={36} />

        {status === "loading" && (
          <>
            <Loader2 size={28} className="animate-spin text-mm-primary" />
            <p className="text-[15px] font-semibold text-mm-text">Connecting extension…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center bg-mm-success/10 text-mm-success">
              <BookmarkCheck size={28} />
            </div>
            <div>
              <p className="text-[18px] font-extrabold text-mm-text">mark_me connected!</p>
              <p className="mt-1 text-[14px] text-mm-text-muted">
                You can now save bookmarks from any page. This tab will close automatically.
              </p>
            </div>
          </>
        )}

        {status === "no-extension" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center bg-mm-warning/10 text-mm-warning">
              <X size={28} />
            </div>
            <div>
              <p className="text-[18px] font-extrabold text-mm-text">Extension not detected</p>
              <p className="mt-1 text-[14px] text-mm-text-muted">
                Make sure the mark_me extension is installed and try again.
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center bg-mm-error/10 text-mm-error">
              <X size={28} />
            </div>
            <div>
              <p className="text-[18px] font-extrabold text-mm-text">Connection failed</p>
              <p className="mt-1 mb-4 text-[14px] text-mm-text-muted">
                Something went wrong. Please close this tab and try again.
              </p>
              <button
                type="button"
                onClick={() => window.close()}
                className="bg-mm-primary px-5 py-2.5 text-[13px] font-bold text-white"
              >
                Close tab
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ExtensionAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-mm-bg">
          <Loader2 size={28} className="animate-spin text-mm-primary" />
        </div>
      }
    >
      <ExtensionAuthInner />
    </Suspense>
  );
}
