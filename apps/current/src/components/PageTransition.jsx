import { useState, useEffect, useRef } from 'react';

export function PageTransition({ pageKey, children }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState("in");
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (pageKey !== prevKey.current) {
      setPhase("out");
      const t = setTimeout(() => {
        setDisplayChildren(children);
        prevKey.current = pageKey;
        setPhase("in");
      }, 200);
      return () => clearTimeout(t);
    } else {
      setDisplayChildren(children);
    }
  }, [pageKey, children]);

  return (
    <div style={{
      opacity: phase === "out" ? 0 : 1,
      transform: phase === "out" ? "translateY(6px)" : "translateY(0)",
      transition: "opacity 0.2s cubic-bezier(0.4,0,0.2,1), transform 0.2s cubic-bezier(0.4,0,0.2,1)",
      willChange: "opacity, transform",
    }}>
      {displayChildren}
    </div>
  );
}
