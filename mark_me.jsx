import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg: "#0D0D0D", bgEl: "#161616", bgPanel: "#1a1a1a", bgInput: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)", borderStrong: "rgba(255,255,255,0.14)",
  primary: "#A855F7", primarySoft: "rgba(168,85,247,0.25)", primaryGlow: "rgba(168,85,247,0.35)", primarySubtle: "rgba(168,85,247,0.08)",
  secondary: "#22D3EE", secondarySoft: "rgba(34,211,238,0.2)", secondaryGlow: "rgba(34,211,238,0.25)", secondarySubtle: "rgba(34,211,238,0.06)",
  text: "#FFFFFF", textSec: "rgba(255,255,255,0.7)", textMuted: "rgba(255,255,255,0.5)",
  success: "#22C55E", error: "#EF4444", warning: "#F59E0B",
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
};

const TAG_COLORS = ["#A855F7","#22D3EE","#22C55E","#F59E0B","#EF4444","#EC4899","#6366F1","#14B8A6","#F97316","#84CC16"];
const ACCENTS = [
  { bg: "#A855F7", glow: "rgba(168,85,247,0.25)" },
  { bg: "#22D3EE", glow: "rgba(34,211,238,0.25)" },
  { bg: "#22C55E", glow: "rgba(34,197,94,0.25)" },
  { bg: "#F59E0B", glow: "rgba(245,158,11,0.25)" },
  { bg: "#EF4444", glow: "rgba(239,68,68,0.25)" },
  { bg: "#EC4899", glow: "rgba(236,72,153,0.25)" },
  { bg: "#6366F1", glow: "rgba(99,102,241,0.25)" },
  { bg: "#14B8A6", glow: "rgba(20,184,166,0.25)" },
];

const DEMO_DATA = [
  { id:"c1", name:"Design Inspiration", color:0, icon:"🎨", tags:["design","ui/ux"], bookmarks:[
    { id:"b1", title:"Dribbble", url:"https://dribbble.com", tags:["design"], note:"Daily design inspiration", pinned:true },
    { id:"b2", title:"Behance", url:"https://behance.net", tags:["design"], note:"Portfolio showcase" },
    { id:"b3", title:"Awwwards", url:"https://awwwards.com", tags:["ui/ux"], note:"Award-winning websites" },
  ]},
  { id:"c2", name:"Dev Tools", color:1, icon:"⚡", tags:["dev","tools"], bookmarks:[
    { id:"b4", title:"GitHub", url:"https://github.com", tags:["dev"], note:"Code hosting", pinned:true },
    { id:"b5", title:"VS Code Web", url:"https://vscode.dev", tags:["tools"], note:"Browser-based IDE" },
    { id:"b6", title:"CodePen", url:"https://codepen.io", tags:["dev"], note:"Frontend playground" },
    { id:"b7", title:"Stack Overflow", url:"https://stackoverflow.com", tags:["dev"], note:"Q&A for devs" },
  ]},
  { id:"c3", name:"Reading List", color:5, icon:"📚", tags:["articles"], bookmarks:[
    { id:"b8", title:"Medium", url:"https://medium.com", tags:["articles"], note:"Blog platform" },
    { id:"b9", title:"Dev.to", url:"https://dev.to", tags:["articles"], note:"Developer community" },
  ]},
  { id:"c4", name:"Productivity", color:2, icon:"🚀", tags:["work","apps"], bookmarks:[
    { id:"b10", title:"Notion", url:"https://notion.so", tags:["work"], note:"All-in-one workspace", pinned:true },
    { id:"b11", title:"Linear", url:"https://linear.app", tags:["work"], note:"Issue tracking" },
    { id:"b12", title:"Figma", url:"https://figma.com", tags:["apps"], note:"Design tool" },
  ]},
  { id:"c5", name:"Entertainment", color:4, icon:"🎬", tags:["fun","media"], bookmarks:[
    { id:"b13", title:"YouTube", url:"https://youtube.com", tags:["media"], note:"Video platform" },
    { id:"b14", title:"Spotify", url:"https://spotify.com", tags:["fun"], note:"Music streaming" },
  ]},
  { id:"c6", name:"AI & ML", color:6, icon:"🤖", tags:["ai","research"], bookmarks:[
    { id:"b15", title:"Hugging Face", url:"https://huggingface.co", tags:["ai"], note:"ML models hub", pinned:true },
    { id:"b16", title:"Papers With Code", url:"https://paperswithcode.com", tags:["research"], note:"ML papers + code" },
    { id:"b17", title:"Anthropic", url:"https://anthropic.com", tags:["ai"], note:"AI safety" },
  ]},
];

const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const getDomain = u => { try { return new URL(u).hostname.replace("www.",""); } catch { return ""; } };
const getFavicon = u => `https://www.google.com/s2/favicons?domain=${getDomain(u)}&sz=32`;
const tagColor = t => TAG_COLORS[t.split("").reduce((a,c) => a + c.charCodeAt(0), 0) % TAG_COLORS.length];

