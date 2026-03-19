"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Pencil,
  Pin,
  Trash2,
} from "lucide-react";
import {
  ACCENTS,
  FaviconWithFallback,
  Highlight,
  LinkPreview,
  Tag,
  getDomain,
  timeAgo,
} from "@markme/ui";
import type { Bookmark } from "@markme/ui";

interface BookmarkRowProps {
  bm: Bookmark;
  accent: number;
  onEdit: (bm: Bookmark) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  searchQuery: string;
}

export function BookmarkRow({
  bm,
  accent,
  onEdit,
  onDelete,
  onTogglePin,
  searchQuery,
}: BookmarkRowProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(bm.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const ac = ACCENTS[accent] ?? ACCENTS[0];
  const q = searchQuery ?? "";
  const ago = timeAgo(bm.addedAt);

  const actions = [
    {
      icon: copied ? <Check size={14} /> : <Copy size={14} />,
      fn: copy,
      label: copied ? "URL copied" : "Copy URL",
    },
    {
      icon: <Pin size={14} />,
      fn: () => onTogglePin(bm.id),
      label: bm.pinned ? "Unpin bookmark" : "Pin bookmark",
    },
    {
      icon: <Pencil size={14} />,
      fn: () => onEdit(bm),
      label: "Edit bookmark",
    },
    {
      icon: <Trash2 size={14} />,
      fn: () => onDelete(bm.id),
      label: "Delete bookmark",
    },
  ];

  return (
    <div
      role="listitem"
      className="group flex items-start gap-2.5 px-3 py-2.5 transition-all duration-150 hover:bg-white/3 focus-within:bg-white/3"
      style={{
        borderLeft: bm.pinned ? `2px solid ${ac.bg}` : "2px solid transparent",
        ["--accent-color" as string]: ac.bg,
      }}
    >
      <FaviconWithFallback url={bm.url} title={bm.title} />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          {bm.pinned && (
            <span
              className="flex text-(--accent-color)"
              aria-label="Pinned"
            >
              <Pin size={12} />
            </span>
          )}
          <LinkPreview url={bm.url} title={bm.title}>
            <a
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${bm.title} — opens in new tab`}
              className="overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[13px] font-bold tracking-tight text-mm-text no-underline transition-colors duration-150 hover:text-(--accent-color)"
            >
              <Highlight text={bm.title} query={q} />
            </a>
          </LinkPreview>
          <span className="flex opacity-30" aria-hidden="true">
            <ExternalLink size={12} />
          </span>
        </div>
        <div
          className={`flex items-center gap-1 font-sans text-[11px] text-mm-text-muted ${bm.note || (bm.tags?.length ?? 0) ? "mb-1" : ""}`}
        >
          <Globe size={11} />
          <Highlight text={getDomain(bm.url)} query={q} />
          {ago && (
            <>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {ago}
              </span>
            </>
          )}
        </div>
        {bm.note && (
          <div className="mb-1 font-sans text-[11px] text-mm-text-sec">
            <Highlight text={bm.note} query={q} />
          </div>
        )}
        {bm.tags && bm.tags.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5"
            role="list"
            aria-label="Bookmark tags"
          >
            {bm.tags.map((t) => (
              <Tag key={t} tag={t} small />
            ))}
          </div>
        )}
      </div>
      <div
        className="mm-bm-actions flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {actions.map((b, i) => (
          <button
            key={i}
            onClick={b.fn}
            aria-label={b.label}
            className="rounded p-1.5 text-mm-text-muted transition-colors duration-150 hover:bg-white/5 hover:text-mm-text focus:bg-transparent focus:text-mm-text focus:outline-none"
          >
            {b.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
