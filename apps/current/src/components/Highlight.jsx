import { T } from '../constants/tokens';

export function Highlight({ text, query }) {
  if (!query || !text) return text || null;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background:T.primary+"35", color:T.text, padding:"0 1px", borderRadius:0, fontWeight:700 }}>{part}</mark>
      : part
  );
}
