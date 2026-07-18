export const T = {
    bg: "#0D0D0D",
    bgEl: "#161616",
    bgPanel: "#1a1a1a",
    bgInput: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
    /** Acid lime — primary brand on near-black */
    primary: "#D4FF4F",
    primarySoft: "rgba(212,255,79,0.22)",
    primaryGlow: "rgba(212,255,79,0.18)",
    primarySubtle: "rgba(212,255,79,0.08)",
    /** Punch rose — secondary accent */
    secondary: "#FF4F7B",
    secondarySoft: "rgba(255,79,123,0.2)",
    secondaryGlow: "rgba(255,79,123,0.16)",
    secondarySubtle: "rgba(255,79,123,0.06)",
    text: "#FFFFFF",
    textSec: "rgba(255,255,255,0.7)",
    textMuted: "rgba(255,255,255,0.5)",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
    font: "'Plus Jakarta Sans', system-ui, sans-serif",
    /** Text on bright primary fills (lime needs dark ink) */
    onPrimary: "#0D0D0D",
} as const;

export type TokenKey = keyof typeof T;

export const TAG_COLORS = [
    "#D4FF4F",
    "#FF4F7B",
    "#22C55E",
    "#F59E0B",
    "#38BDF8",
    "#FB923C",
    "#A3E635",
    "#F472B6",
    "#2DD4BF",
    "#F87171",
] as const;

export const ACCENTS = [
    { bg: "#D4FF4F", glow: "rgba(212,255,79,0.18)" },
    { bg: "#FF4F7B", glow: "rgba(255,79,123,0.18)" },
    { bg: "#22C55E", glow: "rgba(34,197,94,0.2)" },
    { bg: "#F59E0B", glow: "rgba(245,158,11,0.2)" },
    { bg: "#38BDF8", glow: "rgba(56,189,248,0.2)" },
    { bg: "#FB923C", glow: "rgba(251,146,60,0.2)" },
    { bg: "#A3E635", glow: "rgba(163,230,53,0.18)" },
    { bg: "#F472B6", glow: "rgba(244,114,182,0.2)" },
] as const;
