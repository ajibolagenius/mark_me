"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Check, X } from "lucide-react";

interface ToastState {
  msg: string;
  onUndo?: () => void;
  remaining?: number;
}

export function useUndoToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const clear = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(countRef.current);
    setToast(null);
  }, []);

  const flash = useCallback(
    (msg: string) => {
      clear();
      setToast({ msg });
      timerRef.current = setTimeout(clear, 2200);
    },
    [clear],
  );

  const flashUndo = useCallback(
    (msg: string, onUndo: () => void, duration = 5000) => {
      clear();
      const end = Date.now() + duration;
      setToast({ msg, onUndo, remaining: duration });
      countRef.current = setInterval(() => {
        const left = Math.max(0, end - Date.now());
        if (left <= 0) {
          clear();
          return;
        }
        setToast((prev) => (prev ? { ...prev, remaining: left } : null));
      }, 50);
      timerRef.current = setTimeout(clear, duration);
    },
    [clear],
  );

  const handleUndo = useCallback(() => {
    if (toast?.onUndo) toast.onUndo();
    clear();
  }, [toast, clear]);

  const secs = toast?.remaining ? Math.ceil(toast.remaining / 1000) : 0;
  const pct = toast?.remaining ? (toast.remaining / 5000) * 100 : 0;

  const ToastEl: ReactNode = (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 left-1/2 z-2000 min-w-[260px] max-w-[90vw] -translate-x-1/2 overflow-hidden border border-mm-border bg-mm-bg-el shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
        >
          {toast.onUndo && (
            <div
              className="h-[3px] bg-mm-error transition-[width] duration-100 ease-linear"
              style={{ width: `${pct}%` }}
              aria-hidden="true"
            />
          )}
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-mm-text">
              {toast.onUndo && (
                <span className="flex text-mm-error" aria-hidden="true">
                  <Trash2 size={13} />
                </span>
              )}
              {toast.msg}
            </span>
            {toast.onUndo ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="min-w-[16px] text-center text-[11px] tabular-nums text-mm-text-muted">
                  {secs}s
                </span>
                <button
                  type="button"
                  onClick={handleUndo}
                  aria-label="Undo delete"
                  className="inline-flex cursor-pointer items-center justify-center border-none bg-mm-primary px-3 py-1 text-xs font-extrabold text-mm-on-primary hover:opacity-85"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Dismiss"
                  className="inline-flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-mm-text-muted hover:text-mm-text"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <span className="flex text-mm-success">
                <Check size={13} />
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { flash, flashUndo, ToastEl };
}
