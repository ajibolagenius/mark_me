"use client";

import React from "react";
import { T } from "../tokens";

export type ViewMode = "grid" | "list" | "cards";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  const options: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      id: "grid",
      label: "Grid",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: "list",
      label: "List",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: "cards",
      label: "Cards",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="7" rx="0" />
          <rect x="3" y="14" width="18" height="7" rx="0" />
        </svg>
      ),
    },
  ];

  return (
    <div
      role="group"
      aria-label="View display mode"
      style={{
        display: "inline-flex",
        background: T.bgInput,
        border: `1px solid ${T.border}`,
        padding: 2,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            title={`${opt.label} view`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: T.font,
              background: active ? T.primary : "transparent",
              color: active ? T.onPrimary : T.textMuted,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.color = T.text;
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.color = T.textMuted;
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {opt.icon}
            <span className="hidden sm:inline" style={{ fontSize: 11 }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
