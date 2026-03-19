"use client";

import { useState, useRef, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface SwipeRowProps {
  onSwipeDelete: () => void;
  children: ReactNode;
}

export function SwipeRow({ onSwipeDelete, children }: SwipeRowProps) {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const [offset, setOffset] = useState(0);
  const [showBg, setShowBg] = useState(false);
  const THRESHOLD = 90;

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]!;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = 0;
    swiping.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]!;
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    if (!swiping.current && Math.abs(dy) > Math.abs(dx)) return;
    if (dx < -10) swiping.current = true;
    if (!swiping.current) return;
    e.preventDefault();
    const clamped = Math.max(Math.min(dx, 0), -160);
    currentX.current = clamped;
    setOffset(clamped);
    setShowBg(clamped < -20);
  };

  const onTouchEnd = () => {
    if (currentX.current < -THRESHOLD) {
      setOffset(-160);
      setTimeout(() => {
        onSwipeDelete();
        setOffset(0);
        setShowBg(false);
      }, 200);
    } else {
      setOffset(0);
      setShowBg(false);
    }
    swiping.current = false;
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-end bg-mm-error pr-5 transition-opacity duration-150"
        style={{ opacity: showBg ? 1 : 0 }}
      >
        <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-white">
          <Trash2 size={13} /> Delete
        </div>
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative z-1 bg-mm-bg-el"
        style={{
          transform: `translateX(${offset}px)`,
          transition: offset === 0 || offset === -160 ? "transform 0.25s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
