"use client";

import React, { useState } from "react";
import { T, ACCENTS } from "../tokens";
import { Tag } from "./tag";
import { FaviconWithFallback } from "./favicon";
import { Highlight } from "./highlight";
import { LinkPreview } from "./link-preview";
import { getDomain, timeAgo } from "../lib/helpers";
import type { FlatBookmarkItem } from "./compact-bookmark-table";

export interface RichBookmarkCardProps {
  bm: FlatBookmarkItem;
  searchQuery?: string;
  onTogglePin: (id: string) => void;
  onEdit: (bm: FlatBookmarkItem) => void;
  onDelete: (id: string, title: string) => void;
  onSelectTag?: (tag: string) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function RichBookmarkCard({
  bm,
  searchQuery = "",
  onTogglePin,
  onEdit,
  onDelete,
  onSelectTag,
  selected = false,
  onToggleSelect,
}: RichBookmarkCardProps) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ac = ACCENTS[bm.categoryColor % ACCENTS.length] || ACCENTS[0];
  const tags = bm.tags || [];
  const visibleTags = tags.slice(0, 3);
  const overflowTags = Math.max(0, tags.length - 3);
  const ago = timeAgo(bm.addedAt);

  const handleCopy = () => {
    navigator.clipboard?.writeText(bm.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? "rgba(212,255,79,0.06)" : T.bgEl,
        border: `1px solid ${selected ? T.primary : hovered ? T.borderStrong : T.border}`,
        boxShadow: selected
          ? `0 0 0 1px ${T.primary}, 6px 6px 0 rgba(0,0,0,0.4)`
          : hovered
            ? "6px 6px 0 rgba(0,0,0,0.4)"
            : "4px 4px 0 rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent top stripe */}
      <div style={{ height: 3, background: ac.bg }} />

      {/* Top subtle glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: ac.bg,
          filter: "blur(40px)",
          opacity: hovered ? 0.15 : 0.08,
          pointerEvents: "none",
          transition: "opacity 0.2s",
        }}
      />

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Category + Selection + Pin Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(bm.id)}
                aria-label={`Select ${bm.title}`}
                style={{ accentColor: T.primary, cursor: "pointer" }}
              />
            )}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                fontWeight: 800,
                color: ac.bg,
                background: `${ac.bg}15`,
                border: `1px solid ${ac.bg}25`,
                padding: "1px 6px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              <span>{bm.categoryIcon}</span>
              <span>{bm.categoryName}</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {ago && <span style={{ fontSize: 10, color: T.textMuted }}>{ago}</span>}
            <button
              type="button"
              onClick={() => onTogglePin(bm.id)}
              aria-label={bm.pinned ? "Unpin bookmark" : "Pin bookmark"}
              style={{
                background: "none",
                border: "none",
                color: bm.pinned ? ac.bg : T.textMuted,
                cursor: "pointer",
                padding: 2,
                display: "inline-flex",
                opacity: bm.pinned ? 1 : 0.4,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={bm.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M16 2L14.5 3.5l1 1-5.5 5.5H6l-1 1 4.5 4.5-5 5.5h1.5l4.5-4 4.5 4.5 1-1v-4l5.5-5.5 1 1L24 8z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title & Favicon */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <FaviconWithFallback url={bm.url} title={bm.title} size={20} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <LinkPreview url={bm.url} title={bm.title}>
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: T.text,
                  textDecoration: "none",
                  display: "block",
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = ac.bg)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.text)}
              >
                <Highlight text={bm.title} query={searchQuery} />
              </a>
            </LinkPreview>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <Highlight text={getDomain(bm.url)} query={searchQuery} />
              </span>
            </div>
          </div>
        </div>

        {/* Note if available */}
        {bm.note && (
          <p
            style={{
              fontSize: 12,
              color: T.textSec,
              lineHeight: 1.45,
              margin: "0 0 10px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <Highlight text={bm.note} query={searchQuery} />
          </p>
        )}

        {/* Tags */}
        <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {visibleTags.map((t) => (
            <Tag
              key={t}
              tag={t}
              small
              onClick={onSelectTag ? () => onSelectTag(t) : undefined}
            />
          ))}
          {overflowTags > 0 && (
            <span
              title={tags.slice(3).join(", ")}
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: T.textMuted,
                background: T.bgInput,
                border: `1px solid ${T.border}`,
                padding: "1px 4px",
                lineHeight: "13px",
              }}
            >
              +{overflowTags}
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          background: T.bgPanel,
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            fontSize: 11,
            fontWeight: 700,
            color: copied ? T.success : T.textMuted,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {copied ? "Copied ✓" : "Copy URL"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a
            href={bm.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open bookmark"
            title="Open in new tab"
            style={{
              color: T.textMuted,
              padding: 4,
              display: "inline-flex",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => onEdit(bm)}
            aria-label="Edit"
            title="Edit bookmark"
            style={{
              background: "none",
              border: "none",
              color: T.textMuted,
              cursor: "pointer",
              padding: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(bm.id, bm.title)}
            aria-label="Delete"
            title="Delete bookmark"
            style={{
              background: "none",
              border: "none",
              color: T.textMuted,
              cursor: "pointer",
              padding: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.error)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
