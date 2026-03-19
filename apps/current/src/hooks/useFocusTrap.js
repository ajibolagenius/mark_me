import { useRef, useEffect } from 'react';

export function useFocusTrap(active) {
  const trapRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (!active) return;
    prevFocus.current = document.activeElement;
    const el = trapRef.current;
    if (!el) return;

    const focusable = () => el.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const timer = setTimeout(() => {
      const nodes = focusable();
      if (nodes.length) nodes[0].focus();
    }, 50);

    const handleKey = e => {
      if (e.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    el.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("keydown", handleKey);
      if (prevFocus.current && prevFocus.current.focus) {
        try { prevFocus.current.focus(); } catch {}
      }
    };
  }, [active]);

  return trapRef;
}
