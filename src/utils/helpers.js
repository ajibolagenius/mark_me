import { TAG_COLORS } from '../constants/tokens';

export const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

export const getDomain = u => { try { return new URL(u).hostname.replace("www.",""); } catch { return ""; } };

export const getFavicon = u => `https://www.google.com/s2/favicons?domain=${getDomain(u)}&sz=32`;

export const tagColor = t => TAG_COLORS[t.split("").reduce((a,c) => a + c.charCodeAt(0), 0) % TAG_COLORS.length];

export function timeAgo(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days/7)}w ago`;
  if (days < 365) return `${Math.floor(days/30)}mo ago`;
  return `${Math.floor(days/365)}y ago`;
}
