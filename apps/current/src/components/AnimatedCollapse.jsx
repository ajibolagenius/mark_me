import { useState, useEffect, useRef } from 'react';

export function AnimatedCollapse({ open, children }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(open ? "auto" : 0);
  const [overflow, setOverflow] = useState(open ? "visible" : "hidden");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const el = contentRef.current;
    if (!el) return;
    if (open) {
      const h = el.scrollHeight;
      setHeight(0);
      setOverflow("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(h);
          setTimeout(() => { setHeight("auto"); setOverflow("visible"); }, 320);
        });
      });
    } else {
      const h = el.scrollHeight;
      setHeight(h);
      setOverflow("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div ref={contentRef} style={{
      height: typeof height === "number" ? height + "px" : height,
      overflow,
      transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
      opacity: (typeof height === "number" && height === 0 && !open) ? 0 : 1,
    }}>
      {children}
    </div>
  );
}