/* ══════════════════════════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════════════════════════ */
const I = {
  Search: p => <svg width={p?.s||16} height={p?.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  X: p => <svg width={p?.s||14} height={p?.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Pin: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2L14.5 3.5l1 1-5.5 5.5H6l-1 1 4.5 4.5-5 5.5h1.5l4.5-4 4.5 4.5 1-1v-4l5.5-5.5 1 1L24 8z"/></svg>,
  Copy: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Globe: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Chev: p => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={p?.style}><path d="m6 9 6 6 6-6"/></svg>,
  Export: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  Import: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  Zap: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  External: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  User: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Cloud: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  Layout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="0"/><path d="M3 9h18M9 21V9"/></svg>,
  Chrome: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M21.17 8H12M3.95 6.06 8.54 14M10.88 21.94 15.46 14"/></svg>,
  Lock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="0"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>,
  ArrowR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  LogOut: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Settings: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Bookmark: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  BookmarkSm: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  Grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="4"/><rect x="14" y="11" width="7" height="10"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Tag: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Camera: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Sort: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18M6 12h12M9 18h6"/></svg>,
  AZ: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h4M4 18h4M4 12h6"/><path d="M17 3v18M14 18l3 3 3-3"/></svg>,
  Hash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
};

/* ══════════════════════════════════════════════════════════════════════════
   SHARED STYLES & COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */
const S = {
  btn: { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:T.font, fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", border:"none", borderRadius:0, textDecoration:"none" },
  input: { width:"100%", padding:"12px 14px", background:T.bgInput, border:`1px solid ${T.border}`, borderRadius:0, color:T.text, fontSize:14, fontFamily:T.font, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" },
};

/* Noise + Glows */
const Atmosphere = () => (
  <>
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.025, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    <div style={{ position:"fixed", top:-100, left:-100, width:300, height:300, borderRadius:"50%", background:T.primary, filter:"blur(120px)", opacity:0.06, pointerEvents:"none" }} />
    <div style={{ position:"fixed", bottom:-80, right:-80, width:250, height:250, borderRadius:"50%", background:T.secondary, filter:"blur(100px)", opacity:0.05, pointerEvents:"none" }} />
  </>
);

/* Logo */
const Logo = ({ size = 28 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
    <div style={{ width:size, height:size, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:size*0.55, filter:"brightness(2)" }}>🔖</span>
    </div>
    <span style={{ fontWeight:800, fontSize:size*0.6, letterSpacing:"-0.04em", fontFamily:T.font }}>mark<span style={{ color:T.primary }}>_</span>me</span>
  </div>
);

/* Modal — desktop: centered dialog, mobile: bottom sheet with drag handle */
function Modal({ open, onClose, title, children, wide }) {
  const trapRef = useFocusTrap(open);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2,6)}`).current;
  const isMobile = useIsMobile();

  // Drag-to-dismiss for bottom sheet
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
    // Prevent body scroll on mobile when modal open
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
    // Bottom sheet mode
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
          {/* Drag handle */}
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
          {/* Safe area padding for notched devices */}
          <div style={{ paddingBottom:"env(safe-area-inset-bottom, 0px)" }} />
        </div>
      </div>
    );
  }

  // Desktop centered dialog
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

/* Field */
function Field({ label, type = "text", icon, rightIcon, onRightClick, id: propId, ...props }) {
  const autoId = useRef(`field-${Math.random().toString(36).slice(2,7)}`).current;
  const fieldId = propId || autoId;
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label htmlFor={fieldId} style={{ display:"block", fontSize:11, fontWeight:600, color:T.textMuted, marginBottom:6, fontFamily:T.font, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.textMuted, display:"flex" }} aria-hidden="true">{icon}</div>}
        <input id={fieldId} type={type} aria-label={label || props.placeholder} {...props} style={{ ...S.input, paddingLeft: icon ? 38 : 14, paddingRight: rightIcon ? 38 : 14, ...(props.style||{}) }}
          onFocus={e=>e.target.style.borderColor=T.primary} onBlur={e=>e.target.style.borderColor=T.border} />
        {rightIcon && <button onClick={onRightClick} type="button" aria-label={type==="password"?"Show password":"Toggle visibility"} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.textMuted, cursor:"pointer", display:"flex", padding:4 }}>{rightIcon}</button>}
      </div>
    </div>
  );
}

/* Tag */
function Tag({ tag, small, removable, onRemove, onClick, active }) {
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

/* Toast hook — supports simple messages + undo actions */
function useUndoToast() {
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

/* ── Confirm Dialog ── */
function ConfirmDialog({ open, onClose, onConfirm, title, message, itemName, count }) {
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

/* ── Animated Collapse (smooth expand/collapse) ── */
function AnimatedCollapse({ open, children }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(open ? "auto" : 0);
  const [overflow, setOverflow] = useState(open ? "visible" : "hidden");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const el = contentRef.current;
    if (!el) return;
    if (open) {
      const h = el.scrollHeight;
      setHeight(0);
      setOverflow("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(h);
          setTimeout(() => { setHeight("auto"); setOverflow("visible"); }, 320);
        });
      });
    } else {
      const h = el.scrollHeight;
      setHeight(h);
      setOverflow("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div ref={contentRef} style={{
      height: typeof height === "number" ? height + "px" : height,
      overflow,
      transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
      opacity: (typeof height === "number" && height === 0 && !open) ? 0 : 1,
    }}>
      {children}
    </div>
  );
}

/* ── Page Transition Wrapper ── */
function PageTransition({ pageKey, children }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState("in");
  const prevKey = useRef(pageKey);

  useEffect(() => {
    if (pageKey !== prevKey.current) {
      setPhase("out");
      const t = setTimeout(() => {
        setDisplayChildren(children);
        prevKey.current = pageKey;
        setPhase("in");
      }, 200);
      return () => clearTimeout(t);
    } else {
      setDisplayChildren(children);
    }
  }, [pageKey, children]);

  return (
    <div style={{
      opacity: phase === "out" ? 0 : 1,
      transform: phase === "out" ? "translateY(6px)" : "translateY(0)",
      transition: "opacity 0.2s cubic-bezier(0.4,0,0.2,1), transform 0.2s cubic-bezier(0.4,0,0.2,1)",
      willChange: "opacity, transform",
    }}>
      {displayChildren}
    </div>
  );
}

/* ── Animated Counter (stats roll up) ── */
function AnimCount({ to, duration = 600 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [to, duration]);
  return val;
}

/* ── Stagger entrance hook ── */
function useStagger(count, baseDelay = 40, initialDelay = 60) {
  return (i) => ({
    animation: `mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${initialDelay + i * baseDelay}ms both`,
  });
}

/* ── Focus Trap Hook (for modals & overlays) ── */
function useFocusTrap(active) {
  const trapRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (!active) return;
    prevFocus.current = document.activeElement;
    const el = trapRef.current;
    if (!el) return;

    const focusable = () => el.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const timer = setTimeout(() => {
      const nodes = focusable();
      if (nodes.length) nodes[0].focus();
    }, 50);

    const handleKey = e => {
      if (e.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    el.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("keydown", handleKey);
      if (prevFocus.current && prevFocus.current.focus) {
        try { prevFocus.current.focus(); } catch {}
      }
    };
  }, [active]);

  return trapRef;
}

/* ── Skip to content link (screen reader shortcut) ── */
const SkipLink = () => (
  <a href="#main-content" style={{
    position:"absolute", top:-40, left:0, background:T.primary, color:"#fff",
    padding:"8px 16px", zIndex:9999, fontSize:13, fontWeight:700, fontFamily:T.font,
    transition:"top 0.2s", textDecoration:"none",
  }} onFocus={e=>e.currentTarget.style.top="0"} onBlur={e=>e.currentTarget.style.top="-40px"}>
    Skip to content
  </a>
);

/* ── Mobile detection hook ── */
function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= breakpoint : false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

/* ── Debounce hook ── */
function useDebounce(value, delay = 150) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ── Highlight matched text ── */
function Highlight({ text, query }) {
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

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(err, info) { console.error("ErrorBoundary caught:", err, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background:T.bgEl, border:`1px solid ${T.error}30`, padding:24, margin:16, fontFamily:T.font }}>
          <div style={{ height:3, background:T.error, marginBottom:16, marginTop:-24, marginLeft:-24, marginRight:-24 }} />
          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:36, height:36, background:T.error+"15", border:`1px solid ${T.error}30`, display:"flex", alignItems:"center", justifyContent:"center", color:T.error, flexShrink:0 }}>
              <I.Shield />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{ fontFamily:T.font, fontSize:14, fontWeight:800, color:T.text, letterSpacing:"-0.02em", margin:"0 0 6px" }}>
                {this.props.fallbackTitle || "Something went wrong"}
              </h3>
              <p style={{ fontSize:12, color:T.textMuted, lineHeight:1.5, margin:"0 0 12px" }}>
                {this.props.fallbackMessage || "This section encountered an error. Your data is safe."}
              </p>
              <div style={{ fontSize:11, color:T.error, background:T.error+"10", border:`1px solid ${T.error}20`, padding:"6px 10px", marginBottom:12, fontFamily:"monospace", maxHeight:60, overflow:"auto", whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                {this.state.error?.message || "Unknown error"}
              </div>
              <button onClick={() => this.setState({ error: null })}
                style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:T.font, fontWeight:700, fontSize:12, cursor:"pointer", border:"none", borderRadius:0, background:T.error, color:"#fff", padding:"7px 16px", boxShadow:"2px 2px 0 rgba(0,0,0,0.3)", transition:"all 0.2s" }}>
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Virtual Masonry Grid ── */
function VirtualMasonry({ items, renderItem, columnCount = 3, gap = 14 }) {
  const containerRef = useRef(null);
  const [visibleSet, setVisibleSet] = useState(new Set());
  const observerRef = useRef(null);
  const sentinelRefs = useRef({});

  // Estimated heights for placeholder sizing
  const heightCache = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;
    observerRef.current = new IntersectionObserver(
      entries => {
        setVisibleSet(prev => {
          const next = new Set(prev);
          entries.forEach(e => {
            const id = e.target.dataset.vid;
            if (e.isIntersecting) next.add(id);
            else next.delete(id);
          });
          return next;
        });
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  // Re-observe when items change
  useEffect(() => {
    const obs = observerRef.current;
    if (!obs) return;
    obs.disconnect();
    Object.values(sentinelRefs.current).forEach(el => { if (el) obs.observe(el); });
  }, [items.length]);

  const setSentinelRef = useCallback((id, el) => {
    sentinelRefs.current[id] = el;
    if (el && observerRef.current) observerRef.current.observe(el);
  }, []);

  // Measure rendered cards and cache heights
  const onCardRender = useCallback((id, el) => {
    if (el) heightCache.current[id] = el.offsetHeight;
  }, []);

  return (
    <div ref={containerRef} style={{ columnCount, columnGap: gap }} className="mm-grid">
      {items.map((item, i) => {
        const id = item.id || `vi-${i}`;
        const isVisible = visibleSet.has(id);
        const cachedH = heightCache.current[id];
        return (
          <div key={id}
            ref={el => setSentinelRef(id, el)}
            data-vid={id}
            style={{ breakInside:"avoid", marginBottom: gap, animation: isVisible ? `mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${Math.min(80 + i*40, 400)}ms both` : "none" }}>
            {isVisible ? (
              <div ref={el => onCardRender(id, el)}>
                {renderItem(item, i)}
              </div>
            ) : (
              <div style={{ height: cachedH || 160, background:"transparent" }} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Swipeable Bookmark Row ── */
function SwipeRow({ onSwipeDelete, children }) {
  const rowRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const [offset, setOffset] = useState(0);
  const [showBg, setShowBg] = useState(false);
  const THRESHOLD = 90;

  const onTouchStart = e => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = 0;
    swiping.current = false;
  };

  const onTouchMove = e => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    if (!swiping.current && Math.abs(dy) > Math.abs(dx)) return;
    if (dx < -10) swiping.current = true;
    if (!swiping.current) return;
    e.preventDefault();
    const clamped = Math.max(Math.min(dx, 0), -160);
    currentX.current = clamped;
    setOffset(clamped);
    setShowBg(clamped < -20);
  };

  const onTouchEnd = () => {
    if (currentX.current < -THRESHOLD) {
      setOffset(-160);
      setTimeout(() => {
        onSwipeDelete();
        setOffset(0);
        setShowBg(false);
      }, 200);
    } else {
      setOffset(0);
      setShowBg(false);
    }
    swiping.current = false;
  };

  return (
    <div style={{ position:"relative", overflow:"hidden" }}>
      {/* Red background behind row */}
      <div style={{
        position:"absolute", inset:0, background:T.error,
        display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:20,
        opacity:showBg ? 1 : 0, transition:"opacity 0.15s",
      }}>
        <div style={{ color:"#fff", display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, fontFamily:T.font }}>
          <I.Trash /> Delete
        </div>
      </div>
      {/* Actual row content slides */}
      <div ref={rowRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform:`translateX(${offset}px)`,
          transition: offset === 0 || offset === -160 ? "transform 0.25s cubic-bezier(0.4,0,0.2,1)" : "none",
          position:"relative", zIndex:1, background:T.bgEl,
        }}>
        {children}
      </div>
    </div>
  );
}

/* ── Pull to Refresh ── */
function PullToRefresh({ onRefresh, children }) {
  const containerRef = useRef(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const PULL_THRESHOLD = 70;

  const onTouchStart = e => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const onTouchMove = e => {
    if (!pulling.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy < 0) { pulling.current = false; setPullDist(0); return; }
    const dampened = Math.min(dy * 0.45, 120);
    setPullDist(dampened);
  };

  const onTouchEnd = () => {
    if (pullDist >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDist(50);
      onRefresh();
      setTimeout(() => {
        setRefreshing(false);
        setPullDist(0);
      }, 800);
    } else {
      setPullDist(0);
    }
    pulling.current = false;
  };

  const ready = pullDist >= PULL_THRESHOLD;

  return (
    <div ref={containerRef}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ position:"relative" }}>
      {/* Pull indicator */}
      <div aria-hidden="true" style={{
        height: pullDist, overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition: pulling.current ? "none" : "height 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {pullDist > 10 && (
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            opacity: Math.min(pullDist / 50, 1),
            transform: `rotate(${refreshing ? 360 : ready ? 180 : (pullDist / PULL_THRESHOLD) * 180}deg)`,
            transition: refreshing ? "transform 0.5s linear" : pulling.current ? "none" : "transform 0.2s ease",
            animation: refreshing ? "mmSpin 0.6s linear infinite" : "none",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ready || refreshing ? T.primary : T.textMuted} strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </div>
        )}
        {pullDist > 10 && !refreshing && (
          <span style={{ position:"absolute", fontSize:10, fontWeight:600, color:ready ? T.primary : T.textMuted, fontFamily:T.font, marginTop:30 }}>
            {ready ? "Release to refresh" : "Pull to refresh"}
          </span>
        )}
        {refreshing && (
          <span style={{ position:"absolute", fontSize:10, fontWeight:600, color:T.primary, fontFamily:T.font, marginTop:30 }}>Refreshing…</span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: LANDING
   ══════════════════════════════════════════════════════════════════════════ */
function LandingPage({ onNavigate }) {
  const features = [
    { icon: <I.Grid />, title: "Masonry Grid", desc: "Visual bento layout that makes browsing your links feel intentional" },
    { icon: <I.Tag />, title: "Smart Tags", desc: "Color-coded pills to slice and filter your collection instantly" },
    { icon: <I.Bookmark />, title: "Pin & Organize", desc: "Pin your most-used links, group by category, drag to reorder" },
    { icon: <I.Chrome />, title: "Chrome Extension", desc: "One-click save from any page — auto-tagged, auto-categorized", soon: true },
    { icon: <I.Cloud />, title: "Cloud Sync", desc: "Firebase-backed storage keeps your bookmarks safe across devices", soon: true },
    { icon: <I.Layout />, title: "Bio Website", desc: "Generate a sleek link-in-bio page from your public bookmarks", soon: true },
  ];

  const stats = [
    { val: "12K+", label: "Bookmarks saved" },
    { val: "2.4K", label: "Active users" },
    { val: "99.9%", label: "Uptime" },
    { val: "< 50ms", label: "Load time" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text }}>
      <Atmosphere />
      <SkipLink />

      {/* Nav */}
      <nav aria-label="Site navigation" style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(13,13,13,0.85)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Logo />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={()=>onNavigate("login")} style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"7px 16px", border:`1px solid ${T.border}` }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}>Log in</button>
            <button onClick={()=>onNavigate("signup")} style={{ ...S.btn, background:"#fff", color:T.bg, padding:"7px 16px", fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(0,0,0,0.3)"}}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="main-content" style={{ maxWidth:1100, margin:"0 auto", padding:"80px 20px 60px", position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{ animation:"mmSlideUp .5s ease both" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:T.primarySubtle, border:`1px solid ${T.primary}30`, padding:"4px 14px", marginBottom:24, fontSize:11, fontWeight:700, color:T.primary, textTransform:"uppercase", letterSpacing:"0.04em" }}>
            <I.Zap /> Now in public beta
          </div>
          <h1 style={{ fontFamily:T.font, fontSize:"clamp(2.5rem, 6vw, 4rem)", fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.1, marginBottom:20, color:T.text }}>
            Your bookmarks,<br/><span style={{ background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>beautifully organized.</span>
          </h1>
          <p style={{ fontSize:"clamp(1rem, 2vw, 1.15rem)", color:T.textSec, maxWidth:520, margin:"0 auto 36px", lineHeight:1.6, fontWeight:500 }}>
            Stop losing links in browser chaos. Save, tag, and browse your bookmarks in a visual grid designed for humans — not file trees.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={()=>onNavigate("signup")} style={{ ...S.btn, background:"#fff", color:T.bg, padding:"14px 32px", fontSize:15, fontWeight:800, boxShadow:"4px 4px 0 rgba(0,0,0,0.4)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="6px 6px 0 rgba(0,0,0,0.5)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}}>
              Start for free <I.ArrowR />
            </button>
            <button onClick={()=>onNavigate("login")} style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"14px 28px", fontSize:15, border:`1px solid ${T.border}` }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}>
              I have an account
            </button>
          </div>
        </div>

        {/* Preview mockup */}
        <div style={{ marginTop:60, background:T.bgEl, border:`1px solid ${T.border}`, padding:3, boxShadow:"8px 8px 0 rgba(0,0,0,0.4)", position:"relative", animation:"mmCardSpring .6s cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, left:"20%", width:200, height:200, borderRadius:"50%", background:T.primary, filter:"blur(80px)", opacity:0.08 }} />
          <div style={{ position:"absolute", bottom:-30, right:"20%", width:180, height:180, borderRadius:"50%", background:T.secondary, filter:"blur(70px)", opacity:0.06 }} />
          <div style={{ background:T.bgPanel, padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8 }} aria-hidden="true">
            <div style={{ display:"flex", gap:5 }}>{[T.error,"#F59E0B",T.success].map((c,i)=><div key={i} style={{ width:8, height:8, borderRadius:"50%", background:c, opacity:0.6 }} />)}</div>
            <div style={{ flex:1, background:T.bgInput, border:`1px solid ${T.border}`, padding:"4px 10px", fontSize:11, color:T.textMuted }}>app.markme.io/dashboard</div>
          </div>
          <div style={{ padding:20, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, minHeight:180 }}>
            {[0,1,2,3,4,5].map(i => {
              const ac = ACCENTS[i % ACCENTS.length];
              return (
                <div key={i} style={{ background:T.bgEl, border:`1px solid ${T.border}`, overflow:"hidden", minHeight: i%3===0 ? 120 : 80 }}>
                  <div style={{ height:3, background:ac.bg }} />
                  <div style={{ padding:10 }}>
                    <div style={{ width:"60%", height:8, background:"rgba(255,255,255,0.08)", marginBottom:6 }} />
                    <div style={{ width:"40%", height:6, background:"rgba(255,255,255,0.04)" }} />
                    <div style={{ display:"flex", gap:3, marginTop:8 }}>{[0,1].map(j=><div key={j} style={{ width:28, height:10, background:ac.bg+"25", border:`1px solid ${ac.bg}30` }} />)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px 60px", position:"relative", zIndex:1 }}>
        <div className="mm-landing-stats" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:T.border }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:T.bg, padding:"28px 20px", textAlign:"center", animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*70}ms both` }}>
              <div style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.03em", color:T.text, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"20px 20px 80px", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:48, animation:"mmSlideUp .4s ease both" }}>
          <h2 style={{ fontFamily:T.font, fontSize:"clamp(1.5rem, 3vw, 2rem)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:12 }}>Everything you need.</h2>
          <p style={{ color:T.textSec, fontSize:15, maxWidth:400, margin:"0 auto" }}>A focused set of tools to replace the browser bookmark bar forever.</p>
        </div>
        <div className="mm-features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:T.border }}>
          {features.map((f,i) => (
            <div key={i} style={{ background:T.bg, padding:"32px 28px", position:"relative", overflow:"hidden", animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*70}ms both`, transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=T.bgEl} onMouseLeave={e=>e.currentTarget.style.background=T.bg}>
              {f.soon && <span style={{ position:"absolute", top:12, right:12, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color:T.warning, background:T.warning+"18", padding:"2px 6px", border:`1px solid ${T.warning}30` }}>Soon</span>}
              <div style={{ width:40, height:40, background:T.primarySubtle, border:`1px solid ${T.primary}25`, display:"flex", alignItems:"center", justifyContent:"center", color:T.primary, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ fontFamily:T.font, fontSize:15, fontWeight:800, color:T.text, marginBottom:8, letterSpacing:"-0.02em" }}>{f.title}</h3>
              <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop:`1px solid ${T.border}`, position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"80px 20px", textAlign:"center" }}>
          <h2 style={{ fontFamily:T.font, fontSize:"clamp(1.5rem, 3vw, 2.25rem)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:16 }}>Ready to organize your internet?</h2>
          <p style={{ color:T.textSec, fontSize:15, marginBottom:32, maxWidth:400, margin:"0 auto 32px" }}>Free to use. No credit card required.</p>
          <button onClick={()=>onNavigate("signup")} style={{ ...S.btn, background:"#fff", color:T.bg, padding:"14px 36px", fontSize:15, fontWeight:800, boxShadow:"4px 4px 0 rgba(0,0,0,0.4)" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="6px 6px 0 rgba(0,0,0,0.5)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}}>
            Create your account <I.ArrowR />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:`1px solid ${T.border}`, position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <Logo size={20} />
          <span style={{ fontSize:12, color:T.textMuted }}>&copy; 2026 mark_me. All rights reserved.</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .mm-features-grid { grid-template-columns: 1fr !important; }
          .mm-landing-stats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: AUTH (Login / Signup)
   ══════════════════════════════════════════════════════════════════════════ */
function AuthPage({ mode, onNavigate, onLogin }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = e => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (pass.length < 6) { setError("Password must be 6+ characters"); return; }
    if (!isLogin && !name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: name || email.split("@")[0], email, avatar: null, plan: "free", joinedAt: new Date().toISOString() });
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text, display:"flex", flexDirection:"column" }}>
      <Atmosphere />
      <SkipLink />

      {/* Top bar */}
      <nav aria-label="Back to home" style={{ padding:"16px 20px", position:"relative", zIndex:1 }}>
        <div onClick={()=>onNavigate("landing")} role="button" tabIndex={0} aria-label="Go to homepage" onKeyDown={e=>{if(e.key==="Enter")onNavigate("landing")}} style={{ cursor:"pointer", display:"inline-block" }}><Logo /></div>
      </nav>

      {/* Form */}
      <main id="main-content" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", position:"relative", zIndex:1 }}>
        <div style={{ width:400, maxWidth:"100%", animation:"mmSlideUp .3s ease both" }}>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontFamily:T.font, fontSize:28, fontWeight:800, letterSpacing:"-0.04em", marginBottom:8 }}>
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p style={{ color:T.textSec, fontSize:14 }}>
              {isLogin ? "Sign in to access your bookmarks" : "Start organizing your internet for free"}
            </p>
          </div>

          <form onSubmit={submit} aria-label={isLogin ? "Sign in form" : "Sign up form"}>
            {!isLogin && (
              <Field label="Full Name" placeholder="Your name" icon={<I.User />} value={name} onChange={e=>setName(e.target.value)} />
            )}
            <Field label="Email" type="email" placeholder="you@example.com" icon={<I.Mail />} value={email} onChange={e=>setEmail(e.target.value)} />
            <Field label="Password" type={showPass?"text":"password"} placeholder="••••••••" icon={<I.Lock />}
              rightIcon={showPass ? <I.EyeOff /> : <I.Eye />} onRightClick={()=>setShowPass(!showPass)}
              value={pass} onChange={e=>setPass(e.target.value)} />

            {error && <div role="alert" style={{ fontSize:12, color:T.error, marginBottom:12, fontWeight:600, padding:"8px 12px", background:T.error+"15", border:`1px solid ${T.error}30` }}>{error}</div>}

            <button type="submit" disabled={loading} style={{
              ...S.btn, width:"100%", padding:"13px", background:loading?"rgba(255,255,255,0.8)":"#fff", color:T.bg, fontSize:14, fontWeight:800,
              boxShadow:"4px 4px 0 rgba(0,0,0,0.4)", marginTop:4, opacity:loading?0.7:1,
            }}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="6px 6px 0 rgba(0,0,0,0.5)"}}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}}
            >{loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}</button>
          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
            <div style={{ flex:1, height:1, background:T.border }} />
            <span style={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>or</span>
            <div style={{ flex:1, height:1, background:T.border }} />
          </div>

          {/* Social auth placeholder */}
          <button style={{ ...S.btn, width:"100%", padding:"12px", background:T.bgInput, color:T.textSec, border:`1px solid ${T.border}`, fontSize:13 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <p style={{ textAlign:"center", marginTop:24, fontSize:13, color:T.textMuted }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={()=>onNavigate(isLogin?"signup":"login")} style={{ color:T.primary, fontWeight:700, cursor:"pointer", transition:"opacity 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity=0.8} onMouseLeave={e=>e.currentTarget.style.opacity=1}>
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: PROFILE
   ══════════════════════════════════════════════════════════════════════════ */
function ProfilePage({ user, onUpdate, onNavigate, onLogout, stats }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const { flash, ToastEl } = useUndoToast();

  const save = () => {
    onUpdate({ ...user, name, email });
    setSaved(true);
    flash("Profile updated ✓");
    setTimeout(() => setSaved(false), 2000);
  };

  const plans = [
    { id: "free", name: "Free", price: "$0", desc: "Up to 100 bookmarks, 5 categories", features: ["100 bookmarks", "5 categories", "Export/Import JSON", "Tag filtering"] },
    { id: "pro", name: "Pro", price: "$4/mo", desc: "Unlimited everything + cloud sync", features: ["Unlimited bookmarks", "Unlimited categories", "Cloud sync & backup", "Chrome extension", "Bio website generator", "Priority support"], color: T.primary },
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text }}>
      <Atmosphere />
      <SkipLink />

      {/* Nav */}
      <nav aria-label="Profile navigation" style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(13,13,13,0.85)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:800, margin:"0 auto", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div onClick={()=>onNavigate("dashboard")} role="button" tabIndex={0} aria-label="Go to dashboard" onKeyDown={e=>{if(e.key==="Enter")onNavigate("dashboard")}} style={{ cursor:"pointer" }}><Logo /></div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>onNavigate("dashboard")} aria-label="Go to dashboard" style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"6px 14px", border:`1px solid ${T.border}`, fontSize:12 }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}>
              <I.Grid /> Dashboard
            </button>
            <button onClick={onLogout} aria-label="Log out" style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:"6px 10px", border:`1px solid ${T.border}` }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.error+"60";e.currentTarget.style.color=T.error}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted}}>
              <I.LogOut />
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" style={{ maxWidth:800, margin:"0 auto", padding:"32px 20px 60px", position:"relative", zIndex:1 }}>
        <h1 style={{ fontFamily:T.font, fontSize:24, fontWeight:800, letterSpacing:"-0.04em", marginBottom:32 }}>Account</h1>

        {/* Profile section */}
        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, padding:28, marginBottom:20, boxShadow:"4px 4px 0 rgba(0,0,0,0.3)", animation:"mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 40ms both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24, flexWrap:"wrap" }}>
            <div style={{ width:72, height:72, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", flexShrink:0, position:"relative" }}>
              {user.name?.[0]?.toUpperCase() || "U"}
              <div role="button" tabIndex={0} aria-label="Upload profile photo" style={{ position:"absolute", bottom:-4, right:-4, width:24, height:24, background:T.bgPanel, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:T.textMuted }}>
                <I.Camera />
              </div>
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em" }}>{user.name}</div>
              <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{user.email}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
                <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", background:user.plan==="pro"?T.primary+"20":T.bgInput, color:user.plan==="pro"?T.primary:T.textMuted, padding:"2px 8px", border:`1px solid ${user.plan==="pro"?T.primary+"30":T.border}` }}>
                  {user.plan} plan
                </span>
                <span style={{ fontSize:11, color:T.textMuted }}>Joined {new Date(user.joinedAt).toLocaleDateString("en",{month:"short",year:"numeric"})}</span>
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="mm-profile-fields">
            <Field label="Name" value={name} onChange={e=>setName(e.target.value)} icon={<I.User />} />
            <Field label="Email" value={email} onChange={e=>setEmail(e.target.value)} icon={<I.Mail />} />
          </div>
          <button onClick={save} style={{ ...S.btn, background:"#fff", color:T.bg, padding:"10px 24px", fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)", marginTop:4 }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(0,0,0,0.3)"}}>
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>

        {/* Usage stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:T.border, marginBottom:20 }} className="mm-profile-stats">
          {[
            { label:"Categories", val:stats.cats, icon:"📂" },
            { label:"Bookmarks", val:stats.bms, icon:"🔖" },
            { label:"Pinned", val:stats.pinned, icon:"📌" },
            { label:"Tags", val:stats.tags, icon:"🏷️" },
          ].map((s,i) => (
            <div key={i} style={{ background:T.bg, padding:"18px 16px", textAlign:"center", animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*60}ms both` }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1 }}><AnimCount to={s.val} duration={600+i*80} /></div>
              <div style={{ fontSize:10, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <h2 style={{ fontFamily:T.font, fontSize:18, fontWeight:800, letterSpacing:"-0.03em", marginBottom:16 }}>Plans</h2>
        <div className="mm-plans-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
          {plans.map((p,pi) => (
            <div key={p.id} style={{
              background:T.bgEl, border:`1px solid ${p.color ? p.color+"40" : T.border}`, padding:24, position:"relative", overflow:"hidden",
              boxShadow: p.color ? `0 0 30px ${p.color}15` : "none",
              animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${pi*100+200}ms both`,
            }}>
              {p.color && <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:p.color, filter:"blur(60px)", opacity:0.1 }} />}
              {user.plan === p.id && <span style={{ position:"absolute", top:12, right:12, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", background:T.success+"20", color:T.success, padding:"2px 6px", border:`1px solid ${T.success}30` }}>Current</span>}
              <div style={{ fontSize:13, fontWeight:800, color:T.text, marginBottom:4, letterSpacing:"-0.02em", position:"relative" }}>{p.name}</div>
              <div style={{ fontSize:28, fontWeight:800, color:p.color||T.text, letterSpacing:"-0.03em", marginBottom:8, position:"relative" }}>{p.price}</div>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:16, position:"relative" }}>{p.desc}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, position:"relative" }}>
                {p.features.map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.textSec }}>
                    <span style={{ color:p.color||T.success, display:"flex" }}><I.Check /></span> {f}
                  </div>
                ))}
              </div>
              {user.plan !== p.id && (
                <button style={{ ...S.btn, width:"100%", marginTop:16, padding:"10px", background:p.color||"#fff", color:T.bg, fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)", position:"relative" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"}}>
                  Upgrade to {p.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div style={{ background:T.bgEl, border:`1px solid ${T.error}25`, padding:24, animation:"mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 400ms both" }}>
          <h3 style={{ fontSize:14, fontWeight:800, color:T.error, marginBottom:8, letterSpacing:"-0.02em" }}>Danger Zone</h3>
          <p style={{ fontSize:12, color:T.textMuted, marginBottom:16, lineHeight:1.5 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button aria-label="Delete account permanently" style={{ ...S.btn, background:"transparent", color:T.error, padding:"8px 16px", border:`1px solid ${T.error}40`, fontSize:12 }}
            onMouseEnter={e=>{e.currentTarget.style.background=T.error+"15"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
            Delete Account
          </button>
        </div>
      </main>

      {ToastEl}
      <style>{`
        @media (max-width: 640px) {
          .mm-profile-fields { grid-template-columns: 1fr !important; }
          .mm-profile-stats { grid-template-columns: repeat(2,1fr) !important; }
          .mm-plans-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: DASHBOARD (Bookmark Manager)
   ══════════════════════════════════════════════════════════════════════════ */
function BookmarkRow({ bm, accent, onEdit, onDelete, onTogglePin, searchQuery }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(bm.url); setCopied(true); setTimeout(()=>setCopied(false),1500); };
  const ac = ACCENTS[accent]||ACCENTS[0];
  const q = searchQuery || "";
  const actions = [
    {icon:copied?<I.Check/>:<I.Copy/>,fn:copy,label:copied?"URL copied":"Copy URL"},
    {icon:<I.Pin/>,fn:()=>onTogglePin(bm.id),label:bm.pinned?"Unpin bookmark":"Pin bookmark"},
    {icon:<I.Edit/>,fn:()=>onEdit(bm),label:"Edit bookmark"},
    {icon:<I.Trash/>,fn:()=>onDelete(bm.id),label:"Delete bookmark"},
  ];
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocus={()=>setHovered(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHovered(false)}}
      role="listitem" style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:hovered?"rgba(255,255,255,0.03)":"transparent", borderLeft:bm.pinned?`2px solid ${ac.bg}`:"2px solid transparent", transition:"all 0.15s" }}>
      <img src={getFavicon(bm.url)} alt="" width={20} height={20} style={{ marginTop:2, flexShrink:0 }} onError={e=>e.target.style.display="none"} aria-hidden="true" />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:1 }}>
          {bm.pinned && <span style={{ color:ac.bg, display:"flex" }} aria-label="Pinned"><I.Pin /></span>}
          <a href={bm.url} target="_blank" rel="noopener noreferrer" aria-label={`${bm.title} — opens in new tab`} style={{ fontSize:13, fontWeight:700, color:T.text, textDecoration:"none", fontFamily:T.font, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"-0.01em", transition:"color 0.15s" }}
            onMouseEnter={e=>e.target.style.color=ac.bg} onMouseLeave={e=>e.target.style.color=T.text}><Highlight text={bm.title} query={q} /></a>
          <span style={{ opacity:0.3, display:"flex" }} aria-hidden="true"><I.External /></span>
        </div>
        <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.font, display:"flex", alignItems:"center", gap:4, marginBottom:bm.tags?.length?5:0 }} aria-label={`Domain: ${getDomain(bm.url)}`}><I.Globe /> <Highlight text={getDomain(bm.url)} query={q} /></div>
        {bm.note && <div style={{ fontSize:11, color:T.textSec, marginBottom:5 }}><Highlight text={bm.note} query={q} /></div>}
        {bm.tags?.length>0 && <div style={{ display:"flex", flexWrap:"wrap", gap:3 }} role="list" aria-label="Bookmark tags">{bm.tags.map(t=><Tag key={t} tag={t} small />)}</div>}
      </div>
      <div style={{ display:"flex", gap:1, flexShrink:0, opacity:hovered?1:0, transition:"opacity 0.15s" }} className="mm-bm-actions">
        {actions.map((b,i)=>(
          <button key={i} onClick={b.fn} aria-label={b.label} style={{ ...S.btn, background:"transparent", padding:5, color:T.textMuted }}
            onMouseEnter={e=>{e.currentTarget.style.color=T.text;e.currentTarget.style.background="rgba(255,255,255,0.06)"}} onMouseLeave={e=>{e.currentTarget.style.color=T.textMuted;e.currentTarget.style.background="transparent"}} onFocus={e=>e.currentTarget.style.color=T.text} onBlur={e=>e.currentTarget.style.color=T.textMuted}>{b.icon}</button>
        ))}
      </div>
    </div>
  );
}

function BmModal({ open, onClose, onSave, bm, allTags, accent }) {
  const [f,setF]=useState({title:"",url:"",note:"",tags:[]}); const [ti,setTi]=useState("");
  useEffect(()=>{if(open){setF({title:bm?.title||"",url:bm?.url||"",note:bm?.note||"",tags:bm?.tags||[]});setTi("")}},[open,bm]);
  const addTag=()=>{const t=ti.trim().toLowerCase();if(t&&!f.tags.includes(t)){setF({...f,tags:[...f.tags,t]});setTi("")}};
  const ac=ACCENTS[accent]||ACCENTS[0];
  const save=()=>{if(!f.title.trim()||!f.url.trim())return;const url=f.url.startsWith("http")?f.url:`https://${f.url}`;onSave({...(bm||{}),title:f.title.trim(),url,note:f.note.trim(),tags:f.tags});onClose()};
  return (
    <Modal open={open} onClose={onClose} title={bm?"Edit Bookmark":"Add Bookmark"}>
      <Field label="Title" placeholder="My Bookmark" value={f.title} onChange={e=>setF({...f,title:e.target.value})} />
      <Field label="URL" placeholder="https://example.com" value={f.url} onChange={e=>setF({...f,url:e.target.value})} />
      <Field label="Note" placeholder="Why this is useful..." value={f.note} onChange={e=>setF({...f,note:e.target.value})} />
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:T.textMuted, marginBottom:5, fontFamily:T.font, textTransform:"uppercase", letterSpacing:"0.04em" }}>Tags</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:6 }}>{f.tags.map(t=><Tag key={t} tag={t} removable onRemove={()=>setF({...f,tags:f.tags.filter(x=>x!==t)})} />)}</div>
        <div style={{ display:"flex", gap:6 }}>
          <input value={ti} onChange={e=>setTi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addTag())} placeholder="Add tag…" style={{ ...S.input, flex:1 }} />
          <button onClick={addTag} style={{ ...S.btn, background:ac.bg, color:T.bg, padding:"8px 14px", fontWeight:700 }}>Add</button>
        </div>
        {allTags.length>0&&<div style={{ marginTop:6, display:"flex", flexWrap:"wrap", gap:3 }}>{allTags.filter(t=>!f.tags.includes(t)).slice(0,8).map(t=><Tag key={t} tag={t} small onClick={()=>setF({...f,tags:[...f.tags,t]})} />)}</div>}
      </div>
      <button onClick={save} style={{ ...S.btn, width:"100%", padding:"12px", background:ac.bg, color:T.bg, fontSize:14, fontWeight:800, boxShadow:"4px 4px 0 rgba(0,0,0,0.4)" }}>{bm?"Save Changes":"Add Bookmark"}</button>
    </Modal>
  );
}

