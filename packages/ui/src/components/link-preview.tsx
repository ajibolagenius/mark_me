"use client";

import { useState, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { getDomain, getFavicon } from "../lib/helpers";

interface LinkPreviewProps {
  url: string;
  title: string;
  children: ReactNode;
}

export function LinkPreview({ url, title, children }: LinkPreviewProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const domain = getDomain(url);

  const onEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.top - 6 });
    timer.current = setTimeout(() => setShow(true), 400);
  };

  const onLeave = () => {
    clearTimeout(timer.current);
    setShow(false);
  };

  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} className="contents">
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-800 w-[240px] border border-mm-border bg-mm-bg-panel p-3 shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
            style={{
              left: Math.min(pos.x, (typeof window !== "undefined" ? window.innerWidth : 1024) - 260),
              top: pos.y,
              transform: "translateY(-100%)",
            }}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <img src={getFavicon(url)} alt="" width={14} height={14} />
              <span className="truncate font-sans text-[11px] font-bold text-mm-text">{title}</span>
            </div>
            <div className="flex items-center gap-1 truncate font-sans text-[10px] text-mm-text-muted">
              <Globe size={10} /> {domain}
            </div>
            <div className="mt-1 truncate font-mono text-[10px] text-mm-text-muted">{url}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
