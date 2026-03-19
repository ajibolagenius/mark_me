import type { CSSProperties } from "react";

export function useStagger(
  _count: number,
  baseDelay = 40,
  initialDelay = 60,
): (i: number) => CSSProperties {
  return (i: number) => ({
    animation: `mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${initialDelay + i * baseDelay}ms both`,
  });
}
