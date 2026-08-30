"use client";

import React, { useState } from "react";
import { T, ACCENTS } from "../tokens";
import { Tag } from "./tag";
import { FaviconWithFallback } from "./favicon";
import { Highlight } from "./highlight";
import { LinkPreview } from "./link-preview";
import { getDomain, timeAgo } from "../lib/helpers";

export interface FlatBookmarkItem {
  id: string;
  title: string;
  url: string;
  note?: string | null;
  tags?: string[];
  pinned?: boolean;
  addedAt?: number | null;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: number;
}

export interface CompactBookmarkTableProps {
  items: FlatBookmarkItem[];
  searchQuery?: string;
  onTogglePin: (id: string) => void;
  onEdit: (bm: FlatBookmarkItem) => void;
  onDelete: (id: string, title: string) => void;
  onSelectTag?: (tag: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
}

export function CompactBookmarkTable({
  items,
  searchQuery = "",
  onTogglePin,
  onEdit,
  onDelete,
  onSelectTag,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
}: CompactBookmarkTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isAllSelected = items.length > 0 && items.every((bm) => selectedIds.includes(bm.id));
  const hasSomeSelected = selectedIds.length > 0;

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", background: T.bgEl, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>🔍</div>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.textSec, marginBottom: 4 }}>No bookmarks found</p>
        <p style={{ fontSize: 12, color: T.textMuted }}>Try adjusting your search or active filters</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.bgEl,
        border: `1px solid ${T.border}`,
        overflowX: "auto",
        boxShadow: "4px 4px 0 rgba(0,0,0,0.25)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: 12,
          fontFamily: T.font,
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${T.border}`,
              background: T.bgPanel,
              color: T.textMuted,
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <th style={{ padding: "10px 14px", width: 50, textAlign: "center" }}>
              {onSelectAll ? (
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  aria-label="Select all bookmarks"
                  style={{ accentColor: T.primary, cursor: "pointer" }}
                />
              ) : (
                "#"
              )}
            </th>
            <th style={{ padding: "10px 12px" }}>Bookmark</th>
            <th style={{ padding: "10px 12px", width: 140 }}>Category</th>
            <th style={{ padding: "10px 12px", width: 150 }}>Domain</th>
            <th style={{ padding: "10px 12px", width: 180 }}>Tags</th>
            <th style={{ padding: "10px 12px", width: 90 }}>Added</th>
            <th style={{ padding: "10px 14px", width: 120, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((bm, index) => {
            const ac = ACCENTS[bm.categoryColor % ACCENTS.length] || ACCENTS[0];
            const isCopied = copiedId === bm.id;
            const isSelected = selectedIds.includes(bm.id);
            const tags = bm.tags || [];
            const visibleTags = tags.slice(0, 2);
            const overflowTagCount = Math.max(0, tags.length - 2);
            const ago = timeAgo(bm.addedAt);

            return (
              <tr
                key={bm.id}
                style={{
                  borderBottom: `1px solid ${T.border}`,
                  transition: "background 0.12s ease",
                  background: isSelected
                    ? "rgba(212,255,79,0.09)"
                    : bm.pinned
                      ? "rgba(212,255,79,0.03)"
                      : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected
                    ? "rgba(212,255,79,0.09)"
                    : bm.pinned
                      ? "rgba(212,255,79,0.03)"
                      : "transparent";
                }}
              >
                {/* Checkbox / Pin */}
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {onToggleSelect && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(bm.id)}
                        aria-label={`Select ${bm.title}`}
                        style={{ accentColor: T.primary, cursor: "pointer" }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onTogglePin(bm.id)}
                      title={bm.pinned ? "Unpin bookmark" : "Pin bookmark"}
                      aria-label={bm.pinned ? "Unpin bookmark" : "Pin bookmark"}
                      style={{
                        background: "none",
                        border: "none",
                        color: bm.pinned ? ac.bg : T.textMuted,
                        cursor: "pointer",
                        padding: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: bm.pinned ? 1 : 0.4,
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = bm.pinned ? "1" : "0.4")}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={bm.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M16 2L14.5 3.5l1 1-5.5 5.5H6l-1 1 4.5 4.5-5 5.5h1.5l4.5-4 4.5 4.5 1-1v-4l5.5-5.5 1 1L24 8z" />
                      </svg>
                    </button>
                  </div>
                </td>

                {/* Bookmark Title & Link */}
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaviconWithFallback url={bm.url} title={bm.title} size={16} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <LinkPreview url={bm.url} title={bm.title}>
                        <a
                          href={bm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: T.text,
                            textDecoration: "none",
                            display: "inline-block",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            letterSpacing: "-0.01em",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = ac.bg)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = T.text)}
                        >
                          <Highlight text={bm.title} query={searchQuery} />
                        </a>
                      </LinkPreview>
                      {bm.note && (
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Highlight text={bm.note} query={searchQuery} />
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td style={{ padding: "8px 12px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: ac.bg,
                      background: `${ac.bg}18`,
                      border: `1px solid ${ac.bg}30`,
                      padding: "2px 7px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{bm.categoryIcon}</span>
                    <span>{bm.categoryName}</span>
                  </span>
                </td>

                {/* Domain */}
                <td style={{ padding: "8px 12px", color: T.textMuted, fontSize: 11 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                    <Highlight text={getDomain(bm.url)} query={searchQuery} />
                  </span>
                </td>

                {/* Tags */}
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap" }}>
                    {visibleTags.map((t) => (
                      <Tag
                        key={t}
                        tag={t}
                        small
                        onClick={onSelectTag ? () => onSelectTag(t) : undefined}
                      />
                    ))}
                    {overflowTagCount > 0 && (
                      <span
                        title={tags.slice(2).join(", ")}
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: T.textMuted,
                          background: T.bgInput,
                          border: `1px solid ${T.border}`,
                          padding: "1px 4px",
                          lineHeight: "13px",
                          cursor: "help",
                        }}
                      >
                        +{overflowTagCount}
                      </span>
                    )}
                  </div>
                </td>

                {/* Added Date */}
                <td style={{ padding: "8px 12px", color: T.textMuted, fontSize: 11, whiteSpace: "nowrap" }}>
                  {ago || "—"}
                </td>

                {/* Actions */}
                <td style={{ padding: "8px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(bm.id, bm.url)}
                      aria-label={isCopied ? "URL copied" : "Copy URL"}
                      title={isCopied ? "URL copied!" : "Copy URL"}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: isCopied ? T.success : T.textMuted,
                        cursor: "pointer",
                        padding: 4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = isCopied ? T.success : T.textMuted)}
                    >
                      {isCopied ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <rect x="9" y="9" width="13" height="13" rx="0" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open bookmark in new tab"
                      title="Open in new tab"
                      style={{
                        color: T.textMuted,
                        padding: 4,
                        display: "inline-flex",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      onClick={() => onEdit(bm)}
                      aria-label="Edit bookmark"
                      title="Edit bookmark"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: T.textMuted,
                        cursor: "pointer",
                        padding: 4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(bm.id, bm.title)}
                      aria-label="Delete bookmark"
                      title="Delete bookmark"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: T.textMuted,
                        cursor: "pointer",
                        padding: 4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = T.error)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
