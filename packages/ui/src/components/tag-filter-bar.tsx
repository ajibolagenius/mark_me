"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { T } from "../tokens";
import { Tag } from "./tag";

export interface TagWithCount {
  tag: string;
  count: number;
}

export interface TagFilterBarProps {
  tags?: string[];
  allTags?: string[];
  tagCounts?: Record<string, number>;
  selectedTag?: string | null;
  activeTag?: string | null;
  onSelectTag: (tag: string | null) => void;
  maxVisible?: number;
  maxVisibleTags?: number;
  onOpenJunkCleaner?: () => void;
}

export function TagFilterBar({
  tags,
  allTags,
  tagCounts: propTagCounts,
  selectedTag,
  activeTag,
  onSelectTag,
  maxVisible,
  maxVisibleTags,
  onOpenJunkCleaner,
}: TagFilterBarProps) {
  const tagList = tags ?? allTags ?? [];
  const active = selectedTag !== undefined ? selectedTag : (activeTag ?? null);
  const max = maxVisible ?? maxVisibleTags ?? 8;

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"count" | "alpha">("count");
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Compute tag frequencies
  const tagCounts = useMemo(() => {
    if (propTagCounts) return propTagCounts;
    const counts: Record<string, number> = {};
    if (Array.isArray(tagList)) {
      for (const t of tagList) {
        if (!t) continue;
        const normalized = String(t).trim().toLowerCase();
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }
    return counts;
  }, [tagList, propTagCounts]);

  // Unique sorted tags by frequency
  const sortedTags: TagWithCount[] = useMemo(() => {
    const list = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
    list.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    return list;
  }, [tagCounts]);

  const topTags = useMemo(() => sortedTags.slice(0, max), [sortedTags, max]);
  const hasMore = sortedTags.length > max;
  const remainingCount = Math.max(0, sortedTags.length - max);

  // Popover search and filter
  const filteredPopoverTags = useMemo(() => {
    let list = sortedTags;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((item) => item.tag.toLowerCase().includes(q));
    }
    if (sortOrder === "alpha") {
      return [...list].sort((a, b) => a.tag.localeCompare(b.tag));
    }
    return list;
  }, [sortedTags, searchQuery, sortOrder]);

  // Is selected tag outside top tags?
  const isSelectedOutsideTop =
    active !== null && !topTags.some((t) => t.tag.toLowerCase() === active.toLowerCase());

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!popoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopoverOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [popoverOpen]);

  if (sortedTags.length === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Filter bookmarks by tag"
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        position: "relative",
        minWidth: 0,
      }}
    >
      {/* ALL button */}
      <Tag
        tag="ALL"
        small
        active={active === null}
        onClick={() => onSelectTag(null)}
      />

      {/* Top Most Frequent Tags */}
      {topTags.map(({ tag, count }) => (
        <Tag
          key={tag}
          tag={tag}
          small
          count={count}
          active={active?.toLowerCase() === tag.toLowerCase()}
          onClick={() => onSelectTag(active?.toLowerCase() === tag.toLowerCase() ? null : tag)}
        />
      ))}

      {/* If selected tag is not in top N, display it prominently as active */}
      {isSelectedOutsideTop && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Tag
            tag={active}
            small
            active
            count={tagCounts[active.toLowerCase()] || 1}
            onClick={() => onSelectTag(null)}
          />
        </div>
      )}

      {/* More Tags Popover Trigger */}
      {hasMore && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setPopoverOpen(!popoverOpen)}
            aria-expanded={popoverOpen}
            aria-label={`View all ${sortedTags.length} tags`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: T.font,
              background: popoverOpen ? T.bgPanel : T.bgInput,
              color: popoverOpen ? T.text : T.textSec,
              border: `1px solid ${popoverOpen ? T.primary : T.border}`,
              cursor: "pointer",
              transition: "all 0.15s",
              borderRadius: 0,
            }}
          >
            <span>+{remainingCount} more</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                transform: popoverOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.15s",
              }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Searchable Tags Popover */}
          {popoverOpen && (
            <div
              ref={popoverRef}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                width: 320,
                maxWidth: "90vw",
                maxHeight: 380,
                background: T.bgEl,
                border: `1px solid ${T.borderStrong}`,
                boxShadow: "0 12px 32px rgba(0,0,0,0.6), 4px 4px 0 rgba(0,0,0,0.3)",
                zIndex: 600,
                display: "flex",
                flexDirection: "column",
                animation: "mmFadeIn 0.15s ease",
              }}
            >
              {/* Popover Header & Search */}
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: `1px solid ${T.border}`,
                  background: T.bgPanel,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    All Tags ({sortedTags.length})
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === "count" ? "alpha" : "count")}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 10,
                        fontWeight: 700,
                        color: T.primary,
                        cursor: "pointer",
                        padding: "2px 4px",
                      }}
                    >
                      {sortOrder === "count" ? "Sort: Count" : "Sort: A-Z"}
                    </button>
                    {onOpenJunkCleaner && (
                      <button
                        type="button"
                        onClick={() => {
                          setPopoverOpen(false);
                          onOpenJunkCleaner();
                        }}
                        title="Clean stop words and junk tags"
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.warning,
                          cursor: "pointer",
                          padding: "2px 4px",
                        }}
                      >
                        🧹 Clean
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: T.bgInput,
                    border: `1px solid ${T.border}`,
                    padding: "4px 8px",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: T.textMuted }}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tags..."
                    autoFocus
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: 12,
                      fontFamily: T.font,
                      background: "transparent",
                      color: T.text,
                      flex: 1,
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 0 }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Tags Scroll Area */}
              <div
                style={{
                  padding: "10px 12px",
                  overflowY: "auto",
                  maxHeight: 250,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                }}
              >
                {filteredPopoverTags.length === 0 ? (
                  <div style={{ padding: "16px 0", width: "100%", textAlign: "center", fontSize: 11, color: T.textMuted }}>
                    No tags match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredPopoverTags.map(({ tag, count }) => (
                    <Tag
                      key={tag}
                      tag={tag}
                      small
                      count={count}
                      active={active?.toLowerCase() === tag.toLowerCase()}
                      onClick={() => {
                        onSelectTag(active?.toLowerCase() === tag.toLowerCase() ? null : tag);
                        setPopoverOpen(false);
                      }}
                    />
                  ))
                )}
              </div>

              {/* Popover Footer */}
              {active && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderTop: `1px solid ${T.border}`,
                    background: T.bgPanel,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 10, color: T.textMuted }}>Active: #{active}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTag(null);
                      setPopoverOpen(false);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.error,
                      cursor: "pointer",
                    }}
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
