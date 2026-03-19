"use client";

import { useState, useRef, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => void;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const PULL_THRESHOLD = 70;

  const onTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0]!.clientY;
      pulling.current = true;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current) return;
    const dy = e.touches[0]!.clientY - startY.current;
    if (dy < 0) {
      pulling.current = false;
      setPullDist(0);
      return;
    }
    setPullDist(Math.min(dy * 0.45, 120));
  };

  const onTouchEnd = () => {
    if (pullDist >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDist(50);
      onRefresh();
      setTimeout(() => {
        setRefreshing(false);
        setPullDist(0);
      }, 800);
    } else {
      setPullDist(0);
    }
    pulling.current = false;
  };

  const ready = pullDist >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      <div
        aria-hidden="true"
        className="flex items-center justify-center overflow-hidden"
        style={{
          height: pullDist,
          transition: pulling.current ? "none" : "height 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {pullDist > 10 && (
          <div
            className="flex flex-col items-center gap-1"
            style={{
              opacity: Math.min(pullDist / 50, 1),
              transform: `rotate(${refreshing ? 360 : ready ? 180 : (pullDist / PULL_THRESHOLD) * 180}deg)`,
              transition: refreshing ? "transform 0.5s linear" : pulling.current ? "none" : "transform 0.2s ease",
              animation: refreshing ? "spin 0.6s linear infinite" : "none",
            }}
          >
            <ArrowUp
              size={20}
              className={ready || refreshing ? "text-mm-primary" : "text-mm-text-muted"}
              strokeWidth={2.5}
            />
          </div>
        )}
        {pullDist > 10 && !refreshing && (
          <span
            className={`absolute mt-[30px] font-sans text-[10px] font-semibold ${ready ? "text-mm-primary" : "text-mm-text-muted"}`}
          >
            {ready ? "Release to refresh" : "Pull to refresh"}
          </span>
        )}
        {refreshing && (
          <span className="absolute mt-[30px] font-sans text-[10px] font-semibold text-mm-primary">
            Refreshing…
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
