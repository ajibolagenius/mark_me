import { useEffect, useRef } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from './Icons';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useIsMobile } from '../hooks/useIsMobile';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, itemName, count }) {
  const trapRef = useFocusTrap(open);
  const titleId = useRef(`confirm-${Math.random().toString(36).slice(2,6)}`).current;
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    if (isMobile) document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose, isMobile]);

  if (!open) return null;

  const content = (
    <>
      <div style={{ height:3, background:T.error }} aria-hidden="true" />
      <div style={{ padding:"24px 24px 20px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
          <div style={{ width:40, height:40, background:T.error+"15", border:`1px solid ${T.error}30`, display:"flex", alignItems:"center", justifyContent:"center", color:T.error, flexShrink:0 }}><I.Trash /></div>
          <div>
            <h3 id={titleId} style={{ fontFamily:T.font, fontSize:16, fontWeight:800, color:T.text, letterSpacing:"-0.02em", margin:"0 0 6px" }}>{title || "Delete forever?"}</h3>
            <p id={`${titleId}-desc`} style={{ fontSize:13, color:T.textSec, lineHeight:1.5, margin:0 }}>{message || <>Are you sure you want to delete <strong style={{ color:T.text }}>{itemName}</strong>?</>}</p>
            {count > 0 && <p style={{ fontSize:12, color:T.warning, marginTop:6, display:"flex", alignItems:"center", gap:4 }}><I.Zap /> This will also remove {count} bookmark{count !== 1 ? "s" : ""} inside</p>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={onClose} aria-label="Cancel" style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"9px 18px", border:`1px solid ${T.border}`, fontSize:13 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}>Cancel</button>
          <button onClick={onConfirm} aria-label={`Confirm delete ${itemName || ""}`} style={{ ...S.btn, background:T.error, color:"#fff", padding:"9px 18px", fontSize:13, fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(0,0,0,0.3)"}}>Delete</button>
        </div>
      </div>
      {isMobile && <div style={{ paddingBottom:"env(safe-area-inset-bottom, 0px)" }} />}
    </>
  );

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${titleId}-desc`} ref={trapRef}
      style={{
        position:"fixed", inset:0, zIndex:1100,
        display:"flex", alignItems:isMobile?"flex-end":"center", justifyContent:"center",
        background:"rgba(0,0,0,0.65)", backdropFilter:"blur(12px)", animation:"mmFadeIn .15s ease",
        padding:isMobile?0:16,
      }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.bgEl, border:isMobile?"none":`1px solid ${T.error}30`,
        borderTop:isMobile?`1px solid ${T.error}30`:undefined,
        width:isMobile?"100%":400, maxWidth:"100%", overflow:"hidden",
        boxShadow:isMobile?"none":"8px 8px 0 rgba(0,0,0,0.5)",
        animation:isMobile?"mmSheetUp .25s cubic-bezier(0.32,0.72,0,1)":"mmSlideUp .2s ease",
      }}>
        {isMobile && <div style={{ padding:"10px 0 2px", display:"flex", justifyContent:"center" }}><div style={{ width:36, height:4, background:T.borderStrong, borderRadius:2 }} /></div>}
        {content}
      </div>
    </div>
  );
}
