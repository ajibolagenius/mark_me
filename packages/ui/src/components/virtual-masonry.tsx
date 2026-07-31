"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

interface VirtualMasonryProps<T extends { id?: string }> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columnCount?: number;
  gap?: number;
  className?: string;
}

function seedVisible<T extends { id?: string }>(items: T[], columnCount: number) {
  const seed = new Set<string>();
  const n = Math.min(items.length, Math.max(columnCount * 3, 6));
  for (let i = 0; i < n; i++) seed.add(items[i]?.id || `vi-${i}`);
  return seed;
}

export function VirtualMasonry<T extends { id?: string }>({
  items,
  renderItem,
  columnCount = 3,
  gap = 14,
  className,
}: VirtualMasonryProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSet, setVisibleSet] = useState<Set<string>>(() => seedVisible(items, columnCount));
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const heightCache = useRef<Record<string, number>>({});
  const seedRef = useRef(seedVisible(items, columnCount));

  // Seed above-the-fold cards so first paint isn't blank placeholders
  useEffect(() => {
    const seeded = seedVisible(items, columnCount);
    seedRef.current = seeded;
    setVisibleSet((prev) => {
      const next = new Set(prev);
      for (const id of seeded) next.add(id);
      return next;
    });
  }, [items, columnCount]);

  useEffect(() => {
    if (!containerRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleSet((prev) => {
          const next = new Set(prev);
          for (const e of entries) {
            const id = (e.target as HTMLElement).dataset.vid;
            if (!id) continue;
            if (e.isIntersecting) next.add(id);
            else if (!seedRef.current.has(id)) next.delete(id);
          }
          return next;
        });
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 },
    );
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const obs = observerRef.current;
    if (!obs) return;
    obs.disconnect();
    for (const el of Object.values(sentinelRefs.current)) {
      if (el) obs.observe(el);
    }
  }, [items.length]);

  const setSentinelRef = useCallback((id: string, el: HTMLDivElement | null) => {
    sentinelRefs.current[id] = el;
    if (el && observerRef.current) observerRef.current.observe(el);
  }, []);

  const onCardRender = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) heightCache.current[id] = el.offsetHeight;
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ columnCount, columnGap: gap }}>
      {items.map((item, i) => {
        const id = item.id || `vi-${i}`;
        const isVisible = visibleSet.has(id);
        const cachedH = heightCache.current[id];
        return (
          <div
            key={id}
            ref={(el) => setSentinelRef(id, el)}
            data-vid={id}
            style={{ breakInside: "avoid", marginBottom: gap }}
          >
            {isVisible ? (
              <div ref={(el) => onCardRender(id, el)}>{renderItem(item, i)}</div>
            ) : (
              <div style={{ height: cachedH || 160, background: "transparent" }} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
