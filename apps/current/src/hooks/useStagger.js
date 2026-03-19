export function useStagger(count, baseDelay = 40, initialDelay = 60) {
  return (i) => ({
    animation: `mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${initialDelay + i * baseDelay}ms both`,
  });
}
