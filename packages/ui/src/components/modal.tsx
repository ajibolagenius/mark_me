"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useFocusTrap } from "../hooks/use-focus-trap";
import { useIsMobile } from "../hooks/use-mobile";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  const trapRef = useFocusTrap(open);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 6)}`).current;
  const isMobile = useIsMobile();

  const dragStartY = useRef(0);
  const dragDist = useRef(0);
  const [sheetOffset, setSheetOffset] = useState(0);
  const dragging = useRef(false);

  const onDragStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    dragStartY.current = e.touches[0]!.clientY;
    dragging.current = true;
  };

  const onDragMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dy = e.touches[0]!.clientY - dragStartY.current;
    if (dy < 0) return;
    dragDist.current = dy;
    setSheetOffset(dy);
  };

  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragDist.current > 100) {
      setSheetOffset(600);
      setTimeout(() => {
        onClose();
        setSheetOffset(0);
      }, 200);
    } else {
      setSheetOffset(0);
    }
    dragDist.current = 0;
  };

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

  useEffect(() => {
    if (!open) setSheetOffset(0);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          ref={trapRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={[
            "fixed inset-0 z-1000 flex backdrop-blur-md",
            isMobile
              ? "flex-col justify-end bg-black/50"
              : "items-center justify-center bg-black/60 p-4",
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
              "bg-mm-bg-el",
              isMobile
                ? "max-h-[88vh] overflow-y-auto border-t border-mm-border"
                : `max-h-[85vh] overflow-y-auto border border-mm-border shadow-[8px_8px_0_rgba(0,0,0,0.5)] ${wide ? "w-[520px]" : "w-[420px]"} max-w-full`,
            ].join(" ")}
            style={
              isMobile
                ? {
                    transform: `translateY(${sheetOffset}px)`,
                    transition: dragging.current ? "none" : undefined,
                  }
                : undefined
            }
          >
            {isMobile && (
              <div
                onTouchStart={onDragStart}
                onTouchMove={onDragMove}
                onTouchEnd={onDragEnd}
                className="flex cursor-grab justify-center pb-0.5 pt-2.5"
                style={{ touchAction: "none" }}
              >
                <div className="h-1 w-9 rounded-sm bg-mm-border-strong" />
              </div>
            )}
            <div className={isMobile ? "px-5 pb-6 pt-3.5" : "p-7"}>
              <div className="mb-5 flex items-center justify-between">
                <h2
                  id={titleId}
                  className="m-0 font-sans text-lg font-extrabold tracking-tight text-mm-text"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center border border-mm-border bg-mm-bg-input p-0 text-mm-text-muted hover:text-mm-text"
                >
                  <X size={14} />
                </button>
              </div>
              {children}
            </div>
            {isMobile && <div style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
