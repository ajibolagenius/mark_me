"use client";

import type { KeyboardEvent } from "react";
import { tagColor } from "../lib/helpers";

interface TagProps {
  tag: string;
  small?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  count?: number;
}

export function Tag({ tag, small, removable, onRemove, onClick, active, count }: TagProps) {
  const c = tagColor(tag);

  const handleKey = (e: KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <span
      onClick={onClick}
      onKeyDown={handleKey}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? (active ? "true" : "false") : undefined}
      aria-label={onClick ? `Filter by ${tag}${active ? " (active)" : ""}${count !== undefined ? ` (${count})` : ""}` : undefined}
      className="inline-flex cursor-default items-center gap-[4px] whitespace-nowrap font-sans font-bold uppercase tracking-wide outline-none transition-all duration-150"
      style={{
        padding: small ? "2px 7px" : "3px 9px",
        fontSize: small ? 10 : 11,
        background: active ? c : `${c}1A`,
        color: active ? "#0D0D0D" : c,
        border: `1px solid ${active ? c : `${c}35`}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span>{tag}</span>
      {count !== undefined && (
        <span
          style={{
            fontSize: small ? 9 : 10,
            opacity: active ? 0.9 : 0.7,
            fontWeight: 800,
            background: active ? "rgba(0,0,0,0.18)" : `${c}22`,
            padding: "0 4px",
            lineHeight: "13px",
            borderRadius: "2px",
          }}
        >
          {count}
        </span>
      )}
      {removable && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onRemove?.();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Remove tag ${tag}`}
          className="ml-0.5 cursor-pointer text-[13px] leading-none opacity-70"
        >
          &times;
        </span>
      )}
    </span>
  );
}
