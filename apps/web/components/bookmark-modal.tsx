"use client";

import { useState, useEffect } from "react";
import type { Bookmark } from "@markme/ui";
import { Modal, Field, Tag, ACCENTS } from "@markme/ui";

interface BookmarkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bm: Partial<Bookmark>) => void;
  bm?: Bookmark | null;
  allTags: string[];
  accent: number;
}

export function BookmarkModal({
  open,
  onClose,
  onSave,
  bm,
  allTags,
  accent,
}: BookmarkModalProps) {
  const [f, setF] = useState({
    title: "",
    url: "",
    note: "",
    tags: [] as string[],
  });
  const [ti, setTi] = useState("");

  useEffect(() => {
    if (open) {
      setF({
        title: bm?.title ?? "",
        url: bm?.url ?? "",
        note: bm?.note ?? "",
        tags: bm?.tags ?? [],
      });
      setTi("");
    }
  }, [open, bm]);

  const addTag = () => {
    const t = ti.trim().toLowerCase();
    if (t && !f.tags.includes(t)) {
      setF({ ...f, tags: [...f.tags, t] });
      setTi("");
    }
  };

  const ac = ACCENTS[accent] ?? ACCENTS[0];

  const save = () => {
    if (!f.title.trim() || !f.url.trim()) return;
    const url = f.url.startsWith("http") ? f.url : `https://${f.url}`;
    onSave({
      ...(bm ?? {}),
      title: f.title.trim(),
      url,
      note: f.note.trim(),
      tags: f.tags,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bm ? "Edit Bookmark" : "Add Bookmark"}
    >
      <Field
        label="Title"
        placeholder="My Bookmark"
        value={f.title}
        onChange={(e) => setF({ ...f, title: e.target.value })}
      />
      <Field
        label="URL"
        placeholder="https://example.com"
        value={f.url}
        onChange={(e) => setF({ ...f, url: e.target.value })}
      />
      <Field
        label="Note"
        placeholder="Why this is useful..."
        value={f.note}
        onChange={(e) => setF({ ...f, note: e.target.value })}
      />
      <div className="mb-3.5">
        <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-wider text-mm-text-muted">
          Tags
        </label>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {f.tags.map((t) => (
            <Tag
              key={t}
              tag={t}
              removable
              onRemove={() =>
                setF({ ...f, tags: f.tags.filter((x) => x !== t) })
              }
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            value={ti}
            onChange={(e) => setTi(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            placeholder="Add tag…"
            className="flex-1 border border-mm-border bg-mm-bg-input px-3.5 py-3 font-sans text-sm text-mm-text outline-none transition-colors duration-200 focus:border-mm-primary"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3.5 py-2 font-bold text-mm-bg"
            style={{ background: ac.bg }}
          >
            Add
          </button>
        </div>
        {allTags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-[3px]">
            {allTags
              .filter((t) => !f.tags.includes(t))
              .slice(0, 8)
              .map((t) => (
                <Tag
                  key={t}
                  tag={t}
                  small
                  onClick={() => setF({ ...f, tags: [...f.tags, t] })}
                />
              ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={save}
        className="w-full py-3 font-sans text-sm font-extrabold text-mm-bg shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
        style={{ background: ac.bg }}
      >
        {bm ? "Save Changes" : "Add Bookmark"}
      </button>
    </Modal>
  );
}
