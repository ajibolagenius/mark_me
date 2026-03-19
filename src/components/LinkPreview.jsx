import { useState, useRef } from 'react';
import { T } from '../constants/tokens';
import { getDomain, getFavicon } from '../utils/helpers';
import { I } from './Icons';

export function LinkPreview({ url, title, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x:0, y:0 });
  const timer = useRef(null);
  const domain = getDomain(url);

  const onEnter = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.top - 6 });
    timer.current = setTimeout(() => setShow(true), 400);
  };
  const onLeave = () => { clearTimeout(timer.current); setShow(false); };

  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ display:"contents" }}>
      {children}
      {show && (
        <div style={{
          position:"fixed", left:Math.min(pos.x, window.innerWidth-260), top:pos.y, transform:"translateY(-100%)",
          background:T.bgPanel, border:`1px solid ${T.border}`, padding:"10px 12px",
          width:240, boxShadow:"4px 4px 0 rgba(0,0,0,0.4)", zIndex:800,
          animation:"mmFadeIn .15s ease", pointerEvents:"none",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <img src={getFavicon(url)} alt="" width={14} height={14} />
            <span style={{ fontSize:11, fontWeight:700, color:T.text, fontFamily:T.font, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title}</span>
          </div>
          <div style={{ fontSize:10, color:T.textMuted, fontFamily:T.font, display:"flex", alignItems:"center", gap:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            <I.Globe /> {domain}
          </div>
          <div style={{ fontSize:10, color:T.textMuted, marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"monospace" }}>{url}</div>
        </div>
      )}
    </div>
  );
}
