export const T = {
  bg: "#0D0D0D",
  bgEl: "#161616",
  bgPanel: "#1a1a1a",
  bgInput: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  primary: "#A855F7",
  primarySoft: "rgba(168,85,247,0.25)",
  primaryGlow: "rgba(168,85,247,0.35)",
  primarySubtle: "rgba(168,85,247,0.08)",
  secondary: "#22D3EE",
  secondarySoft: "rgba(34,211,238,0.2)",
  secondaryGlow: "rgba(34,211,238,0.25)",
  secondarySubtle: "rgba(34,211,238,0.06)",
  text: "#FFFFFF",
  textSec: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.5)",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
} as const;

export type TokenKey = keyof typeof T;

export const TAG_COLORS = [
  "#A855F7",
  "#22D3EE",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#F97316",
  "#84CC16",
] as const;

export const ACCENTS = [
  { bg: "#A855F7", glow: "rgba(168,85,247,0.25)" },
  { bg: "#22D3EE", glow: "rgba(34,211,238,0.25)" },
  { bg: "#22C55E", glow: "rgba(34,197,94,0.25)" },
  { bg: "#F59E0B", glow: "rgba(245,158,11,0.25)" },
  { bg: "#EF4444", glow: "rgba(239,68,68,0.25)" },
  { bg: "#EC4899", glow: "rgba(236,72,153,0.25)" },
  { bg: "#6366F1", glow: "rgba(99,102,241,0.25)" },
  { bg: "#14B8A6", glow: "rgba(20,184,166,0.25)" },
] as const;