function CatCard({ cat, onUpdate, onDelete, onEdit, onDeleteBm, allTags, searchQuery }) {
  const [exp,setExp]=useState(true); const [addBm,setAddBm]=useState(false); const [editBm,setEditBm]=useState(null);
  const ac=ACCENTS[cat.color]||ACCENTS[0]; const sorted=[...cat.bookmarks].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
  const isMobile = useIsMobile();
  const q = searchQuery || "";
  return (
    <article aria-label={`${cat.name} category — ${cat.bookmarks.length} bookmark${cat.bookmarks.length!==1?"s":""}`} style={{ background:T.bgEl, border:`1px solid ${T.border}`, overflow:"hidden", transition:"all 0.2s", marginBottom:16, position:"relative", boxShadow:"4px 4px 0 rgba(0,0,0,0.3)" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="6px 6px 0 rgba(0,0,0,0.4)"}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.3)"}}>
      <div style={{ height:3, background:ac.bg }} aria-hidden="true" />
      <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", background:ac.bg, filter:"blur(60px)", opacity:0.12, pointerEvents:"none" }} aria-hidden="true" />
      <div style={{ padding:"16px 18px 12px", position:"relative" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
            <span style={{ fontSize:22, lineHeight:1 }} aria-hidden="true">{cat.icon}</span>
            <div style={{ minWidth:0 }}>
              <h3 style={{ margin:0, fontFamily:T.font, fontSize:15, fontWeight:800, color:T.text, letterSpacing:"-0.03em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}><Highlight text={cat.name} query={q} /></h3>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:3 }}>
                <span aria-label={`${cat.bookmarks.length} bookmark${cat.bookmarks.length!==1?"s":""}`} style={{
                  display:"inline-flex", alignItems:"center", gap:3, padding:"1px 7px",
                  fontSize:10, fontWeight:700, fontFamily:T.font, letterSpacing:"0.02em",
                  background:ac.bg+"18", color:ac.bg, border:`1px solid ${ac.bg}30`,
                }}>
                  <I.BookmarkSm /> {cat.bookmarks.length}
                </span>
                {cat.bookmarks.filter(b=>b.pinned).length > 0 && (
                  <span aria-label={`${cat.bookmarks.filter(b=>b.pinned).length} pinned`} style={{
                    display:"inline-flex", alignItems:"center", gap:3, padding:"1px 7px",
                    fontSize:10, fontWeight:700, fontFamily:T.font, letterSpacing:"0.02em",
                    background:T.warning+"18", color:T.warning, border:`1px solid ${T.warning}30`,
                  }}>
                    <I.Pin /> {cat.bookmarks.filter(b=>b.pinned).length}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:2 }} role="toolbar" aria-label={`${cat.name} actions`}>
            <button onClick={()=>onEdit(cat)} aria-label={`Edit ${cat.name}`} style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:5 }} onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}><I.Edit /></button>
            <button onClick={()=>onDelete(cat)} aria-label={`Delete ${cat.name}`} style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:5 }} onMouseEnter={e=>e.currentTarget.style.color=T.error} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}><I.Trash /></button>
            <button onClick={()=>setExp(!exp)} aria-expanded={exp} aria-label={exp ? `Collapse ${cat.name}` : `Expand ${cat.name}`} style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:5 }}><I.Chev style={{ transform:exp?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s" }} /></button>
          </div>
        </div>
        {cat.tags?.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:8 }} role="list" aria-label="Category tags">{cat.tags.map(t=><Tag key={t} tag={t} small />)}</div>}
      </div>
      <AnimatedCollapse open={exp}>
        <div style={{ borderTop:`1px solid ${T.border}` }} role="list" aria-label={`Bookmarks in ${cat.name}`}>
        {sorted.map((bm,bi)=>{
          const bmRow = <BookmarkRow bm={bm} accent={cat.color} searchQuery={q} onEdit={setEditBm} onDelete={id=>onDeleteBm(cat.id, id, sorted.find(x=>x.id===id)?.title||"bookmark")} onTogglePin={id=>onUpdate({...cat,bookmarks:cat.bookmarks.map(b=>b.id===id?{...b,pinned:!b.pinned}:b)})} />;
          return (
            <div key={bm.id} style={{ animation: exp ? `mmRowIn 0.3s ease ${bi*40}ms both` : "none" }}>
              {isMobile
                ? <SwipeRow onSwipeDelete={()=>onDeleteBm(cat.id, bm.id, bm.title)}>{bmRow}</SwipeRow>
                : bmRow}
            </div>
          );
        })}
        <button onClick={()=>setAddBm(true)} aria-label={`Add bookmark to ${cat.name}`} style={{ ...S.btn, width:"100%", padding:"10px", background:"transparent", color:T.textMuted, borderTop:`1px solid ${T.border}`, fontSize:12 }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color=ac.bg}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted}}><I.Plus /> Add Bookmark</button>
        </div>
      </AnimatedCollapse>
      <BmModal open={addBm} onClose={()=>setAddBm(false)} accent={cat.color} onSave={bm=>{onUpdate({...cat,bookmarks:[...cat.bookmarks,{...bm,id:uid()}]});setAddBm(false)}} allTags={allTags} />
      <BmModal open={!!editBm} onClose={()=>setEditBm(null)} bm={editBm} accent={cat.color} onSave={bm=>{onUpdate({...cat,bookmarks:cat.bookmarks.map(b=>b.id===bm.id?bm:b)});setEditBm(null)}} allTags={allTags} />
    </article>
  );
}

