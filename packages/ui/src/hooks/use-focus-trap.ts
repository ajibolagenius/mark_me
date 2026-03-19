"use client";

import { useRef, useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active: boolean): RefObject<HTMLDivElement | null> {
  const trapRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;
    prevFocus.current = document.activeElement;
    const el = trapRef.current;
    if (!el) return;

    const focusable = () => el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

    const timer = setTimeout(() => {
      const nodes = focusable();
      if (nodes.length) nodes[0]?.focus();
    }, 50);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("keydown", handleKey);
      if (prevFocus.current && "focus" in prevFocus.current) {
        try {
          (prevFocus.current as HTMLElement).focus();
        } catch { /* noop */ }
      }
    };
  }, [active]);

  return trapRef;
}
