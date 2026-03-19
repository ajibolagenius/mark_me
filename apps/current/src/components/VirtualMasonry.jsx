import { useState, useEffect, useRef, useCallback } from 'react';

export function VirtualMasonry({ items, renderItem, columnCount = 3, gap = 14 }) {
  const containerRef = useRef(null);
  const [visibleSet, setVisibleSet] = useState(new Set());
  const observerRef = useRef(null);
  const sentinelRefs = useRef({});
  const heightCache = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;
    observerRef.current = new IntersectionObserver(
      entries => {
        setVisibleSet(prev => {
          const next = new Set(prev);
          entries.forEach(e => {
            const id = e.target.dataset.vid;
            if (e.isIntersecting) next.add(id);
            else next.delete(id);
          });
          return next;
        });
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const obs = observerRef.current;
    if (!obs) return;
    obs.disconnect();
    Object.values(sentinelRefs.current).forEach(el => { if (el) obs.observe(el); });
  }, [items.length]);

  const setSentinelRef = useCallback((id, el) => {
    sentinelRefs.current[id] = el;
    if (el && observerRef.current) observerRef.current.observe(el);
  }, []);

  const onCardRender = useCallback((id, el) => {
    if (el) heightCache.current[id] = el.offsetHeight;
  }, []);

  return (
    <div ref={containerRef} style={{ columnCount, columnGap: gap }} className="mm-grid">
      {items.map((item, i) => {
        const id = item.id || `vi-${i}`;
        const isVisible = visibleSet.has(id);
        const cachedH = heightCache.current[id];
        return (
          <div key={id}
            ref={el => setSentinelRef(id, el)}
            data-vid={id}
            style={{ breakInside:"avoid", marginBottom: gap, animation: isVisible ? `mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${Math.min(80 + i*40, 400)}ms both` : "none" }}>
            {isVisible ? (
              <div ref={el => onCardRender(id, el)}>
                {renderItem(item, i)}
              </div>
            ) : (
              <div style={{ height: cachedH || 160, background:"transparent" }} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
