import { useEffect } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from './Icons';
import { useFocusTrap } from '../hooks/useFocusTrap';

export function MobileNavOverlay({ onClose, items }) {
  const trapRef = useFocusTrap(true);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Navigation menu" ref={trapRef}
      style={{ position:"fixed", inset:0, zIndex:900, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", animation:"mmFadeIn .15s ease" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bgEl, borderBottom:`1px solid ${T.border}`, padding:16, animation:"mmSlideDown .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontWeight:800, fontSize:16 }}>Menu</span>
          <button onClick={onClose} aria-label="Close menu" style={{ ...S.btn, background:T.bgInput, width:32, height:32, padding:0, color:T.textMuted, border:`1px solid ${T.border}` }}><I.X /></button>
        </div>
        <nav aria-label="Mobile navigation">
          {items.map((it,i) => (
            <button key={i} onClick={it.fn} style={{ ...S.btn, width:"100%", padding:14, justifyContent:"flex-start", background:"transparent", color:T.textSec, borderBottom:`1px solid ${T.border}`, fontSize:14, gap:10 }}>{it.icon} {it.label}</button>
          ))}
        </nav>
      </div>
    </div>
  );
}