function CatModal({ open, onClose, onSave, cat }) {
  const [f,setF]=useState({name:"",icon:"📁",color:0,tags:[]}); const [ti,setTi]=useState("");
  const emojis=["📁","🎨","⚡","📚","🚀","🎬","🤖","🎵","🏠","💡","🔧","🌍","💰","🎯","🏋️","🍕","✈️","📷","🎮","❤️"];
  useEffect(()=>{if(open){setF({name:cat?.name||"",icon:cat?.icon||"📁",color:cat?.color??0,tags:cat?.tags||[]});setTi("")}},[open,cat]);
  const addTag=()=>{const t=ti.trim().toLowerCase();if(t&&!f.tags.includes(t)){setF({...f,tags:[...f.tags,t]});setTi("")}};
  const ac=ACCENTS[f.color]; const save=()=>{if(!f.name.trim())return;onSave({...(cat||{id:uid(),bookmarks:[]}), ...f, name:f.name.trim()});onClose()};
  return (
    <Modal open={open} onClose={onClose} title={cat?"Edit Category":"New Category"} wide>
      <Field label="Name" placeholder="My Collection" value={f.name} onChange={e=>setF({...f,name:e.target.value})} />
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:T.textMuted, marginBottom:6, fontFamily:T.font, textTransform:"uppercase", letterSpacing:"0.04em" }}>Icon</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }} role="radiogroup" aria-label="Select icon">
          {emojis.map(e=><button key={e} onClick={()=>setF({...f,icon:e})} role="radio" aria-checked={f.icon===e} aria-label={`Icon ${e}`} style={{ width:36, height:36, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:f.icon===e?ac.bg+"20":T.bgInput, border:f.icon===e?`1px solid ${ac.bg}`:`1px solid ${T.border}`, borderRadius:0 }}>{e}</button>)}
        </div>
      </div>
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:T.textMuted, marginBottom:6, fontFamily:T.font, textTransform:"uppercase", letterSpacing:"0.04em" }}>Accent</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }} role="radiogroup" aria-label="Select accent color">{ACCENTS.map((c,i)=><button key={i} onClick={()=>setF({...f,color:i})} role="radio" aria-checked={f.color===i} aria-label={`Color ${i+1}`} style={{ width:32, height:32, background:c.bg, cursor:"pointer", border:f.color===i?"2px solid #fff":"2px solid transparent", borderRadius:0, boxShadow:f.color===i?`0 0 12px ${c.glow}`:"none" }} />)}</div>
      </div>
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:T.textMuted, marginBottom:5, fontFamily:T.font, textTransform:"uppercase", letterSpacing:"0.04em" }}>Tags</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:6 }}>{f.tags.map(t=><Tag key={t} tag={t} removable onRemove={()=>setF({...f,tags:f.tags.filter(x=>x!==t)})} />)}</div>
        <div style={{ display:"flex", gap:6 }}><input value={ti} onChange={e=>setTi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addTag())} placeholder="Add tag…" style={{ ...S.input, flex:1 }} /><button onClick={addTag} style={{ ...S.btn, background:ac.bg, color:T.bg, padding:"8px 14px", fontWeight:700 }}>Add</button></div>
      </div>
      <button onClick={save} style={{ ...S.btn, width:"100%", padding:"12px", background:"#fff", color:T.bg, fontSize:14, fontWeight:800, boxShadow:"4px 4px 0 rgba(0,0,0,0.4)" }}>{cat?"Save Changes":"Create Category"}</button>
    </Modal>
  );
}

