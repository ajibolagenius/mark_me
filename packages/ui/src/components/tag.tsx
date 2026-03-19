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
}

export function Tag({ tag, small, removable, onRemove, onClick, active }: TagProps) {
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
      aria-label={onClick ? `Filter by ${tag}${active ? " (active)" : ""}` : undefined}
      className="inline-flex cursor-default items-center gap-[3px] whitespace-nowrap font-sans font-bold uppercase tracking-wide outline-none transition-all duration-150"
      style={{
        padding: small ? "2px 8px" : "3px 10px",
        fontSize: small ? 10 : 11,
        background: active ? c : `${c}20`,
        color: active ? "#0D0D0D" : c,
        border: `1px solid ${active ? c : `${c}30`}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {tag}
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
