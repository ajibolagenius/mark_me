"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useFocusTrap } from "../hooks/use-focus-trap";

interface NavItem {
  icon: ReactNode;
  label: string;
  fn: () => void;
}

interface MobileNavOverlayProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}

export function MobileNavOverlay({ open, onClose, items }: MobileNavOverlayProps) {
  const trapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          ref={trapRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-900 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="border-b border-mm-border bg-mm-bg-el p-4"
          >
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-base font-extrabold">Menu</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-8 w-8 cursor-pointer items-center justify-center border border-mm-border bg-mm-bg-input p-0 text-mm-text-muted hover:text-mm-text"
              >
                <X size={14} />
              </button>
            </div>
            <nav aria-label="Mobile navigation">
              {items.map((it, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={it.fn}
                  className="flex w-full cursor-pointer items-center gap-2.5 border-b border-mm-border bg-transparent p-3.5 font-sans text-sm font-semibold text-mm-text-sec hover:text-mm-text"
                >
                  {it.icon} {it.label}
                </button>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
