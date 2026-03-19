"use client";

import { useState, useEffect } from "react";
import type { Category } from "@markme/ui";
import { ACCENTS, uid, Modal, Field, Tag } from "@markme/ui";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (cat: Category) => void;
  cat?: Category | null;
}

const EMOJIS = [
  "📁", "🎨", "⚡", "📚", "🚀", "🎬", "🤖", "🎵", "🏠", "💡",
  "🔧", "🌍", "💰", "🎯", "🏋️", "🍕", "✈️", "📷", "🎮", "❤️",
];

export function CategoryModal({
  open,
  onClose,
  onSave,
  cat,
}: CategoryModalProps) {
  const [f, setF] = useState({
    name: "",
    icon: "📁",
    color: 0,
    tags: [] as string[],
  });
  const [ti, setTi] = useState("");

  useEffect(() => {
    if (open) {
      setF({
        name: cat?.name ?? "",
        icon: cat?.icon ?? "📁",
        color: cat?.color ?? 0,
        tags: cat?.tags ?? [],
      });
      setTi("");
    }
  }, [open, cat]);

  const addTag = () => {
    const t = ti.trim().toLowerCase();
    if (t && !f.tags.includes(t)) {
      setF({ ...f, tags: [...f.tags, t] });
      setTi("");
    }
  };

  const ac = ACCENTS[f.color] ?? ACCENTS[0];

  const save = () => {
    if (!f.name.trim()) return;
    onSave({
      ...(cat ?? { id: uid(), bookmarks: [] }),
      ...f,
      name: f.name.trim(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cat ? "Edit Category" : "New Category"}
      wide
    >
      <Field
        label="Name"
        placeholder="My Collection"
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
      />

      {/* Icon selector */}
      <div className="mb-3.5">
        <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-wider text-mm-text-muted">
          Icon
        </label>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Select icon">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setF({ ...f, icon: e })}
              role="radio"
              aria-checked={f.icon === e}
              aria-label={`Icon ${e}`}
              className="flex h-9 w-9 cursor-pointer items-center justify-center text-lg"
              style={{
                background: f.icon === e ? `${ac.bg}20` : "rgba(255,255,255,0.04)",
                border: f.icon === e ? `1px solid ${ac.bg}` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Accent color selector */}
      <div className="mb-3.5">
        <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-wider text-mm-text-muted">
          Accent
        </label>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Select accent color">
          {ACCENTS.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setF({ ...f, color: i })}
              role="radio"
              aria-checked={f.color === i}
              aria-label={`Color ${i + 1}`}
              className="h-8 w-8 cursor-pointer"
              style={{
                background: c.bg,
                border: f.color === i ? "2px solid #fff" : "2px solid transparent",
                boxShadow: f.color === i ? `0 0 12px ${c.glow}` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-[18px]">
        <label className="mb-[5px] block font-sans text-[11px] font-semibold uppercase tracking-wider text-mm-text-muted">
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
      </div>

      <button
        type="button"
        onClick={save}
        className="w-full bg-white py-3 font-sans text-sm font-extrabold text-mm-bg shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
      >
        {cat ? "Save Changes" : "Create Category"}
      </button>
    </Modal>
  );
}
