"use client";

import { BookmarkModal } from "@/components/bookmark-modal";
import { BookmarkRow } from "@/components/bookmark-row";
import { ACCENTS, AnimatedCollapse, Highlight, SwipeRow, Tag, useIsMobile } from "@markme/ui";
import type { Bookmark as BookmarkType, Category } from "@markme/ui";
import { Bookmark, ChevronDown, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

export interface BookmarkPayload {
  title: string;
  url: string;
  note?: string;
  tags: string[];
}

interface CategoryCardProps {
  cat: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onDeleteBm: (catId: string, bmId: string, bmTitle: string) => void;
  onAddBookmark: (categoryId: string, data: BookmarkPayload) => void;
  onUpdateBookmark: (categoryId: string, bookmarkId: string, data: BookmarkPayload) => void;
  onTogglePinBookmark: (bookmarkId: string) => void;
  allTags: string[];
  searchQuery: string;
}

export const CategoryCard = React.memo(function CategoryCard({
  cat,
  onDelete,
  onEdit,
  onDeleteBm,
  onAddBookmark,
  onUpdateBookmark,
  onTogglePinBookmark,
  allTags,
  searchQuery,
}: CategoryCardProps) {
  const [exp, setExp] = useState(true);
  const [addBm, setAddBm] = useState(false);
  const [editBm, setEditBm] = useState<BookmarkType | null>(null);

  const ac = ACCENTS[cat.color] ?? ACCENTS[0];
  const sorted = [...cat.bookmarks].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const isMobile = useIsMobile();
  const q = searchQuery ?? "";
  const isEmpty = cat.bookmarks.length === 0;
  const pinnedCount = cat.bookmarks.filter((b) => b.pinned).length;

  return (
    <article
      aria-label={`${cat.name} category — ${cat.bookmarks.length} bookmark${cat.bookmarks.length !== 1 ? "s" : ""}`}
      className="relative mb-4 overflow-hidden border border-mm-border bg-mm-bg-el shadow-[4px_4px_0_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:border-mm-border-strong hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)]"
    >
      <div className="h-[3px]" style={{ background: ac.bg }} aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[120px] w-[120px] rounded-full opacity-[0.12] blur-[60px]"
        style={{ background: ac.bg }}
        aria-hidden="true"
      />
      <div className="relative px-[18px] pb-3 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="text-[22px] leading-none" aria-hidden="true">
              {cat.icon}
            </span>
            <div className="min-w-0">
              <h3 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[15px] font-extrabold tracking-[-0.03em] text-mm-text">
                <Highlight text={cat.name} query={q} />
              </h3>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  aria-label={`${cat.bookmarks.length} bookmark${cat.bookmarks.length !== 1 ? "s" : ""}`}
                  className="inline-flex items-center gap-1 px-[7px] py-px font-sans text-[10px] font-bold tracking-[0.02em]"
                  style={{
                    background: `${ac.bg}18`,
                    color: ac.bg,
                    border: `1px solid ${ac.bg}30`,
                  }}
                >
                  <Bookmark size={12} /> {cat.bookmarks.length}
                </span>
                {pinnedCount > 0 && (
                  <span
                    aria-label={`${pinnedCount} pinned`}
                    className="inline-flex items-center gap-1 border border-mm-warning/20 bg-mm-warning/10 px-[7px] py-px font-sans text-[10px] font-bold tracking-[0.02em] text-mm-warning"
                  >
                    <Pin size={12} /> {pinnedCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-0.5" role="toolbar" aria-label={`${cat.name} actions`}>
            <button
              type="button"
              onClick={() => onEdit(cat)}
              aria-label={`Edit ${cat.name}`}
              className="rounded p-1.5 text-mm-text-muted transition-colors hover:text-mm-text"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(cat)}
              aria-label={`Delete ${cat.name}`}
              className="rounded p-1.5 text-mm-text-muted transition-colors hover:text-mm-error"
            >
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setExp(!exp)}
              aria-expanded={exp}
              aria-label={exp ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
              className="rounded p-1.5 text-mm-text-muted transition-colors"
            >
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${exp ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
        {cat.tags && cat.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1" role="list" aria-label="Category tags">
            {cat.tags.map((t) => (
              <Tag key={t} tag={t} small />
            ))}
          </div>
        )}
      </div>
      <AnimatedCollapse open={exp}>
        <div
          className="border-t border-mm-border"
          role="list"
          aria-label={`Bookmarks in ${cat.name}`}
        >
          {isEmpty ? (
            <div className="px-[18px] py-6 text-center">
              <div
                className="relative mx-auto mb-2.5 flex h-12 w-12 items-center justify-center border"
                style={{
                  background: `${ac.bg}12`,
                  borderColor: `${ac.bg}25`,
                }}
              >
                <Bookmark size={12} />
                <span className="absolute text-[18px] opacity-50" style={{ color: ac.bg }}>
                  +
                </span>
              </div>
              <p className="mb-1 font-sans text-[12px] font-semibold text-mm-text-sec">
                No bookmarks yet
              </p>
              <p className="mb-3 font-sans text-[11px] text-mm-text-muted">
                Save your first link to this collection
              </p>
              <button
                type="button"
                onClick={() => setAddBm(true)}
                className="inline-flex items-center gap-1 rounded border px-4 py-[7px] font-sans text-[12px] font-bold transition-colors"
                style={{
                  background: `${ac.bg}18`,
                  color: ac.bg,
                  borderColor: `${ac.bg}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${ac.bg}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${ac.bg}18`;
                }}
              >
                <Plus size={14} /> Add Bookmark
              </button>
            </div>
          ) : (
            <>
              {sorted.map((bm) => {
                const bmRow = (
                  <BookmarkRow
                    bm={bm}
                    accent={cat.color}
                    searchQuery={q}
                    onEdit={setEditBm}
                    onDelete={(id) =>
                      onDeleteBm(cat.id, id, sorted.find((x) => x.id === id)?.title ?? "bookmark")
                    }
                    onTogglePin={(id) => onTogglePinBookmark(id)}
                  />
                );
                return (
                  <div key={bm.id}>
                    {isMobile ? (
                      <SwipeRow onSwipeDelete={() => onDeleteBm(cat.id, bm.id, bm.title)}>
                        {bmRow}
                      </SwipeRow>
                    ) : (
                      bmRow
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setAddBm(true)}
                aria-label={`Add bookmark to ${cat.name}`}
                className="flex w-full items-center justify-center gap-1.5 border-t border-mm-border bg-transparent px-2.5 py-2.5 font-sans text-[12px] text-mm-text-muted transition-colors hover:bg-white/3"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = ac.bg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "";
                }}
              >
                <Plus size={14} /> Add Bookmark
              </button>
            </>
          )}
        </div>
      </AnimatedCollapse>
      <BookmarkModal
        open={addBm}
        onClose={() => setAddBm(false)}
        accent={cat.color}
        onSave={(bm) => {
          onAddBookmark(cat.id, {
            title: bm.title ?? "",
            url: bm.url ?? "",
            note: bm.note,
            tags: bm.tags ?? [],
          });
          setAddBm(false);
        }}
        allTags={allTags}
      />
      <BookmarkModal
        open={!!editBm}
        onClose={() => setEditBm(null)}
        bm={editBm ?? undefined}
        accent={cat.color}
        onSave={(bm) => {
          if (!editBm?.id) return;
          onUpdateBookmark(cat.id, editBm.id, {
            title: bm.title ?? "",
            url: bm.url ?? "",
            note: bm.note,
            tags: bm.tags ?? [],
          });
          setEditBm(null);
        }}
        allTags={allTags}
      />
    </article>
  );
});
