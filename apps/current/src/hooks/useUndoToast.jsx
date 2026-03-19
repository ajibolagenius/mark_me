import { useState, useRef, useCallback } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from '../components/Icons';

export function useUndoToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const countRef = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(countRef.current);
    setToast(null);
  }, []);

  const flash = useCallback((msg) => {
    clear();
    setToast({ msg });
    timerRef.current = setTimeout(clear, 2200);
  }, [clear]);

  const flashUndo = useCallback((msg, onUndo, duration = 5000) => {
    clear();
    const end = Date.now() + duration;
    setToast({ msg, onUndo, remaining: duration });
    countRef.current = setInterval(() => {
      const left = Math.max(0, end - Date.now());
      if (left <= 0) { clear(); return; }
      setToast(prev => prev ? { ...prev, remaining: left } : null);
    }, 50);
    timerRef.current = setTimeout(clear, duration);
  }, [clear]);

  const handleUndo = useCallback(() => {
    if (toast?.onUndo) toast.onUndo();
    clear();
  }, [toast, clear]);

  const secs = toast?.remaining ? Math.ceil(toast.remaining / 1000) : 0;
  const pct = toast?.remaining ? (toast.remaining / 5000) * 100 : 0;

  const ToastEl = toast ? (
    <div role="status" aria-live="assertive" aria-atomic="true" style={{
      position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", zIndex:2000,
      background:T.bgEl, border:`1px solid ${T.border}`, boxShadow:"6px 6px 0 rgba(0,0,0,0.5)",
      animation:"mmSlideUp .2s ease", fontFamily:T.font, minWidth:260, maxWidth:"90vw", overflow:"hidden",
    }}>
      {toast.onUndo && (
        <div style={{ height:3, background:T.error, width:`${pct}%`, transition:"width 0.1s linear" }} aria-hidden="true" />
      )}
      <div style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:12, justifyContent:"space-between" }}>
        <span style={{ fontSize:13, fontWeight:600, color:T.text, display:"flex", alignItems:"center", gap:6 }}>
          {toast.onUndo && <span aria-hidden="true" style={{ color:T.error, display:"flex" }}><I.Trash /></span>}
          {toast.msg}
        </span>
        {toast.onUndo ? (
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <span style={{ fontSize:11, color:T.textMuted, fontVariantNumeric:"tabular-nums", minWidth:16, textAlign:"center" }}>{secs}s</span>
            <button onClick={handleUndo} aria-label="Undo delete" style={{
              ...S.btn, background:T.primary, color:"#fff", padding:"5px 12px", fontSize:12, fontWeight:800,
            }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            >Undo</button>
            <button onClick={clear} aria-label="Dismiss" style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:4 }}
              onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}
            ><I.X s={12} /></button>
          </div>
        ) : (
          <span style={{ color:T.success, display:"flex" }}><I.Check /></span>
        )}
      </div>
    </div>
  ) : null;

  return { flash, flashUndo, ToastEl };
}
