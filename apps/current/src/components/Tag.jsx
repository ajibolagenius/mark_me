import { T } from '../constants/tokens';
import { tagColor } from '../utils/helpers';

export function Tag({ tag, small, removable, onRemove, onClick, active }) {
  const c = tagColor(tag);
  const handleKey = e => { if (onClick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick(); } };
  return (
    <span onClick={onClick} onKeyDown={handleKey} role={onClick?"button":undefined} tabIndex={onClick?0:undefined}
      aria-pressed={onClick ? (active ? "true" : "false") : undefined}
      aria-label={onClick ? `Filter by ${tag}${active ? " (active)" : ""}` : undefined}
      style={{ display:"inline-flex", alignItems:"center", gap:3, padding:small?"2px 8px":"3px 10px", fontSize:small?10:11, fontWeight:700, letterSpacing:"0.02em", textTransform:"uppercase", background:active?c:c+"20", color:active?T.bg:c, cursor:onClick?"pointer":"default", fontFamily:T.font, transition:"all 0.15s", whiteSpace:"nowrap", border:`1px solid ${active?c:c+"30"}`, outline:"none" }}>
      {tag}{removable && <span onClick={e=>{e.stopPropagation();onRemove?.();}} role="button" tabIndex={0} aria-label={`Remove tag ${tag}`}
        onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();e.stopPropagation();onRemove?.();}}}
        style={{ cursor:"pointer", marginLeft:2, opacity:0.7, fontSize:13, lineHeight:1 }}>&times;</span>}
    </span>
  );
}
