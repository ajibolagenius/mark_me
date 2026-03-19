"use client";

import { useState } from "react";
import { TAG_COLORS } from "../tokens";
import { getDomain, getFavicon } from "../lib/helpers";

interface FaviconProps {
  url: string;
  title?: string;
  size?: number;
}

export function FaviconWithFallback({ url, title, size = 20 }: FaviconProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const letter = (title || getDomain(url) || "?")[0]?.toUpperCase() ?? "?";
  const hash = (title || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = TAG_COLORS[hash % TAG_COLORS.length];

  return (
    <div className="relative mt-0.5 shrink-0" style={{ width: size, height: size }}>
      {state === "loading" && (
        <div
          className="absolute inset-0 animate-[mmShimmer_1.2s_ease_infinite] bg-mm-bg-input"
          aria-hidden="true"
          style={{
            backgroundImage: "linear-gradient(90deg, var(--color-mm-bg-input) 25%, rgba(255,255,255,0.06) 50%, var(--color-mm-bg-input) 75%)",
            backgroundSize: "200% 100%",
          }}
        />
      )}
      {state === "error" && (
        <div
          aria-hidden="true"
          className="flex items-center justify-center font-sans font-extrabold leading-none"
          style={{
            width: size,
            height: size,
            background: `${color}25`,
            border: `1px solid ${color}40`,
            fontSize: size * 0.5,
            color,
          }}
        >
          {letter}
        </div>
      )}
      {state !== "error" && (
        <img
          src={getFavicon(url)}
          alt=""
          width={size}
          height={size}
          className="block transition-opacity duration-200"
          style={{ opacity: state === "loaded" ? 1 : 0 }}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}
    </div>
  );
}
