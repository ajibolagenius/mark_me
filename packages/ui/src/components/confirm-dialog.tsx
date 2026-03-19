"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Zap } from "lucide-react";
import { useFocusTrap } from "../hooks/use-focus-trap";
import { useIsMobile } from "../hooks/use-mobile";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: ReactNode;
  itemName?: string;
  count?: number;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, itemName, count }: ConfirmDialogProps) {
  const trapRef = useFocusTrap(open);
  const titleId = useRef(`confirm-${Math.random().toString(36).slice(2, 6)}`).current;
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    if (isMobile) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isMobile]);

  const content = (
    <>
      <div className="h-[3px] bg-mm-error" aria-hidden="true" />
      <div className="p-6 pb-5">
        <div className="mb-4 flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-mm-error/20 bg-mm-error/10 text-mm-error">
            <Trash2 size={14} />
          </div>
          <div>
            <h3 id={titleId} className="mb-1.5 font-sans text-base font-extrabold tracking-tight text-mm-text">
              {title || "Delete forever?"}
            </h3>
            <p id={`${titleId}-desc`} className="text-[13px] leading-relaxed text-mm-text-sec">
              {message || (
                <>
                  Are you sure you want to delete <strong className="text-mm-text">{itemName}</strong>?
                </>
              )}
            </p>
            {count != null && count > 0 && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-mm-warning">
                <Zap size={12} /> This will also remove {count} bookmark{count !== 1 ? "s" : ""} inside
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel"
            className="cursor-pointer border border-mm-border bg-transparent px-[18px] py-[9px] font-sans text-[13px] font-semibold text-mm-text-sec hover:border-mm-border-strong hover:text-mm-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            aria-label={`Confirm delete ${itemName || ""}`}
            className="cursor-pointer border-none bg-mm-error px-[18px] py-[9px] font-sans text-[13px] font-extrabold text-white shadow-[2px_2px_0_rgba(0,0,0,0.3)] hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
          >
            Delete
          </button>
        </div>
      </div>
      {isMobile && <div style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />}
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={`${titleId}-desc`}
          ref={trapRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={[
            "fixed inset-0 z-1100 flex justify-center backdrop-blur-md",
            isMobile ? "items-end bg-black/65 p-0" : "items-center bg-black/65 p-4",
          ].join(" ")}
          onClick={onClose}
        >
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, y: 16 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, y: 16 }}
            transition={
              isMobile
                ? { duration: 0.25, ease: [0.32, 0.72, 0, 1] }
                : { duration: 0.2 }
            }
            onClick={(e) => e.stopPropagation()}
            className={[
              "w-full max-w-full overflow-hidden bg-mm-bg-el",
              isMobile
                ? "border-t border-mm-error/20"
                : "w-[400px] border border-mm-error/20 shadow-[8px_8px_0_rgba(0,0,0,0.5)]",
            ].join(" ")}
          >
            {isMobile && (
              <div className="flex justify-center pb-0.5 pt-2.5">
                <div className="h-1 w-9 rounded-sm bg-mm-border-strong" />
              </div>
            )}
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
