import { useState, useEffect, useRef } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from './Icons';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useIsMobile } from '../hooks/useIsMobile';

export function Modal({ open, onClose, title, children, wide }) {
  const trapRef = useFocusTrap(open);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2,6)}`).current;
  const isMobile = useIsMobile();

  const dragStartY = useRef(0);
  const dragDist = useRef(0);
  const [sheetOffset, setSheetOffset] = useState(0);
  const dragging = useRef(false);

  const onDragStart = e => {
    if (!isMobile) return;
    dragStartY.current = e.touches[0].clientY;
    dragging.current = true;
  };
  const onDragMove = e => {
    if (!dragging.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy < 0) return;
    dragDist.current = dy;
    setSheetOffset(dy);
  };
  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragDist.current > 100) {
      setSheetOffset(600);
      setTimeout(() => { onClose(); setSheetOffset(0); }, 200);
    } else {
      setSheetOffset(0);
    }
    dragDist.current = 0;
  };

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    if (isMobile) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isMobile]);

  useEffect(() => {
    if (!open) setSheetOffset(0);
  }, [open]);

  if (!open) return null;

  if (isMobile) {
    return (
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} ref={trapRef}
        style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", flexDirection:"column", justifyContent:"flex-end", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", animation:"mmFadeIn .1s ease" }}
        onClick={onClose}>
        <div onClick={e=>e.stopPropagation()} style={{
          background:T.bgEl, borderTop:`1px solid ${T.border}`, maxHeight:"88vh", overflowY:"auto",
          animation:"mmSheetUp .25s cubic-bezier(0.32,0.72,0,1)",
          transform:`translateY(${sheetOffset}px)`,
          transition: dragging.current ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
          WebkitOverflowScrolling:"touch",
        }}>
          <div onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
            style={{ padding:"10px 0 2px", display:"flex", justifyContent:"center", cursor:"grab", touchAction:"none" }}>
            <div style={{ width:36, height:4, background:T.borderStrong, borderRadius:2 }} />
          </div>
          <div style={{ padding:"14px 20px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h2 id={titleId} style={{ fontFamily:T.font, fontSize:17, fontWeight:800, margin:0, color:T.text, letterSpacing:"-0.03em" }}>{title}</h2>
              <button onClick={onClose} aria-label="Close dialog" style={{ ...S.btn, background:T.bgInput, width:32, height:32, padding:0, color:T.textMuted, border:`1px solid ${T.border}` }}><I.X /></button>
            </div>
            {children}
          </div>
          <div style={{ paddingBottom:"env(safe-area-inset-bottom, 0px)" }} />
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} ref={trapRef}
      style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(12px)", animation:"mmFadeIn .15s ease", padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bgEl, border:`1px solid ${T.border}`, padding:"24px 28px", width:wide?520:420, maxWidth:"100%", maxHeight:"85vh", overflowY:"auto", boxShadow:"8px 8px 0 rgba(0,0,0,0.5)", animation:"mmSlideUp .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 id={titleId} style={{ fontFamily:T.font, fontSize:18, fontWeight:800, margin:0, color:T.text, letterSpacing:"-0.03em" }}>{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" style={{ ...S.btn, background:T.bgInput, width:32, height:32, padding:0, color:T.textMuted, border:`1px solid ${T.border}` }}><I.X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
