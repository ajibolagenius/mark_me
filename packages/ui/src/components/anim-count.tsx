"use client";

import { useState, useEffect, useRef } from "react";

interface AnimCountProps {
  to: number;
  duration?: number;
}

export function AnimCount({ to, duration = 600 }: AnimCountProps) {
  const [val, setVal] = useState(0);
  const ref = useRef<number>(undefined);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(to * eased));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [to, duration]);

  return <>{val}</>;
}