/* ── Mobile Nav Overlay (with focus trap) ── */
function MobileNavOverlay({ onClose, items }) {
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

function Dashboard({ user, categories, setCategories, onNavigate, onLogout }) {
  const [searchInput,setSearchInput]=useState("");
  const debouncedSearch = useDebounce(searchInput, 150);
  const [filterTag,setFilterTag]=useState(null);
  const [showNewCat,setShowNewCat]=useState(false); const [editCat,setEditCat]=useState(null);
  const [mobileNav,setMobileNav]=useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const fileRef=useRef(null); const { flash, flashUndo, ToastEl } = useUndoToast();
  const isSearching = searchInput !== debouncedSearch;

  const allTags = useMemo(()=>[...new Set(categories.flatMap(c=>[...(c.tags||[]),...c.bookmarks.flatMap(b=>b.tags||[])]))],[categories]);
  const filtered = useMemo(()=>{
    const q = debouncedSearch;
    let result = categories.map(cat=>{
      const bms=cat.bookmarks.filter(bm=>{const ms=!q||bm.title.toLowerCase().includes(q.toLowerCase())||bm.url.toLowerCase().includes(q.toLowerCase())||bm.note?.toLowerCase().includes(q.toLowerCase());const mt=!filterTag||bm.tags?.includes(filterTag)||cat.tags?.includes(filterTag);return ms&&mt});
      return {...cat,bookmarks:bms};
    }).filter(cat=>(filterTag&&cat.tags?.includes(filterTag))||cat.bookmarks.length>0||(!q&&!filterTag));
    if (sortBy === "az") result = [...result].sort((a,b) => a.name.localeCompare(b.name));
    else if (sortBy === "za") result = [...result].sort((a,b) => b.name.localeCompare(a.name));
    else if (sortBy === "most") result = [...result].sort((a,b) => b.bookmarks.length - a.bookmarks.length);
    else if (sortBy === "least") result = [...result].sort((a,b) => a.bookmarks.length - b.bookmarks.length);
    else if (sortBy === "newest") result = [...result].reverse();
    return result;
  },[categories,debouncedSearch,filterTag,sortBy]);

  const saveCat=cat=>{if(categories.find(c=>c.id===cat.id))setCategories(categories.map(c=>c.id===cat.id?cat:c));else setCategories([...categories,cat]);setShowNewCat(false);setEditCat(null)};
  const exportData=()=>{const b=new Blob([JSON.stringify(categories,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="markme_bookmarks.json";a.click();URL.revokeObjectURL(u);flash("Exported ✓")};
  const importData=e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(Array.isArray(d)){setCategories(d);flash("Imported ✓")}}catch{flash("Invalid file")}};r.readAsText(file);e.target.value=""};

  // ── Category delete: confirm dialog → soft delete → undo toast ──
  const requestDeleteCat = cat => setConfirmDel({ cat });
  const confirmDeleteCat = () => {
    const cat = confirmDel?.cat;
    if (!cat) return;
    const snapshot = [...categories];
    setCategories(categories.filter(c => c.id !== cat.id));
    setConfirmDel(null);
    flashUndo(
      `"${cat.name}" deleted`,
      () => setCategories(snapshot)
    );
  };

  // ── Bookmark delete: instant soft delete → undo toast ──
  const deleteBm = (catId, bmId, bmTitle) => {
    const snapshot = [...categories];
    setCategories(categories.map(c =>
      c.id === catId ? { ...c, bookmarks: c.bookmarks.filter(b => b.id !== bmId) } : c
    ));
    flashUndo(
      `"${bmTitle}" removed`,
      () => setCategories(snapshot)
    );
  };

  const totalBm=categories.reduce((a,c)=>a+c.bookmarks.length,0);
  const totalPinned=categories.reduce((a,c)=>a+c.bookmarks.filter(b=>b.pinned).length,0);
  const stats=[{label:"CATEGORIES",val:categories.length,color:T.primary},{label:"BOOKMARKS",val:totalBm,color:T.secondary},{label:"PINNED",val:totalPinned,color:T.warning},{label:"TAGS",val:allTags.length,color:T.success}];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text, position:"relative" }}>
      <Atmosphere />
      <SkipLink />

      <nav aria-label="Main navigation" style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(13,13,13,0.85)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 16px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Logo />
          <div className="mm-desk" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div role="search" style={{ display:"flex", alignItems:"center", gap:6, background:T.bgInput, border:`1px solid ${searchInput ? T.primary+"60" : T.border}`, padding:"6px 12px", minWidth:180, transition:"border-color 0.2s" }}>
              <I.Search s={14} /><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search…" aria-label="Search bookmarks" style={{ border:"none", outline:"none", fontSize:13, fontFamily:T.font, background:"transparent", color:T.text, flex:1, fontWeight:500 }} />
              {isSearching && <div style={{ width:12, height:12, border:`2px solid ${T.primary}`, borderTopColor:"transparent", borderRadius:"50%", animation:"mmSpin 0.5s linear infinite", flexShrink:0 }} />}
              {searchInput&&<button onClick={()=>setSearchInput("")} aria-label="Clear search" style={{ ...S.btn, background:"none", padding:2, color:T.textMuted }}><I.X s={12}/></button>}
            </div>
            <button onClick={exportData} title="Export" aria-label="Export bookmarks as JSON" style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"6px 10px", border:`1px solid ${T.border}` }} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}><I.Export /></button>
            <button onClick={()=>fileRef.current?.click()} title="Import" aria-label="Import bookmarks from JSON" style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"6px 10px", border:`1px solid ${T.border}` }} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}><I.Import /></button>
            <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display:"none" }} aria-hidden="true" tabIndex={-1} />
            <button onClick={()=>setShowNewCat(true)} aria-label="Create new category" style={{ ...S.btn, background:"#fff", color:T.bg, padding:"7px 16px", fontWeight:800, fontSize:13, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(0,0,0,0.3)"}}><I.Plus /> New</button>
            {/* Profile button */}
            <button onClick={()=>onNavigate("profile")} aria-label={`Profile — ${user.name}`} style={{ ...S.btn, width:32, height:32, padding:0, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, color:"#fff", fontSize:12, fontWeight:800, flexShrink:0 }}
              title="Profile">{user.name?.[0]?.toUpperCase()||"U"}</button>
          </div>
          <button className="mm-mob-btn" onClick={()=>setMobileNav(!mobileNav)} aria-label="Open menu" aria-expanded={mobileNav} style={{ ...S.btn, background:"transparent", color:T.textSec, padding:6, display:"none" }}><I.Menu /></button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileNav && <MobileNavOverlay onClose={()=>setMobileNav(false)}
        items={[
          {icon:<I.Plus />,label:"New Category",fn:()=>{setShowNewCat(true);setMobileNav(false)}},
          {icon:<I.Export />,label:"Export",fn:()=>{exportData();setMobileNav(false)}},
          {icon:<I.Import />,label:"Import",fn:()=>{fileRef.current?.click();setMobileNav(false)}},
          {icon:<I.User />,label:"Profile",fn:()=>{onNavigate("profile");setMobileNav(false)}},
          {icon:<I.LogOut />,label:"Log out",fn:()=>{onLogout();setMobileNav(false)}},
        ]} />}

      <main id="main-content" style={{ maxWidth:1100, margin:"0 auto", padding:"16px 16px 60px", position:"relative", zIndex:1 }}>
        <PullToRefresh onRefresh={() => { setCategories([...categories]); flash("Refreshed ✓"); }}>
        {/* Mobile search */}
        <div className="mm-mob-search" style={{ display:"none", marginBottom:14 }}>
          <div role="search" style={{ display:"flex", alignItems:"center", gap:6, background:T.bgInput, border:`1px solid ${searchInput ? T.primary+"60" : T.border}`, padding:"8px 12px", transition:"border-color 0.2s" }}>
            <I.Search s={14} /><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search bookmarks…" aria-label="Search bookmarks" style={{ border:"none", outline:"none", fontSize:14, fontFamily:T.font, background:"transparent", color:T.text, flex:1, fontWeight:500 }} />
            {isSearching && <div style={{ width:12, height:12, border:`2px solid ${T.primary}`, borderTopColor:"transparent", borderRadius:"50%", animation:"mmSpin 0.5s linear infinite", flexShrink:0 }} />}
            {searchInput&&<button onClick={()=>setSearchInput("")} aria-label="Clear search" style={{ ...S.btn, background:"none", padding:2, color:T.textMuted }}><I.X s={12}/></button>}
          </div>
        </div>

        <div className="mm-stats" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
          {stats.map((s,i)=>(
            <div key={s.label} style={{ background:T.bgEl, border:`1px solid ${T.border}`, padding:"14px 16px", position:"relative", overflow:"hidden", animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*60}ms both` }}>
              <div style={{ position:"absolute", top:-15, right:-15, width:50, height:50, borderRadius:"50%", background:s.color, filter:"blur(30px)", opacity:0.15 }} />
              <div style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1, position:"relative" }}><AnimCount to={s.val} duration={700+i*100} /></div>
              <div style={{ fontSize:10, fontWeight:600, color:T.textMuted, letterSpacing:"0.04em", marginTop:4, textTransform:"uppercase", position:"relative" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {allTags.length>0&&<div role="toolbar" aria-label="Filter by tags" style={{ marginBottom:12, display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", overflowX:"auto", paddingBottom:4 }}>
          <span style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginRight:2, flexShrink:0 }}>Filter</span>
          <Tag tag="ALL" small active={!filterTag} onClick={()=>setFilterTag(null)} />
          {allTags.map(t=><Tag key={t} tag={t} small active={filterTag===t} onClick={()=>setFilterTag(filterTag===t?null:t)} />)}
        </div>}

        {/* Sort controls */}
        <div role="toolbar" aria-label="Sort categories" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginRight:2, flexShrink:0, display:"flex", alignItems:"center", gap:4 }}><I.Sort /> Sort</span>
            {[
              { id:"default", label:"Default", icon:null },
              { id:"az", label:"A→Z", icon:<I.AZ /> },
              { id:"za", label:"Z→A", icon:null },
              { id:"most", label:"Most links", icon:<I.Hash /> },
              { id:"least", label:"Fewest", icon:null },
              { id:"newest", label:"Newest", icon:<I.Clock /> },
            ].map(s=>(
              <button key={s.id} onClick={()=>setSortBy(s.id)}
                aria-pressed={sortBy===s.id}
                aria-label={`Sort by ${s.label}`}
                style={{
                  ...S.btn, padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.02em", textTransform:"uppercase",
                  background:sortBy===s.id?T.primary+"20":"transparent",
                  color:sortBy===s.id?T.primary:T.textMuted,
                  border:`1px solid ${sortBy===s.id?T.primary+"40":T.border}`,
                  transition:"all 0.15s",
                }}
                onMouseEnter={e=>{if(sortBy!==s.id){e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.textSec}}}
                onMouseLeave={e=>{if(sortBy!==s.id){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted}}}
              >{s.label}</button>
            ))}
          </div>
          <span style={{ fontSize:11, color:T.textMuted, fontFamily:T.font }}>
            {filtered.length} categor{filtered.length===1?"y":"ies"} · {filtered.reduce((a,c)=>a+c.bookmarks.length,0)} links
          </span>
        </div>

        <ErrorBoundary fallbackTitle="Dashboard error" fallbackMessage="The bookmark grid encountered an error. Try refreshing.">
        <VirtualMasonry items={filtered} columnCount={3} gap={14}
          renderItem={(cat, i) => (
            <CatCard cat={cat} allTags={allTags} searchQuery={debouncedSearch}
              onUpdate={c=>setCategories(categories.map(x=>x.id===c.id?c:x))}
              onDelete={requestDeleteCat}
              onDeleteBm={deleteBm}
              onEdit={c=>setEditCat(c)} />
          )} />
        </ErrorBoundary>

        {filtered.length===0&&<div style={{ textAlign:"center", padding:"80px 20px" }}><div style={{ fontSize:40, marginBottom:12, opacity:0.4 }}>🔍</div><p style={{ fontSize:16, fontWeight:700, color:T.textSec, marginBottom:6 }}>{debouncedSearch||filterTag?"No matches":"No categories yet"}</p><p style={{ fontSize:13, color:T.textMuted }}>{debouncedSearch||filterTag?"Try a different search":"Create your first category"}</p></div>}
        </PullToRefresh>
      </main>

      <CatModal open={showNewCat} onClose={()=>setShowNewCat(false)} onSave={saveCat} />
      <CatModal open={!!editCat} onClose={()=>setEditCat(null)} onSave={saveCat} cat={editCat} />
      <ConfirmDialog
        open={!!confirmDel}
        onClose={()=>setConfirmDel(null)}
        onConfirm={confirmDeleteCat}
        title={`Delete "${confirmDel?.cat?.name}"?`}
        itemName={confirmDel?.cat?.name}
        count={confirmDel?.cat?.bookmarks?.length || 0}
      />
      {ToastEl}

      <style>{`
        @media(max-width:860px){.mm-grid{column-count:2!important}.mm-stats{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:640px){.mm-grid{column-count:1!important}.mm-desk{display:none!important}.mm-mob-btn{display:flex!important}.mm-mob-search{display:block!important}.mm-stats{grid-template-columns:repeat(2,1fr)!important}}
        *:focus-visible{outline:2px solid ${T.primary};outline-offset:2px}
        input:focus-visible,select:focus-visible,textarea:focus-visible{outline:none;border-color:${T.primary}!important}
        .mm-bm-actions:focus-within{opacity:1!important}
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   APP ROOT — ROUTER
   ══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState(() => {
    try { const s = sessionStorage.getItem("mm_cats"); return s ? JSON.parse(s) : DEMO_DATA; } catch { return DEMO_DATA; }
  });

  useEffect(() => { try { sessionStorage.setItem("mm_cats", JSON.stringify(categories)); } catch {} }, [categories]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [page]);

  const login = userData => { setUser(userData); setPage("dashboard"); };
  const logout = () => { setUser(null); setPage("landing"); };
  const navigate = p => setPage(p);

  const appStats = {
    cats: categories.length,
    bms: categories.reduce((a,c) => a + c.bookmarks.length, 0),
    pinned: categories.reduce((a,c) => a + c.bookmarks.filter(b=>b.pinned).length, 0),
    tags: [...new Set(categories.flatMap(c=>[...(c.tags||[]),...c.bookmarks.flatMap(b=>b.tags||[])]))].length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes mmFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes mmSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mmSlideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
        @keyframes mmSlideLeft{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes mmCardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mmCardSpring{from{opacity:0;transform:translateY(18px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes mmRowIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes mmStatPulse{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}
        @keyframes mmSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes mmSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12)}
        body{background:${T.bg}}
      `}</style>
      <PageTransition pageKey={page}>
        {page === "landing" && <ErrorBoundary fallbackTitle="Page error" fallbackMessage="The landing page encountered an error."><LandingPage onNavigate={navigate} /></ErrorBoundary>}
        {page === "login" && <ErrorBoundary fallbackTitle="Auth error" fallbackMessage="The login form encountered an error."><AuthPage mode="login" onNavigate={navigate} onLogin={login} /></ErrorBoundary>}
        {page === "signup" && <ErrorBoundary fallbackTitle="Auth error" fallbackMessage="The signup form encountered an error."><AuthPage mode="signup" onNavigate={navigate} onLogin={login} /></ErrorBoundary>}
        {page === "profile" && user && <ErrorBoundary fallbackTitle="Profile error" fallbackMessage="The profile page encountered an error."><ProfilePage user={user} onUpdate={setUser} onNavigate={navigate} onLogout={logout} stats={appStats} /></ErrorBoundary>}
        {page === "dashboard" && user && <ErrorBoundary fallbackTitle="Dashboard error" fallbackMessage="The dashboard encountered an error. Your data is safe."><Dashboard user={user} categories={categories} setCategories={setCategories} onNavigate={navigate} onLogout={logout} /></ErrorBoundary>}
        {page === "dashboard" && !user && (() => { setPage("login"); return null; })()}
        {page === "profile" && !user && (() => { setPage("login"); return null; })()}
      </PageTransition>
    </>
  );
}
