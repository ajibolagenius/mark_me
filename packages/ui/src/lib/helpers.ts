import { TAG_COLORS } from "../tokens";

export const uid = (): string =>
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getDomain = (u: string): string => {
  try {
    return new URL(u).hostname.replace("www.", "");
  } catch {
    return "";
  }
};

export const getFavicon = (u: string): string =>
  `https://www.google.com/s2/favicons?domain=${getDomain(u)}&sz=32`;

export const tagColor = (t: string): string => {
  const idx = t.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % TAG_COLORS.length;
  return TAG_COLORS[idx] ?? "#A855F7";
};

export function timeAgo(ts: number | null | undefined): string | null {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
