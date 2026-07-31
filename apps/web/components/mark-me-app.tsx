// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  T, TAG_COLORS, ACCENTS,
  Logo, Atmosphere,
  uid, getDomain, getFavicon, tagColor, timeAgo,
  Modal, ConfirmDialog, VirtualMasonry, SwipeRow, PullToRefresh, SkipLink,
  ErrorBoundary, FaviconWithFallback, LinkPreview, Tag, Field, Highlight,
  AnimCount, AnimatedCollapse, PageTransition, MobileNavOverlay,
  useUndoToast, useIsMobile, useDebounce, useFocusTrap, useStagger,
} from "@markme/ui";
import { authClient } from "@/lib/auth/client";
import {
  clearLastUser,
  createOutboxId,
  discardAllFailed,
  discardOutboxEntry,
  flushOutbox,
  getLastUser,
  notifyOutboxChanged,
  queueAndPatch,
  remapOptimisticId,
  retryOutboxEntry,
  setLastUser,
  useOnlineStatus,
  useOutboxCount,
  useOutboxEntries,
  useOutboxFailedCount,
} from "@/lib/offline";
import { trpc } from "@/lib/trpc";

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
  Brain: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a6 6 0 0 0-6 6c0 1.66.68 3.16 1.76 4.24L12 16.48l4.24-4.24A6 6 0 0 0 12 2z"/><path d="M9.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM14.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/><path d="M12 16.5V22"/></svg>,
  Sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  Tab: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="0"/><path d="M2 8h20"/><path d="M8 4v4"/></svg>,
  Crown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 20h20M4 16l2-12 6 6 6-6 2 12z"/></svg>,
  Send: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>,
  Grip: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg>,
};

/* ══════════════════════════════════════════════════════════════════════════
   SHARED STYLES & COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */
const S = {
  btn: { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:T.font, fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", border:"none", borderRadius:0, textDecoration:"none" },
  input: { width:"100%", padding:"12px 14px", background:T.bgInput, border:`1px solid ${T.border}`, borderRadius:0, color:T.text, fontSize:14, fontFamily:T.font, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" },
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: LANDING
   ══════════════════════════════════════════════════════════════════════════ */
function LandingPage({ onNavigate }) {
  const features = [
    { icon: <I.Grid />, title: "Masonry Grid", desc: "Visual bento layout that makes browsing your links feel intentional" },
    { icon: <I.Tag />, title: "Smart Tags", desc: "Color-coded pills to slice and filter your collection instantly" },
    { icon: <I.Bookmark />, title: "Pin & Organize", desc: "Pin your most-used links, group by category, drag to reorder" },
    { icon: <I.Tab />, title: "New Tab Override", desc: "Replace Chrome's new tab with your bookmarks, clock, and quick search", isNew: true },
    { icon: <I.Sparkle />, title: "AI Assistant", desc: "Auto-tag, summarize, and discover connections across your bookmarks", isNew: true },
    { icon: <I.Chrome />, title: "Chrome Extension", desc: "One-click save from any page — auto-tagged, auto-categorized", soon: true },
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text, display:"flex", flexDirection:"column" }}>
      <Atmosphere />
      <SkipLink />

      {/* Nav */}
      <nav aria-label="Site navigation" style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(13,13,13,0.85)", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Logo />
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            {[{label:"Pricing",page:"pricing"},{label:"Extension",page:"newtab"}].map(l=>(
              <button key={l.page} onClick={()=>onNavigate(l.page)} style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:"7px 12px", fontSize:13 }}
                onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>{l.label}</button>
            ))}
            <button onClick={()=>onNavigate("login")} style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"7px 16px", border:`1px solid ${T.border}` }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}>Log in</button>
            <button onClick={()=>onNavigate("signup")} style={{ ...S.btn, background:"#fff", color:T.bg, padding:"7px 16px", fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(0,0,0,0.3)"}}>Get Started</button>
          </div>
        </div>
      </nav>

      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>

      {/* Hero */}
      <section id="main-content" style={{ maxWidth:1100, margin:"0 auto", padding:"72px 20px 28px", position:"relative", zIndex:1, textAlign:"center" }}>
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

      </section>

      {/* Product preview — full dashboard mock */}
      <div aria-hidden="true" style={{ maxWidth:1240, margin:"0 auto", padding:"0 20px 48px", position:"relative", zIndex:1, width:"100%", boxSizing:"border-box" }}>
        <div className="mm-landing-preview" style={{
          marginTop:8, background:T.bgEl, border:`1px solid ${T.border}`, padding:3,
          boxShadow:"12px 12px 0 rgba(0,0,0,0.45)", position:"relative",
          animation:"mmCardSpring .65s cubic-bezier(0.34, 1.56, 0.64, 1) 180ms both", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:-40, left:"15%", width:280, height:280, borderRadius:"50%", background:T.primary, filter:"blur(90px)", opacity:0.1, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-50, right:"10%", width:260, height:260, borderRadius:"50%", background:T.secondary, filter:"blur(80px)", opacity:0.08, pointerEvents:"none" }} />

          {/* Browser chrome */}
          <div style={{ background:T.bgPanel, padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:10, position:"relative" }}>
            <div style={{ display:"flex", gap:6 }}>{[T.error,"#F59E0B",T.success].map((c,i)=><div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.7 }} />)}</div>
            <div style={{ flex:1, background:T.bgInput, border:`1px solid ${T.border}`, padding:"6px 12px", fontSize:12, color:T.textMuted }}>
              markme-app.vercel.app/dashboard
            </div>
          </div>

          {/* App chrome */}
          <div style={{ background:T.bg, borderBottom:`1px solid ${T.border}`, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, position:"relative" }}>
            <Logo size={22} />
            <div style={{ flex:1, maxWidth:360, background:T.bgInput, border:`1px solid ${T.border}`, padding:"8px 12px", display:"flex", alignItems:"center", gap:8, fontSize:12, color:T.textMuted }}>
              <I.Search /> Search bookmarks…
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ padding:"7px 12px", background:T.primarySubtle, border:`1px solid ${T.primary}30`, color:T.primary, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}><I.Sparkle /> AI</div>
              <div style={{ width:28, height:28, background:T.bgInput, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:T.textSec }}>A</div>
            </div>
          </div>

          {/* Dashboard body */}
          <div style={{ padding:18, position:"relative", minHeight:420, background:`linear-gradient(180deg, ${T.bg} 0%, ${T.bgEl} 100%)` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em", color:T.text }}>Your collections</div>
                <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>6 categories · 17 bookmarks · 4 pinned</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ padding:"7px 12px", background:T.bgInput, border:`1px solid ${T.border}`, fontSize:11, fontWeight:700, color:T.textSec }}>All tags</div>
                <div style={{ padding:"7px 12px", background:"#fff", color:T.bg, fontSize:11, fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.35)", display:"flex", alignItems:"center", gap:4 }}><I.Plus /> New</div>
              </div>
            </div>

            <div className="mm-landing-cats" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, textAlign:"left" }}>
              {[
                { name:"Design Inspiration", icon:"🎨", color:0, tags:["design","ui/ux"], bookmarks:[
                  { title:"Dribbble", note:"Daily design inspiration", pinned:true },
                  { title:"Behance", note:"Portfolio showcase" },
                  { title:"Awwwards", note:"Award-winning websites" },
                ]},
                { name:"Dev Tools", icon:"⚡", color:1, tags:["dev","tools"], bookmarks:[
                  { title:"GitHub", note:"Code hosting & collab", pinned:true },
                  { title:"VS Code Web", note:"Browser-based IDE" },
                  { title:"Stack Overflow", note:"Q&A for developers" },
                ]},
                { name:"Productivity", icon:"🚀", color:2, tags:["work","apps"], bookmarks:[
                  { title:"Notion", note:"All-in-one workspace", pinned:true },
                  { title:"Linear", note:"Issue tracking done right" },
                  { title:"Figma", note:"Design tool of choice" },
                ]},
              ].map((cat, i) => {
                const ac = ACCENTS[cat.color % ACCENTS.length];
                return (
                  <div key={cat.name} style={{
                    background:T.bgEl, border:`1px solid ${T.border}`, overflow:"hidden", position:"relative",
                    boxShadow:"4px 4px 0 rgba(0,0,0,0.3)",
                    animation:`mmCardSpring 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${220 + i*80}ms both`,
                  }}>
                    <div style={{ height:3, background:ac.bg }} />
                    <div style={{ position:"absolute", top:-36, right:-36, width:100, height:100, borderRadius:"50%", background:ac.bg, filter:"blur(50px)", opacity:0.14, pointerEvents:"none" }} />
                    <div style={{ padding:"14px 14px 10px", position:"relative" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:20, lineHeight:1 }}>{cat.icon}</span>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:800, color:T.text, letterSpacing:"-0.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cat.name}</div>
                          <div style={{ display:"flex", gap:4, marginTop:4 }}>
                            <span style={{ fontSize:10, fontWeight:700, color:ac.bg, background:ac.bg+"18", border:`1px solid ${ac.bg}30`, padding:"1px 6px" }}>{cat.bookmarks.length}</span>
                            <span style={{ fontSize:10, fontWeight:700, color:T.warning, background:T.warning+"18", border:`1px solid ${T.warning}30`, padding:"1px 6px" }}>1 pinned</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:3, flexWrap:"wrap", marginBottom:4 }}>
                        {cat.tags.map(t=>(
                          <span key={t} style={{ fontSize:9, fontWeight:700, color:ac.bg, background:ac.bg+"14", border:`1px solid ${ac.bg}28`, padding:"1px 6px", textTransform:"uppercase", letterSpacing:"0.03em" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop:`1px solid ${T.border}` }}>
                      {cat.bookmarks.map((bm, bi) => (
                        <div key={bm.title} style={{
                          display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                          borderBottom: bi < cat.bookmarks.length - 1 ? `1px solid ${T.border}` : "none",
                          background: bi % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                        }}>
                          <div style={{ width:28, height:28, flexShrink:0, background:ac.bg+"18", border:`1px solid ${ac.bg}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:ac.bg }}>
                            {bm.title.slice(0,1)}
                          </div>
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:T.text, display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                              {bm.pinned && <span style={{ color:T.warning, display:"inline-flex" }}><I.Pin /></span>}
                              {bm.title}
                            </div>
                            <div style={{ fontSize:10, color:T.textMuted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{bm.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"48px 20px 80px", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:48, animation:"mmSlideUp .4s ease both" }}>
          <h2 style={{ fontFamily:T.font, fontSize:"clamp(1.5rem, 3vw, 2rem)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:12 }}>Everything you need.</h2>
          <p style={{ color:T.textSec, fontSize:15, maxWidth:400, margin:"0 auto" }}>A focused set of tools to replace the browser bookmark bar forever.</p>
        </div>
        <div className="mm-features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:T.border }}>
          {features.map((f,i) => (
            <div key={i} style={{ background:T.bg, padding:"32px 28px", position:"relative", overflow:"hidden", animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*70}ms both`, transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=T.bgEl} onMouseLeave={e=>e.currentTarget.style.background=T.bg}>
              {f.soon && <span style={{ position:"absolute", top:12, right:12, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color:T.warning, background:T.warning+"18", padding:"2px 6px", border:`1px solid ${T.warning}30` }}>Soon</span>}
              {f.isNew && <span style={{ position:"absolute", top:12, right:12, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color:T.secondary, background:T.secondarySubtle, padding:"2px 6px", border:`1px solid ${T.secondary}30` }}>New</span>}
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
      </div>

      {/* Footer — pinned to viewport bottom when page is short */}
      <footer style={{ borderTop:`1px solid ${T.border}`, position:"relative", zIndex:1, marginTop:"auto", flexShrink:0 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <Logo size={20} />
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {[{label:"Pricing",p:"pricing"},{label:"Extension",p:"newtab"}].map(l=>(
              <button key={l.p} onClick={()=>onNavigate(l.p)} style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:0, fontSize:12 }}
                onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>{l.label}</button>
            ))}
            <a href="/privacy" style={{ fontFamily:T.font, color:T.textMuted, fontSize:12, textDecoration:"none" }}
              onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>Privacy</a>
            <span style={{ fontSize:12, color:T.textMuted }}>&copy; 2026 mark_me</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .mm-features-grid { grid-template-columns: repeat(2,1fr) !important; }
          .mm-landing-cats { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .mm-features-grid { grid-template-columns: 1fr !important; }
          .mm-landing-cats { grid-template-columns: 1fr !important; }
          .mm-landing-preview { box-shadow: 6px 6px 0 rgba(0,0,0,0.4) !important; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: AUTH (Login / Signup)
   ══════════════════════════════════════════════════════════════════════════ */
function AuthPage({ mode, onNavigate }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (pass.length < 8) { setError("Password must be 8+ characters"); return; }
    if (!isLogin && !name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try {
      const credentials = {
        email: email.toLowerCase().trim(),
        password: pass,
      };
      const { error: authError } = isLogin
        ? await authClient.signIn.email(credentials)
        : await authClient.signUp.email({ ...credentials, name: name.trim() });

      if (authError) {
        setError(authError.message || (isLogin ? "Invalid email or password." : "Could not create account."));
        return;
      }
      // Provision public.users from Neon Auth session for bookmarks FKs
      await fetch("/api/auth/sync-user", { method: "POST", credentials: "include" });
      const next = new URLSearchParams(window.location.search).get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        window.location.href = next;
        return;
      }
      onNavigate("dashboard");
    } catch (err) {
      setError(err?.message || "Authentication failed. Check Neon Auth configuration.");
    } finally {
      setLoading(false);
    }
  };

  const oauthGoogle = async () => {
    setError("");
    setGLoading(true);
    try {
      const next = new URLSearchParams(window.location.search).get("next");
      const callbackURL =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch {
      setError("Google sign-in failed. Check Neon Auth OAuth settings.");
      setGLoading(false);
    }
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

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <button type="button" onClick={oauthGoogle} disabled={gLoading}
              style={{ ...S.btn, width:"100%", padding:"12px", background:T.bgInput, color:gLoading?T.textMuted:T.textSec, border:`1px solid ${T.border}`, fontSize:13, opacity:gLoading?0.7:1, transition:"all 0.2s" }}
              onMouseEnter={e=>{if(!gLoading){e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}}} onMouseLeave={e=>{if(!gLoading){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}}>
              {gLoading
                ? <div style={{ width:16, height:16, border:`2px solid ${T.textMuted}`, borderTopColor:"transparent", borderRadius:"50%", animation:"mmSpin 0.5s linear infinite" }} />
                : <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
              {gLoading ? "Connecting..." : "Continue with Google"}
            </button>
          </div>

          <p style={{ textAlign:"center", marginTop:24, fontSize:13, color:T.textMuted }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={()=>onNavigate(isLogin?"signup":"login")} style={{ color:T.primary, fontWeight:700, cursor:"pointer", transition:"opacity 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity=0.8} onMouseLeave={e=>e.currentTarget.style.opacity=1}>
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>
        </div>
      </main>
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
  const [deleting, setDeleting] = useState(false);
  const { flash, ToastEl } = useUndoToast();
  const updateProfile = trpc.user.updateProfile.useMutation();
  const deleteAccount = trpc.user.deleteAccount.useMutation();

  const save = async () => {
    try {
      const updated = await updateProfile.mutateAsync({ name: name.trim(), email: email.trim().toLowerCase() });
      onUpdate({
        ...user,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatarUrl ?? null,
        plan: updated.plan,
        joinedAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : user.joinedAt,
      });
      setSaved(true);
      flash("Profile updated ✓");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      flash(err?.message || "Could not update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Permanently delete your account and all bookmarks? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteAccount.mutateAsync();
      await onLogout();
    } catch (err) {
      flash(err?.message || "Could not delete account");
      setDeleting(false);
    }
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
            <div style={{ width:72, height:72, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:T.onPrimary, flexShrink:0, position:"relative" }}>
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
          <button type="button" onClick={handleDeleteAccount} disabled={deleting} aria-label="Delete account permanently" style={{ ...S.btn, background:"transparent", color:T.error, padding:"8px 16px", border:`1px solid ${T.error}40`, fontSize:12, opacity:deleting?0.6:1 }}
            onMouseEnter={e=>{e.currentTarget.style.background=T.error+"15"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
            {deleting ? "Deleting…" : "Delete Account"}
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
  const ago = timeAgo(bm.addedAt);
  const actions = [
    {icon:copied?<I.Check/>:<I.Copy/>,fn:copy,label:copied?"URL copied":"Copy URL"},
    {icon:<I.Pin/>,fn:()=>onTogglePin(bm.id),label:bm.pinned?"Unpin bookmark":"Pin bookmark"},
    {icon:<I.Edit/>,fn:()=>onEdit(bm),label:"Edit bookmark"},
    {icon:<I.Trash/>,fn:()=>onDelete(bm.id),label:"Delete bookmark"},
  ];
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocus={()=>setHovered(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHovered(false)}}
      role="listitem" style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:hovered?"rgba(255,255,255,0.03)":"transparent", borderLeft:bm.pinned?`2px solid ${ac.bg}`:"2px solid transparent", transition:"all 0.15s" }}>
      <FaviconWithFallback url={bm.url} title={bm.title} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:1 }}>
          {bm.pinned && <span style={{ color:ac.bg, display:"flex" }} aria-label="Pinned"><I.Pin /></span>}
          <LinkPreview url={bm.url} title={bm.title}>
            <a href={bm.url} target="_blank" rel="noopener noreferrer" aria-label={`${bm.title} — opens in new tab`} style={{ fontSize:13, fontWeight:700, color:T.text, textDecoration:"none", fontFamily:T.font, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"-0.01em", transition:"color 0.15s" }}
              onMouseEnter={e=>e.target.style.color=ac.bg} onMouseLeave={e=>e.target.style.color=T.text}><Highlight text={bm.title} query={q} /></a>
          </LinkPreview>
          <span style={{ opacity:0.3, display:"flex" }} aria-hidden="true"><I.External /></span>
        </div>
        <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.font, display:"flex", alignItems:"center", gap:4, marginBottom:bm.note||bm.tags?.length?5:0 }}>
          <I.Globe /> <Highlight text={getDomain(bm.url)} query={q} />
          {ago && <><span style={{ opacity:0.3 }}>·</span><span style={{ display:"flex", alignItems:"center", gap:3 }}><I.Clock /> {ago}</span></>}
        </div>
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
  const [tagging, setTagging] = useState(false);
  const autoTagMut = trpc.ai.autoTag.useMutation();
  useEffect(()=>{if(open){setF({title:bm?.title||"",url:bm?.url||"",note:bm?.note||"",tags:bm?.tags||[]});setTi("")}},[open,bm]);
  const addTag=()=>{const t=ti.trim().toLowerCase();if(t&&!f.tags.includes(t)){setF({...f,tags:[...f.tags,t]});setTi("")}};
  const ac=ACCENTS[accent]||ACCENTS[0];
  const save=()=>{if(!f.title.trim()||!f.url.trim())return;const url=f.url.startsWith("http")?f.url:`https://${f.url}`;onSave({...(bm||{}),title:f.title.trim(),url,note:f.note.trim(),tags:f.tags});onClose()};
  const suggestTags = async () => {
    if (tagging || !f.title.trim() || !f.url.trim()) return;
    setTagging(true);
    try {
      const url = f.url.startsWith("http") ? f.url : `https://${f.url}`;
      const r = await autoTagMut.mutateAsync({ title: f.title.trim(), url });
      const merged = [...new Set([...f.tags, ...(r.tags||[])])];
      setF(prev => ({ ...prev, tags: merged }));
    } catch {
      // best-effort suggestion; ignore failures silently
    } finally {
      setTagging(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title={bm?"Edit Bookmark":"Add Bookmark"}>
      <Field label="Title" placeholder="My Bookmark" value={f.title} onChange={e=>setF({...f,title:e.target.value})} />
      <Field label="URL" placeholder="https://example.com" value={f.url} onChange={e=>setF({...f,url:e.target.value})} />
      <Field label="Note" placeholder="Why this is useful..." value={f.note} onChange={e=>setF({...f,note:e.target.value})} />
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:T.textMuted, fontFamily:T.font, textTransform:"uppercase", letterSpacing:"0.04em" }}>Tags</label>
          <button type="button" onClick={suggestTags} disabled={tagging || !f.title.trim() || !f.url.trim()} aria-label="Suggest tags with AI"
            style={{ ...S.btn, background:T.primarySubtle, color:T.primary, padding:"3px 8px", fontSize:10, fontWeight:700, border:`1px solid ${T.primary}30`, opacity:(tagging || !f.title.trim() || !f.url.trim())?0.5:1 }}>
            <I.Sparkle /> {tagging ? "Thinking…" : "Suggest"}
          </button>
        </div>
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

const CatCard = React.memo(function CatCard({ cat, onTogglePin, onSaveBm, onDelete, onEdit, onDeleteBm, allTags, searchQuery, dragEnabled, onReorder }) {
  const [exp,setExp]=useState(true); const [addBm,setAddBm]=useState(false); const [editBm,setEditBm]=useState(null);
  const [dragOver, setDragOver] = useState(false);
  const ac=ACCENTS[cat.color]||ACCENTS[0]; const sorted=[...cat.bookmarks].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
  const isMobile = useIsMobile();
  const q = searchQuery || "";
  const isEmpty = cat.bookmarks.length === 0;

  const onHandleDragStart = e => {
    if (!dragEnabled) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cat.id);
  };
  const onCardDragOver = e => {
    if (!dragEnabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragOver) setDragOver(true);
  };
  const onCardDragLeave = () => setDragOver(false);
  const onCardDrop = e => {
    if (!dragEnabled) return;
    e.preventDefault();
    setDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== cat.id) onReorder?.(draggedId, cat.id);
  };

  return (
    <article aria-label={`${cat.name} category — ${cat.bookmarks.length} bookmark${cat.bookmarks.length!==1?"s":""}`} style={{ background:T.bgEl, border:`1px solid ${dragOver?ac.bg:T.border}`, outline:dragOver?`2px dashed ${ac.bg}`:"none", outlineOffset:-4, overflow:"hidden", transition:"all 0.2s", marginBottom:16, position:"relative", boxShadow:"4px 4px 0 rgba(0,0,0,0.3)" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="6px 6px 0 rgba(0,0,0,0.4)"}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.3)"}}
      onDragOver={onCardDragOver} onDragLeave={onCardDragLeave} onDrop={onCardDrop}>
      <div style={{ height:3, background:ac.bg }} aria-hidden="true" />
      <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", background:ac.bg, filter:"blur(60px)", opacity:0.12, pointerEvents:"none" }} aria-hidden="true" />
      <div style={{ padding:"16px 18px 12px", position:"relative" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
            {dragEnabled && (
              <span draggable onDragStart={onHandleDragStart} role="button" tabIndex={0} aria-label={`Drag to reorder ${cat.name}`}
                style={{ cursor:"grab", color:T.textMuted, display:"flex", touchAction:"none", flexShrink:0 }}>
                <I.Grip />
              </span>
            )}
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
        <div style={{ borderTop:`1px solid ${T.border}` }}>
        {isEmpty ? (
          <div style={{ padding:"24px 18px", textAlign:"center" }}>
            <div style={{ width:48, height:48, margin:"0 auto 10px", background:ac.bg+"12", border:`1px solid ${ac.bg}25`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <I.BookmarkSm />
              <span style={{ position:"absolute", color:ac.bg, opacity:0.5, fontSize:18 }}>+</span>
            </div>
            <p style={{ fontSize:12, fontWeight:600, color:T.textSec, marginBottom:4, fontFamily:T.font }}>No bookmarks yet</p>
            <p style={{ fontSize:11, color:T.textMuted, marginBottom:12, fontFamily:T.font }}>Save your first link to this collection</p>
            <button onClick={()=>setAddBm(true)} style={{ ...S.btn, background:ac.bg+"18", color:ac.bg, padding:"7px 16px", fontSize:12, fontWeight:700, border:`1px solid ${ac.bg}30` }}
              onMouseEnter={e=>{e.currentTarget.style.background=ac.bg+"30"}} onMouseLeave={e=>{e.currentTarget.style.background=ac.bg+"18"}}><I.Plus /> Add Bookmark</button>
          </div>
        ) : (<>
        <div
          className="mm-cat-scroll"
          role="list"
          aria-label={`Bookmarks in ${cat.name}`}
          style={{
            maxHeight: isMobile ? 280 : 320,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
        {sorted.map((bm,bi)=>{
          const bmRow = <BookmarkRow bm={bm} accent={cat.color} searchQuery={q} onEdit={setEditBm} onDelete={id=>onDeleteBm(cat.id, id, sorted.find(x=>x.id===id)?.title||"bookmark")} onTogglePin={id=>onTogglePin(id)} />;
          return (
            <div key={bm.id} role="listitem" style={{ animation: exp ? `mmRowIn 0.3s ease ${Math.min(bi,8)*40}ms both` : "none" }}>
              {isMobile
                ? <SwipeRow onSwipeDelete={()=>onDeleteBm(cat.id, bm.id, bm.title)}>{bmRow}</SwipeRow>
                : bmRow}
            </div>
          );
        })}
        </div>
        <button onClick={()=>setAddBm(true)} aria-label={`Add bookmark to ${cat.name}`} style={{ ...S.btn, width:"100%", padding:"10px", background:"transparent", color:T.textMuted, borderTop:`1px solid ${T.border}`, fontSize:12, flexShrink:0 }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color=ac.bg}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted}}><I.Plus /> Add Bookmark</button>
        </>)}
        </div>
      </AnimatedCollapse>
      <BmModal open={addBm} onClose={()=>setAddBm(false)} accent={cat.color} onSave={bm=>{onSaveBm(cat.id, bm); setAddBm(false)}} allTags={allTags} />
      <BmModal open={!!editBm} onClose={()=>setEditBm(null)} bm={editBm} accent={cat.color} onSave={bm=>{onSaveBm(cat.id, bm); setEditBm(null)}} allTags={allTags} />
    </article>
  );
});

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

function Dashboard({ user, onNavigate, onLogout }) {
  const utils = trpc.useUtils();
  const online = useOnlineStatus();
  const outboxCount = useOutboxCount();
  const outboxEntries = useOutboxEntries();
  const failedCount = useOutboxFailedCount();
  const pendingCount = Math.max(0, outboxCount - failedCount);
  const { data: categories = [], isLoading, refetch } = trpc.category.list.useQuery(undefined, {
    enabled: !!user,
    retry: online ? 1 : 0,
  });
  const createCat = trpc.category.create.useMutation();
  const updateCat = trpc.category.update.useMutation();
  const deleteCatMut = trpc.category.delete.useMutation();
  const createBm = trpc.bookmark.create.useMutation();
  const updateBm = trpc.bookmark.update.useMutation();
  const deleteBmMut = trpc.bookmark.delete.useMutation();
  const togglePinMut = trpc.bookmark.togglePin.useMutation();
  const importJson = trpc.export.fromJSON.useMutation();
  const reorderCat = trpc.category.reorder.useMutation();

  const [searchInput,setSearchInput]=useState("");
  const debouncedSearch = useDebounce(searchInput, 150);
  const [filterTag,setFilterTag]=useState(null);
  const [showNewCat,setShowNewCat]=useState(false); const [editCat,setEditCat]=useState(null);
  const [mobileNav,setMobileNav]=useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmImport, setConfirmImport] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [showAi, setShowAi] = useState(false);
  const fileRef=useRef(null); const { flash, flashUndo, ToastEl } = useUndoToast();
  const isSearching = searchInput !== debouncedSearch;

  useEffect(() => {
    if (!online) return;
    let cancelled = false;
    (async () => {
      const result = await flushOutbox(utils.client);
      if (cancelled) return;
      if (result.synced > 0) {
        notifyOutboxChanged();
        await utils.category.list.invalidate();
        flash(`Synced ${result.synced} change${result.synced === 1 ? "" : "s"} ✓`);
      } else {
        notifyOutboxChanged();
      }
    })();
    return () => { cancelled = true; };
  }, [online]);

  const allTags = useMemo(()=>[...new Set(categories.flatMap(c=>[...(c.tags||[]),...c.bookmarks.flatMap(b=>b.tags||[])]))],[categories]);
  const filtered = useMemo(()=>{
    const q = debouncedSearch.trim().toLowerCase();
    let result = categories.map(cat=>{
      const bms = cat.bookmarks.filter(bm => {
        const ms = !q
          || bm.title.toLowerCase().includes(q)
          || bm.url.toLowerCase().includes(q)
          || bm.note?.toLowerCase().includes(q)
          || cat.name?.toLowerCase().includes(q)
          || bm.tags?.some(t => t.toLowerCase().includes(q))
          || cat.tags?.some(t => t.toLowerCase().includes(q));
        const mt = !filterTag || bm.tags?.includes(filterTag) || cat.tags?.includes(filterTag);
        return ms && mt;
      });
      return {...cat,bookmarks:bms};
    }).filter(cat=>(filterTag&&cat.tags?.includes(filterTag))||cat.bookmarks.length>0||(!q&&!filterTag));
    if (sortBy === "az") result = [...result].sort((a,b) => a.name.localeCompare(b.name));
    else if (sortBy === "za") result = [...result].sort((a,b) => b.name.localeCompare(a.name));
    else if (sortBy === "most") result = [...result].sort((a,b) => b.bookmarks.length - a.bookmarks.length);
    else if (sortBy === "least") result = [...result].sort((a,b) => a.bookmarks.length - b.bookmarks.length);
    else if (sortBy === "newest") result = [...result].sort((a,b) => {
      const ta = Math.max(0, ...a.bookmarks.map(bm => bm.addedAt || 0));
      const tb = Math.max(0, ...b.bookmarks.map(bm => bm.addedAt || 0));
      return tb - ta;
    });
    return result;
  },[categories,debouncedSearch,filterTag,sortBy]);

  const dragEnabled = sortBy === "default" && !debouncedSearch.trim() && !filterTag;

  const saveCat = async cat => {
    try {
      if (categories.find(c => c.id === cat.id)) {
        const input = {
          id: cat.id,
          name: cat.name,
          emoji: cat.icon || "📁",
          color: cat.color ?? 0,
          tags: cat.tags || [],
        };
        const result = await queueAndPatch(utils.category.list, "category.update", input);
        if (!result.queued) {
          try {
            await updateCat.mutateAsync(input);
          } catch (err) {
            await utils.category.list.invalidate();
            throw err;
          }
        }
        flash(result.queued ? "Category updated (pending sync)" : "Category updated ✓");
      } else {
        const clientId = cat.id || createOutboxId();
        const input = {
          name: cat.name,
          emoji: cat.icon || "📁",
          color: cat.color ?? 0,
          tags: cat.tags || [],
        };
        const result = await queueAndPatch(utils.category.list, "category.create", input, { clientId });
        if (!result.queued) {
          try {
            const server = await createCat.mutateAsync(input);
            if (clientId && server?.id) remapOptimisticId(utils.category.list, clientId, server.id);
          } catch (err) {
            await utils.category.list.invalidate();
            throw err;
          }
        }
        flash(result.queued ? "Category created (pending sync)" : "Category created ✓");
      }
      setShowNewCat(false);
      setEditCat(null);
    } catch (err) {
      flash(err?.message || "Could not save category");
    }
  };

  const onReorderCat = async (draggedId, targetId) => {
    if (draggedId === targetId) return;
    const ids = categories.map(c => c.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const nextIds = [...ids];
    nextIds.splice(fromIdx, 1);
    nextIds.splice(toIdx, 0, draggedId);
    utils.category.list.setData(undefined, (old) => {
      if (!old) return old;
      const byId = new Map(old.map(c => [c.id, c]));
      return nextIds.map(id => byId.get(id)).filter(Boolean);
    });
    try {
      await reorderCat.mutateAsync({ orderedIds: nextIds });
    } catch (err) {
      await utils.category.list.invalidate();
      flash(err?.message || "Could not reorder categories");
    }
  };

  const exportData = async () => {
    if (!online) { flash("Export needs a connection"); return; }
    try {
      const data = await utils.export.toJSON.fetch();
      const b = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = "markme_bookmarks.json";
      a.click();
      URL.revokeObjectURL(u);
      flash("Exported ✓");
    } catch (err) {
      flash(err?.message || "Export failed");
    }
  };

  const importData = e => {
    if (!online) { flash("Import needs a connection"); e.target.value = ""; return; }
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        const categoriesPayload = Array.isArray(d) ? d : d?.categories;
        if (!Array.isArray(categoriesPayload)) {
          flash("Invalid file");
          return;
        }
        const bmCount = categoriesPayload.reduce((n, c) => n + (Array.isArray(c?.bookmarks) ? c.bookmarks.length : 0), 0);
        setConfirmImport({
          categories: categoriesPayload,
          catCount: categoriesPayload.length,
          bmCount,
        });
      } catch (err) {
        flash(err?.message || "Invalid file");
      }
    };
    r.readAsText(file);
    e.target.value = "";
  };

  const doImport = async mode => {
    const payload = confirmImport?.categories;
    setConfirmImport(null);
    if (!payload) return;
    try {
      await importJson.mutateAsync({ categories: payload, mode });
      await utils.category.list.invalidate();
      flash(mode === "merge" ? "Imported (merged) ✓" : "Imported ✓");
    } catch (err) {
      flash(err?.message || "Import failed");
    }
  };

  const retryAllFailed = async () => {
    for (const entry of outboxEntries.filter(e => e.status === "failed")) {
      await retryOutboxEntry(entry.id);
    }
    notifyOutboxChanged();
    const result = await flushOutbox(utils.client);
    if (result.synced > 0) {
      await utils.category.list.invalidate();
      flash(`Synced ${result.synced} change${result.synced === 1 ? "" : "s"} ✓`);
    }
    notifyOutboxChanged();
  };

  const discardAllFailedHandler = async () => {
    await discardAllFailed();
    notifyOutboxChanged();
    await utils.category.list.invalidate();
    flash("Discarded failed changes");
  };

  const requestDeleteCat = cat => setConfirmDel({ cat });
  const confirmDeleteCat = async () => {
    const cat = confirmDel?.cat;
    if (!cat) return;
    setConfirmDel(null);
    try {
      const input = { id: cat.id };
      const result = await queueAndPatch(utils.category.list, "category.delete", input);
      if (!result.queued) {
        try {
          await deleteCatMut.mutateAsync(input);
        } catch (err) {
          await utils.category.list.invalidate();
          throw err;
        }
      }
      flash(result.queued ? `"${cat.name}" deleted (pending sync)` : `"${cat.name}" deleted`);
    } catch (err) {
      flash(err?.message || "Delete failed");
    }
  };

  const saveBm = async (categoryId, bm) => {
    try {
      if (bm.id && categories.some(c => c.bookmarks.some(b => b.id === bm.id))) {
        const input = {
          id: bm.id,
          title: bm.title,
          url: bm.url,
          note: bm.note || null,
          tags: bm.tags || [],
          categoryId,
        };
        const result = await queueAndPatch(utils.category.list, "bookmark.update", input);
        if (!result.queued) {
          try {
            await updateBm.mutateAsync(input);
          } catch (err) {
            await utils.category.list.invalidate();
            throw err;
          }
        }
        flash(result.queued ? "Bookmark updated (pending sync)" : "Bookmark updated ✓");
      } else {
        const clientId = bm.id || createOutboxId();
        const input = {
          categoryId,
          title: bm.title,
          url: bm.url,
          note: bm.note || undefined,
          tags: bm.tags || [],
          pinned: bm.pinned || false,
        };
        const result = await queueAndPatch(utils.category.list, "bookmark.create", input, { clientId });
        if (!result.queued) {
          try {
            const server = await createBm.mutateAsync(input);
            if (clientId && server?.id) remapOptimisticId(utils.category.list, clientId, server.id);
          } catch (err) {
            await utils.category.list.invalidate();
            throw err;
          }
        }
        flash(result.queued ? "Bookmark added (pending sync)" : "Bookmark added ✓");
      }
    } catch (err) {
      flash(err?.message || "Could not save bookmark");
    }
  };

  const deleteBm = async (catId, bmId, bmTitle) => {
    const snapshot = categories
      .find(c => c.id === catId)
      ?.bookmarks.find(b => b.id === bmId);
    const label = bmTitle || snapshot?.title || "bookmark";
    try {
      const input = { id: bmId };
      const result = await queueAndPatch(utils.category.list, "bookmark.delete", input);
      if (!result.queued) {
        try {
          await deleteBmMut.mutateAsync(input);
        } catch (err) {
          await utils.category.list.invalidate();
          throw err;
        }
      }
      flashUndo(
        result.queued ? `"${label}" removed (pending sync)` : `"${label}" removed`,
        async () => {
          if (!snapshot) return;
          try {
            const clientId = createOutboxId();
            const restore = {
              categoryId: catId,
              title: snapshot.title,
              url: snapshot.url,
              note: snapshot.note || undefined,
              tags: snapshot.tags || [],
              pinned: snapshot.pinned || false,
            };
            const queued = await queueAndPatch(utils.category.list, "bookmark.create", restore, { clientId });
            if (!queued.queued) {
              try {
                const server = await createBm.mutateAsync(restore);
                if (server?.id) remapOptimisticId(utils.category.list, clientId, server.id);
              } catch (err) {
                await utils.category.list.invalidate();
                throw err;
              }
            }
            flash(queued.queued ? "Restored (pending sync)" : "Restored ✓");
          } catch {
            flash("Could not undo delete");
          }
        },
      );
    } catch (err) {
      flash(err?.message || "Delete failed");
    }
  };

  const togglePin = async id => {
    try {
      const input = { id };
      const result = await queueAndPatch(utils.category.list, "bookmark.togglePin", input);
      if (!result.queued) {
        try {
          await togglePinMut.mutateAsync(input);
        } catch (err) {
          await utils.category.list.invalidate();
          throw err;
        }
      }
    } catch (err) {
      flash(err?.message || "Could not update pin");
    }
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
            <button onClick={exportData} disabled={!online} title={online ? "Export" : "Export needs a connection"} aria-label="Export bookmarks as JSON" style={{ ...S.btn, background:"transparent", color:online?T.textSec:T.textMuted, padding:"6px 10px", border:`1px solid ${T.border}`, opacity:online?1:0.45, cursor:online?"pointer":"not-allowed" }} onMouseEnter={e=>{if(!online)return;e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=online?T.textSec:T.textMuted}}><I.Export /></button>
            <button onClick={()=>{ if (!online) { flash("Import needs a connection"); return; } fileRef.current?.click(); }} disabled={!online} title={online ? "Import" : "Import needs a connection"} aria-label="Import bookmarks from JSON" style={{ ...S.btn, background:"transparent", color:online?T.textSec:T.textMuted, padding:"6px 10px", border:`1px solid ${T.border}`, opacity:online?1:0.45, cursor:online?"pointer":"not-allowed" }} onMouseEnter={e=>{if(!online)return;e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=online?T.textSec:T.textMuted}}><I.Import /></button>
            <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display:"none" }} aria-hidden="true" tabIndex={-1} />
            <button onClick={()=>{ if (!online) { flash("AI needs a connection"); return; } setShowAi(true); }} disabled={!online} title={online ? "AI Assistant" : "AI needs a connection"} aria-label="Open AI assistant" style={{ ...S.btn, background:T.primarySubtle, color:online?T.primary:T.textMuted, padding:"6px 10px", border:`1px solid ${T.primary}30`, position:"relative", opacity:online?1:0.45, cursor:online?"pointer":"not-allowed" }}
              onMouseEnter={e=>{if(!online)return;e.currentTarget.style.background=T.primary+"25"}} onMouseLeave={e=>{e.currentTarget.style.background=T.primarySubtle}}>
              <I.Sparkle /><span style={{ position:"absolute", top:-2, right:-2, width:6, height:6, background:T.secondary, borderRadius:"50%" }} />
            </button>
            <button onClick={()=>setShowNewCat(true)} aria-label="Create new category" style={{ ...S.btn, background:"#fff", color:T.bg, padding:"7px 16px", fontWeight:800, fontSize:13, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)", transition:"all 0.15s cubic-bezier(0.4,0,0.2,1)" }}
              onMouseDown={e=>{e.currentTarget.style.transform="scale(0.95)";e.currentTarget.style.boxShadow="1px 1px 0 rgba(0,0,0,0.2)"}}
              onMouseUp={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="4px 4px 0 rgba(0,0,0,0.4)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(0,0,0,0.3)"}}><I.Plus /> New</button>
            {/* Profile button */}
            <button onClick={()=>onNavigate("profile")} aria-label={`Profile — ${user.name}`} style={{ ...S.btn, width:32, height:32, padding:0, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, color:T.onPrimary, fontSize:12, fontWeight:800, flexShrink:0 }}
              title="Profile">{user.name?.[0]?.toUpperCase()||"U"}</button>
          </div>
          <button className="mm-mob-btn" onClick={()=>setMobileNav(!mobileNav)} aria-label="Open menu" aria-expanded={mobileNav} style={{ ...S.btn, background:"transparent", color:T.textSec, padding:6, display:"none" }}><I.Menu /></button>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileNavOverlay open={mobileNav} onClose={()=>setMobileNav(false)}
        items={[
          {icon:<I.Plus />,label:"New Category",fn:()=>{setShowNewCat(true);setMobileNav(false)}},
          {icon:<I.Sparkle />,label:online?"AI Assistant":"AI (online only)",fn:()=>{ if (!online) { flash("AI needs a connection"); setMobileNav(false); return; } setShowAi(true);setMobileNav(false)}},
          {icon:<I.Export />,label:online?"Export":"Export (online only)",fn:()=>{exportData();setMobileNav(false)}},
          {icon:<I.Import />,label:online?"Import":"Import (online only)",fn:()=>{ if (!online) { flash("Import needs a connection"); setMobileNav(false); return; } fileRef.current?.click();setMobileNav(false)}},
          {icon:<I.User />,label:"Profile",fn:()=>{onNavigate("profile");setMobileNav(false)}},
          {icon:<I.LogOut />,label:"Log out",fn:()=>{onLogout();setMobileNav(false)}},
        ]} />

      {failedCount > 0 && (
        <div role="alert" style={{
          background: T.error+"12",
          borderBottom: `1px solid ${T.error}40`,
          color: T.error,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: T.font,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 8,
          position: "relative",
          zIndex: 99,
        }}>
          <I.Zap /> {failedCount} change{failedCount === 1 ? "" : "s"} failed to sync
          <button onClick={retryAllFailed} style={{ ...S.btn, background:T.error, color:"#fff", padding:"4px 10px", fontSize:11, fontWeight:800 }}>Retry all</button>
          <button onClick={discardAllFailedHandler} style={{ ...S.btn, background:"transparent", color:T.error, padding:"4px 10px", fontSize:11, fontWeight:700, border:`1px solid ${T.error}40` }}>Discard failed</button>
        </div>
      )}

      {(!online || pendingCount > 0) && (
        <div role="status" aria-live="polite" style={{
          background: !online ? T.secondarySubtle : T.primarySubtle,
          borderBottom: `1px solid ${!online ? T.secondary+"40" : T.primary+"40"}`,
          color: !online ? T.secondary : T.primary,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: T.font,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          position: "relative",
          zIndex: 99,
        }}>
          <I.Cloud />
          {!online
            ? `You're offline${pendingCount ? ` · ${pendingCount} change${pendingCount === 1 ? "" : "s"} will sync later` : " · browsing last synced bookmarks"}`
            : `Syncing ${pendingCount} pending change${pendingCount === 1 ? "" : "s"}…`}
        </div>
      )}

      <main id="main-content" style={{ maxWidth:1100, margin:"0 auto", padding:"16px 16px 60px", position:"relative", zIndex:1 }}>
        {isLoading && !categories.length && (
          <div style={{ textAlign:"center", padding:"40px 20px", color:T.textMuted, fontSize:13, fontWeight:600 }}>Loading your bookmarks from Neon…</div>
        )}
        {!isLoading && !online && !categories.length && (
          <div style={{ textAlign:"center", padding:"40px 20px", color:T.textMuted, fontSize:13, fontWeight:600 }}>No cached bookmarks yet. Connect once to sync your library.</div>
        )}
        <PullToRefresh onRefresh={async () => { await refetch(); flash("Refreshed ✓"); }}>
        {/* Mobile search */}
        <div className="mm-mob-search" style={{ display:"none", marginBottom:14 }}>
          <div role="search" style={{ display:"flex", alignItems:"center", gap:6, background:T.bgInput, border:`1px solid ${searchInput ? T.primary+"60" : T.border}`, padding:"8px 12px", transition:"border-color 0.2s" }}>
            <I.Search s={14} /><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="Search bookmarks…" aria-label="Search bookmarks" style={{ border:"none", outline:"none", fontSize:14, fontFamily:T.font, background:"transparent", color:T.text, flex:1, fontWeight:500 }} />
            {isSearching && <div style={{ width:12, height:12, border:`2px solid ${T.primary}`, borderTopColor:"transparent", borderRadius:"50%", animation:"mmSpin 0.5s linear infinite", flexShrink:0 }} />}
            {searchInput&&<button onClick={()=>setSearchInput("")} aria-label="Clear search" style={{ ...S.btn, background:"none", padding:2, color:T.textMuted }}><I.X s={12}/></button>}
          </div>
        </div>

        <div className="mm-stats" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:T.border, marginBottom:16 }}>
          {stats.map((s,i)=>(
            <div key={s.label} style={{ background:T.bg, padding:"12px 14px", animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*60}ms both` }}>
              <div style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1, color:s.color }}><AnimCount to={s.val} duration={700+i*100} /></div>
              <div style={{ fontSize:10, fontWeight:600, color:T.textMuted, letterSpacing:"0.04em", marginTop:4, textTransform:"uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          {allTags.length>0&&<div role="toolbar" aria-label="Filter by tags" style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", flex:1, minWidth:0 }}>
            <Tag tag="ALL" small active={!filterTag} onClick={()=>setFilterTag(null)} />
            {allTags.map(t=><Tag key={t} tag={t} small active={filterTag===t} onClick={()=>setFilterTag(filterTag===t?null:t)} />)}
          </div>}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:T.textMuted, fontWeight:600 }}>
              <I.Sort />
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="Sort categories"
                style={{ background:T.bgInput, border:`1px solid ${T.border}`, color:T.text, fontFamily:T.font, fontSize:12, fontWeight:600, padding:"5px 8px", borderRadius:0, cursor:"pointer", outline:"none" }}>
                <option value="default">Default</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="most">Most links</option>
                <option value="least">Fewest</option>
                <option value="newest">Newest</option>
              </select>
            </label>
            <span style={{ fontSize:11, color:T.textMuted, fontFamily:T.font }}>
              {filtered.length} categor{filtered.length===1?"y":"ies"} · {filtered.reduce((a,c)=>a+c.bookmarks.length,0)} links
            </span>
          </div>
        </div>

        <ErrorBoundary fallbackTitle="Dashboard error" fallbackMessage="The bookmark grid encountered an error. Try refreshing.">
        <VirtualMasonry items={filtered} columnCount={3} gap={14}
          renderItem={(cat, i) => (
            <CatCard cat={cat} allTags={allTags} searchQuery={debouncedSearch}
              onTogglePin={togglePin}
              onSaveBm={saveBm}
              onDelete={requestDeleteCat}
              onDeleteBm={deleteBm}
              dragEnabled={dragEnabled}
              onReorder={onReorderCat}
              onEdit={c=>setEditCat(c)} />
          )} />
        </ErrorBoundary>

        {filtered.length===0&&<div style={{ textAlign:"center", padding:"80px 20px" }}><div style={{ fontSize:40, marginBottom:12, opacity:0.4 }}>🔍</div><p style={{ fontSize:16, fontWeight:700, color:T.textSec, marginBottom:6 }}>{debouncedSearch||filterTag?"No matches":"No categories yet"}</p><p style={{ fontSize:13, color:T.textMuted }}>{debouncedSearch||filterTag?"Try a different search":"Create your first category"}</p></div>}
        </PullToRefresh>
      </main>

      {/* Mobile FAB */}
      <button className="mm-fab" onClick={()=>setShowNewCat(true)} aria-label="Create new category"
        style={{
          ...S.btn, display:"none", position:"fixed", bottom:24, right:20, zIndex:90,
          width:52, height:52, padding:0, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
          color:T.onPrimary, boxShadow:"4px 4px 0 rgba(0,0,0,0.35)",
          transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}
        onTouchStart={e=>e.currentTarget.style.transform="scale(0.9)"}
        onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
      ><I.Plus /></button>

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
      <Modal open={!!confirmImport} onClose={()=>setConfirmImport(null)} title="Import bookmarks?">
        <p style={{ fontSize:13, color:T.textSec, lineHeight:1.6, marginBottom:18 }}>
          File has <strong style={{ color:T.text }}>{confirmImport?.catCount ?? 0} categor{(confirmImport?.catCount ?? 0) === 1 ? "y" : "ies"}</strong>
          {" "}({confirmImport?.bmCount ?? 0} bookmark{(confirmImport?.bmCount ?? 0) === 1 ? "" : "s"}).{" "}
          <strong style={{ color:T.text }}>Merge</strong> adds them into your library without wiping anything.{" "}
          <strong style={{ color:T.error }}>Replace all</strong> deletes your current library first — this cannot be undone.
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>doImport("merge")} style={{ ...S.btn, flex:1, padding:"11px", background:T.primary, color:T.onPrimary, fontSize:13, fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}>Merge</button>
          <button onClick={()=>doImport("replace")} style={{ ...S.btn, flex:1, padding:"11px", background:T.error, color:"#fff", fontSize:13, fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}>Replace all</button>
        </div>
        <button onClick={()=>setConfirmImport(null)} style={{ ...S.btn, width:"100%", marginTop:8, padding:"9px", background:"transparent", color:T.textMuted, border:`1px solid ${T.border}`, fontSize:12 }}>Cancel</button>
      </Modal>
      <AiPanel open={showAi} onClose={()=>setShowAi(false)} categories={categories} onBookmarksChanged={()=>utils.category.list.invalidate()} />
      {ToastEl}

      <style>{`
        @media(max-width:860px){.mm-grid{column-count:2!important}.mm-stats{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:640px){.mm-grid{column-count:1!important}.mm-desk{display:none!important}.mm-mob-btn{display:flex!important}.mm-mob-search{display:block!important}.mm-stats{grid-template-columns:repeat(2,1fr)!important}.mm-fab{display:flex!important}}
        *:focus-visible{outline:2px solid ${T.primary};outline-offset:2px}
        input:focus-visible,select:focus-visible,textarea:focus-visible{outline:none;border-color:${T.primary}!important}
        .mm-bm-actions:focus-within{opacity:1!important}
        .mm-cat-scroll,.mm-modal-scroll{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.18) transparent}
        .mm-cat-scroll::-webkit-scrollbar,.mm-modal-scroll::-webkit-scrollbar{width:4px}
        .mm-cat-scroll::-webkit-scrollbar-track,.mm-modal-scroll::-webkit-scrollbar-track{background:transparent}
        .mm-cat-scroll::-webkit-scrollbar-thumb,.mm-modal-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18)}
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: PRICING
   ══════════════════════════════════════════════════════════════════════════ */
function PricingPage({ onNavigate }) {
  const [annual, setAnnual] = useState(true);
  const plans = [
    { id:"free", name:"Free", price:"$0", priceAnnual:"$0", period:"forever", desc:"For casual bookmarkers",
      features:["Up to 100 bookmarks","5 categories","Tag filtering & search","Export/Import JSON","Basic sort controls"],
      cta:"Get Started", action:()=>onNavigate("signup") },
    { id:"pro", name:"Pro", price:"$5/mo", priceAnnual:"$4/mo", period:annual?"billed annually":"billed monthly", desc:"For power users",
      features:["Unlimited bookmarks","Unlimited categories","Cloud sync & backup","Chrome extension + new tab","AI auto-tagging & summaries","Link preview tooltips","Priority support"],
      color:T.primary, popular:true, cta:"Start Free Trial", action:()=>onNavigate("signup") },
    { id:"team", name:"Team", price:"$12/mo", priceAnnual:"$9/mo", period:"per user, "+( annual?"billed annually":"billed monthly"), desc:"For teams & companies",
      features:["Everything in Pro","Shared workspaces","Team bookmark collections","Admin dashboard & roles","Bio website generator","API access","Dedicated support"],
      color:T.secondary, cta:"Contact Sales", action:()=>onNavigate("signup") },
  ];

  const faqs = [
    { q:"Can I switch plans later?", a:"Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate the difference." },
    { q:"Is there a free trial for Pro?", a:"Yes — Pro comes with a 14-day free trial, no credit card required. You'll only be charged if you decide to continue." },
    { q:"What happens to my bookmarks if I downgrade?", a:"Your bookmarks are never deleted. If you exceed the free tier limit, you'll have read-only access until you upgrade or remove some." },
    { q:"Does the Chrome extension work on other browsers?", a:"We're starting with Chrome and Chromium-based browsers (Edge, Brave, Arc). Firefox and Safari support is planned." },
    { q:"How does AI auto-tagging work?", a:"When you save a bookmark, our AI analyzes the URL, title, and page content to suggest relevant tags and a category. You can accept, edit, or ignore the suggestions." },
  ];
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text }}>
      <Atmosphere />
      <SkipLink />
      <nav aria-label="Site navigation" style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", background:"rgba(13,13,13,0.85)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div onClick={()=>onNavigate("landing")} role="button" tabIndex={0} aria-label="Go to homepage" onKeyDown={e=>{if(e.key==="Enter")onNavigate("landing")}} style={{ cursor:"pointer" }}><Logo /></div>
          <button onClick={()=>onNavigate("signup")} style={{ ...S.btn, background:"#fff", color:T.bg, padding:"7px 16px", fontWeight:800, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}>Get Started</button>
        </div>
      </nav>

      <main id="main-content" style={{ maxWidth:1100, margin:"0 auto", padding:"60px 20px 80px", position:"relative", zIndex:1 }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:48, animation:"mmSlideUp .5s ease both" }}>
          <h1 style={{ fontFamily:T.font, fontSize:"clamp(2rem, 4vw, 3rem)", fontWeight:800, letterSpacing:"-0.04em", marginBottom:12 }}>
            Simple, transparent <span style={{ background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>pricing</span>
          </h1>
          <p style={{ color:T.textSec, fontSize:15, maxWidth:440, margin:"0 auto 24px" }}>Start free. Upgrade when you need more power.</p>
          {/* Annual/Monthly toggle */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:T.bgEl, border:`1px solid ${T.border}`, padding:4 }}>
            {[{label:"Monthly",val:false},{label:"Annual",val:true}].map(o=>(
              <button key={o.label} onClick={()=>setAnnual(o.val)} style={{
                ...S.btn, padding:"7px 20px", fontSize:12, fontWeight:700,
                background:annual===o.val?"#fff":"transparent", color:annual===o.val?T.bg:T.textMuted,
                transition:"all 0.15s",
              }}>{o.label} {o.val && <span style={{ fontSize:10, color:annual?T.bg:T.success, fontWeight:800, marginLeft:2 }}>-20%</span>}</button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div className="mm-pricing-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:T.border, marginBottom:60, alignItems:"stretch" }}>
          {plans.map((p,i)=>(
            <div key={p.id} style={{
              background:T.bg, padding:"36px 28px", position:"relative", overflow:"hidden",
              display:"flex", flexDirection:"column", height:"100%",
              animation:`mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*80}ms both`,
            }}>
              {p.popular && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:p.color }} />}
              {p.popular && <span style={{ position:"absolute", top:12, right:12, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", background:p.color+"20", color:p.color, padding:"2px 8px", border:`1px solid ${p.color}30` }}>Most popular</span>}
              {p.color && <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", background:p.color, filter:"blur(70px)", opacity:0.08 }} />}
              <div style={{ fontSize:13, fontWeight:800, color:T.text, letterSpacing:"-0.02em", marginBottom:4, position:"relative" }}>{p.name}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:4, position:"relative" }}>
                <span style={{ fontSize:36, fontWeight:800, color:p.color||T.text, letterSpacing:"-0.04em", lineHeight:1 }}>{annual?p.priceAnnual:p.price}</span>
              </div>
              <div style={{ fontSize:11, color:T.textMuted, marginBottom:20, position:"relative" }}>{p.period}</div>
              <p style={{ fontSize:13, color:T.textSec, marginBottom:20, lineHeight:1.5, position:"relative" }}>{p.desc}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, marginBottom:24, position:"relative" }}>
                {p.features.map((f,fi)=>(
                  <div key={fi} style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:T.textSec }}>
                    <span style={{ color:p.color||T.success, display:"flex", flexShrink:0 }}><I.Check /></span> {f}
                  </div>
                ))}
              </div>
              <button onClick={p.action} style={{
                ...S.btn, width:"100%", padding:"12px", fontSize:14, fontWeight:800, position:"relative",
                marginTop:"auto", flexShrink:0,
                background:p.popular?"#fff":p.color?p.color+"18":"transparent",
                color:p.popular?T.bg:p.color||T.textSec,
                border:p.popular?"none":`1px solid ${p.color?p.color+"40":T.border}`,
                boxShadow:p.popular?"4px 4px 0 rgba(0,0,0,0.4)":"none",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"}}
              >{p.popular && <I.Crown />} {p.cta}</button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <h2 style={{ fontFamily:T.font, fontSize:22, fontWeight:800, letterSpacing:"-0.03em", marginBottom:24, textAlign:"center" }}>Frequently asked questions</h2>
          {faqs.map((f,i)=>(
            <div key={i} style={{ borderBottom:`1px solid ${T.border}`, animation:`mmCardSpring 0.4s ease ${i*50}ms both` }}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i}
                style={{ ...S.btn, width:"100%", padding:"16px 0", justifyContent:"space-between", background:"transparent", color:T.text, fontSize:14, fontWeight:700, textAlign:"left" }}>
                {f.q}
                <I.Chev style={{ transform:openFaq===i?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s", flexShrink:0, marginLeft:12 }} />
              </button>
              <AnimatedCollapse open={openFaq===i}>
                <p style={{ fontSize:13, color:T.textSec, lineHeight:1.6, paddingBottom:16 }}>{f.a}</p>
              </AnimatedCollapse>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @media(max-width:768px){.mm-pricing-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE: NEW TAB PREVIEW (Chrome Extension)
   ══════════════════════════════════════════════════════════════════════════ */
function NewTabPage({ onNavigate, categories }) {
  const [time, setTime] = useState(new Date());
  const [ntSearch, setNtSearch] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = time.getHours().toString().padStart(2,"0");
  const mins = time.getMinutes().toString().padStart(2,"0");
  const dateStr = time.toLocaleDateString("en", { weekday:"long", month:"long", day:"numeric" });
  const greeting = time.getHours() < 12 ? "Good morning" : time.getHours() < 18 ? "Good afternoon" : "Good evening";

  const allBm = categories.flatMap(c => c.bookmarks.map(b => ({...b, catColor: c.color, catName: c.name, catIcon: c.icon})));
  const pinned = allBm.filter(b => b.pinned);
  const recent = [...allBm].sort((a,b) => (b.addedAt||0) - (a.addedAt||0)).slice(0, 8);
  const searchResults = ntSearch ? allBm.filter(b => b.title.toLowerCase().includes(ntSearch.toLowerCase()) || b.url.toLowerCase().includes(ntSearch.toLowerCase())) : [];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.font, color:T.text, position:"relative" }}>
      <Atmosphere />
      {/* Back button */}
      <div style={{ position:"absolute", top:16, left:20, zIndex:10 }}>
        <button onClick={()=>onNavigate("landing")} style={{ ...S.btn, background:T.bgInput, color:T.textMuted, padding:"6px 14px", border:`1px solid ${T.border}`, fontSize:12 }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted}}>
          Back to site
        </button>
      </div>
      <div style={{ position:"absolute", top:16, right:20, zIndex:10 }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", background:T.primary+"20", color:T.primary, padding:"4px 10px", border:`1px solid ${T.primary}30`, fontFamily:T.font, whiteSpace:"nowrap" }}>
          <I.Chrome /> Extension Preview
        </span>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"80px 20px 60px", textAlign:"center", position:"relative", zIndex:1 }}>
        {/* Clock */}
        <div style={{ animation:"mmSlideUp .5s ease both" }}>
          <div style={{ fontSize:"clamp(4rem, 12vw, 7rem)", fontWeight:800, letterSpacing:"-0.06em", lineHeight:1, marginBottom:8, display:"inline-flex", alignItems:"baseline", justifyContent:"center" }}>
            <span style={{ background:`linear-gradient(135deg, ${T.text}, ${T.textSec})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{hours}</span>
            <span style={{ color:T.textMuted, opacity:0.7, margin:"0 0.02em" }}>:</span>
            <span style={{ background:`linear-gradient(135deg, ${T.text}, ${T.textSec})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{mins}</span>
          </div>
          <p style={{ fontSize:15, color:T.textMuted, marginBottom:6 }}>{dateStr}</p>
          <p style={{ fontSize:17, color:T.textSec, fontWeight:600, marginBottom:32 }}>{greeting}</p>
        </div>

        {/* Search */}
        <div style={{ maxWidth:500, margin:"0 auto 40px", animation:"mmSlideUp .5s ease .1s both" }}>
          <div role="search" style={{ display:"flex", alignItems:"center", gap:8, background:T.bgEl, border:`1px solid ${ntSearch?T.primary+"60":T.border}`, padding:"12px 16px", transition:"border-color 0.2s" }}>
            <I.Search s={18} />
            <input value={ntSearch} onChange={e=>setNtSearch(e.target.value)} placeholder="Search your bookmarks…" aria-label="Search bookmarks"
              style={{ border:"none", outline:"none", fontSize:15, fontFamily:T.font, background:"transparent", color:T.text, flex:1, fontWeight:500 }} />
            {ntSearch && <button onClick={()=>setNtSearch("")} style={{ ...S.btn, background:"none", color:T.textMuted, padding:4 }}><I.X /></button>}
          </div>
          {/* Search results dropdown */}
          {ntSearch && searchResults.length > 0 && (
            <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderTop:"none", textAlign:"left", maxHeight:240, overflowY:"auto" }}>
              {searchResults.slice(0,6).map(b=>(
                <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", textDecoration:"none", transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <FaviconWithFallback url={b.url} title={b.title} size={16} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}><Highlight text={b.title} query={ntSearch} /></div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{getDomain(b.url)}</div>
                  </div>
                  <span style={{ fontSize:10, color:ACCENTS[b.catColor]?.bg||T.textMuted, fontWeight:700, flexShrink:0 }}>{b.catIcon}</span>
                </a>
              ))}
            </div>
          )}
          {ntSearch && searchResults.length === 0 && (
            <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderTop:"none", padding:"16px", textAlign:"center" }}>
              <span style={{ fontSize:12, color:T.textMuted }}>No bookmarks match "{ntSearch}"</span>
            </div>
          )}
        </div>

        {/* Pinned shortcuts */}
        {!ntSearch && pinned.length > 0 && (
          <div style={{ marginBottom:40, animation:"mmSlideUp .5s ease .2s both" }}>
            <h3 style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:14 }}>Pinned</h3>
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:12 }}>
              {pinned.map(b => {
                const ac = ACCENTS[b.catColor]||ACCENTS[0];
                return (
                  <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", width:80, textAlign:"center", transition:"transform 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                    <div style={{ width:48, height:48, margin:"0 auto 6px", background:ac.bg+"15", border:`1px solid ${ac.bg}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <FaviconWithFallback url={b.url} title={b.title} size={24} />
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:T.textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.title}</div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent bookmarks */}
        {!ntSearch && recent.length > 0 && (
          <div style={{ animation:"mmSlideUp .5s ease .3s both", textAlign:"left" }}>
            <h3 style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:14, textAlign:"center" }}>Recently added</h3>
            <div className="mm-newtab-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
              {recent.map(b => {
                const ac = ACCENTS[b.catColor]||ACCENTS[0];
                return (
                  <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer"
                    style={{ display:"block", background:T.bgEl, border:`1px solid ${T.border}`, padding:"14px", textDecoration:"none", transition:"all 0.15s", position:"relative", overflow:"hidden" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)"}}>
                    <div style={{ position:"absolute", top:-20, right:-20, width:50, height:50, borderRadius:"50%", background:ac.bg, filter:"blur(30px)", opacity:0.08 }} />
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, position:"relative" }}>
                      <FaviconWithFallback url={b.url} title={b.title} size={16} />
                      <span style={{ fontSize:12, fontWeight:700, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.title}</span>
                    </div>
                    <div style={{ fontSize:10, color:T.textMuted, position:"relative" }}>{getDomain(b.url)}</div>
                    {b.addedAt && <div style={{ fontSize:9, color:T.textMuted, marginTop:4, position:"relative" }}>{timeAgo(b.addedAt)}</div>}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop:48, animation:"mmSlideUp .5s ease .4s both" }}>
          <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, padding:28, maxWidth:480, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:12 }}>
              <I.Chrome /><span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>Get the Chrome Extension</span>
            </div>
            <p style={{ fontSize:12, color:T.textMuted, lineHeight:1.5, marginBottom:16, textAlign:"center" }}>Replace your new tab with this view. Access your bookmarks instantly every time you open a tab.</p>
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              <button style={{ ...S.btn, background:"#fff", color:T.bg, padding:"10px 20px", fontWeight:800, fontSize:13, boxShadow:"2px 2px 0 rgba(0,0,0,0.3)" }}>Install Extension</button>
              <button onClick={()=>onNavigate("landing")} style={{ ...S.btn, background:"transparent", color:T.textSec, padding:"10px 16px", border:`1px solid ${T.border}`, fontSize:13 }}>Learn More</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:640px){.mm-newtab-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   AI PANEL (used inside Dashboard)
   ══════════════════════════════════════════════════════════════════════════ */
function AiPanel({ open, onClose, categories, onBookmarksChanged }) {
  const trapRef = useFocusTrap(open);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role:"ai", kind:"text", text:"Hi! I'm your bookmark AI assistant. I can auto-tag bookmarks, summarize a category, find duplicates, or suggest reorganizations. Try a shortcut below or ask me something!" },
  ]);
  const [loading, setLoading] = useState(false);
  const [busyChip, setBusyChip] = useState(null);
  const scrollRef = useRef(null);

  const autoTagMut = trpc.ai.autoTag.useMutation();
  const summarizeMut = trpc.ai.summarize.useMutation();
  const duplicatesMut = trpc.ai.detectDuplicates.useMutation();
  const reorganizeMut = trpc.ai.reorganize.useMutation();
  const updateBmMut = trpc.bookmark.update.useMutation();
  const deleteBmMut = trpc.bookmark.delete.useMutation();

  const allBookmarks = useMemo(
    () => categories.flatMap(c => c.bookmarks.map(b => ({ ...b, categoryName: c.name }))),
    [categories],
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pushMessage = msg => setMessages(prev => [...prev, msg]);
  const updateLastMessage = updater => setMessages(prev => {
    const next = [...prev];
    next[next.length - 1] = updater(next[next.length - 1]);
    return next;
  });
  const patchMessage = (predicate, updater) => setMessages(prev => prev.map(m => (predicate(m) ? updater(m) : m)));

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role:"user", kind:"text", text:userMsg }, { role:"ai", kind:"text", text:"" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const line = part.split("\n").find(l => l.startsWith("data: "));
          if (!line) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const data = JSON.parse(payload);
            if (data.error) throw new Error(data.error);
            if (data.text) {
              aiText += data.text;
              updateLastMessage(() => ({ role: "ai", kind:"text", text: aiText }));
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              // keep streaming on partial JSON; rethrow real errors
              if (!String(parseErr.message).includes("JSON")) throw parseErr;
            }
          }
        }
      }
      if (!aiText) {
        updateLastMessage(() => ({ role: "ai", kind:"text", text: "No response from AI. Set OPENROUTER_API_KEY on the server for live answers." }));
      }
    } catch (err) {
      updateLastMessage(() => ({ role: "ai", kind:"text", text: err?.message || "Connection error. Please try again." }));
    }
    setLoading(false);
  };

  const runAutoTag = async () => {
    if (busyChip) return;
    setBusyChip("autotag");
    pushMessage({ role:"user", kind:"text", text:"Auto-tag recent bookmarks" });
    pushMessage({ role:"ai", kind:"loading", text:"Scanning recent bookmarks…" });
    try {
      const candidates = allBookmarks.filter(b => (b.tags?.length || 0) < 2).slice(0, 8);
      if (candidates.length === 0) {
        updateLastMessage(() => ({ role:"ai", kind:"text", text:"All your recent bookmarks already have good tags! 🎉" }));
        return;
      }
      const items = [];
      for (const bm of candidates) {
        try {
          const r = await autoTagMut.mutateAsync({ title: bm.title, url: bm.url });
          items.push({ id: bm.id, title: bm.title, url: bm.url, currentTags: bm.tags || [], suggestedTags: r.tags || [] });
        } catch {
          // skip bookmarks that fail individually
        }
      }
      if (items.length === 0) {
        updateLastMessage(() => ({ role:"ai", kind:"text", text:"Could not generate tag suggestions right now." }));
      } else {
        updateLastMessage(() => ({ role:"ai", kind:"autotag", text:`Tag suggestions for ${items.length} bookmark${items.length===1?"":"s"}:`, items }));
      }
    } catch (err) {
      updateLastMessage(() => ({ role:"ai", kind:"text", text: err?.message || "Could not auto-tag bookmarks." }));
    } finally {
      setBusyChip(null);
    }
  };

  const applyAutoTag = async item => {
    try {
      const merged = [...new Set([...(item.currentTags||[]), ...(item.suggestedTags||[])])];
      await updateBmMut.mutateAsync({ id: item.id, tags: merged });
      patchMessage(
        m => m.kind === "autotag",
        m => ({ ...m, items: m.items.map(it => (it.id === item.id ? { ...it, applied:true } : it)) }),
      );
      onBookmarksChanged?.();
    } catch (err) {
      pushMessage({ role:"ai", kind:"text", text: err?.message || "Could not apply tags." });
    }
  };

  const runSummarize = async () => {
    if (busyChip) return;
    const cat = categories.find(c => c.bookmarks.length > 0) || categories[0];
    if (!cat) {
      pushMessage({ role:"ai", kind:"text", text:"You don't have any categories yet." });
      return;
    }
    setBusyChip("summarize");
    pushMessage({ role:"user", kind:"text", text:`Summarize my "${cat.name}" category` });
    pushMessage({ role:"ai", kind:"loading", text:`Summarizing "${cat.name}"…` });
    try {
      const r = await summarizeMut.mutateAsync({ categoryId: cat.id });
      updateLastMessage(() => ({ role:"ai", kind:"summary", text:r.summary, keyTopics:r.keyTopics||[], categoryName:cat.name }));
    } catch (err) {
      updateLastMessage(() => ({ role:"ai", kind:"text", text: err?.message || "Could not summarize category." }));
    } finally {
      setBusyChip(null);
    }
  };

  const runDuplicates = async () => {
    if (busyChip) return;
    setBusyChip("duplicates");
    pushMessage({ role:"user", kind:"text", text:"Find duplicates" });
    pushMessage({ role:"ai", kind:"loading", text:"Scanning for duplicates…" });
    try {
      const r = await duplicatesMut.mutateAsync({});
      const bmById = new Map(allBookmarks.map(b => [b.id, b]));
      const semanticPairs = (r.duplicates||[]).map(d => ({
        a: bmById.get(d.a) || { id:d.a, title:d.a, url:"" },
        b: bmById.get(d.b) || { id:d.b, title:d.b, url:"" },
        similarity: d.similarity,
      }));
      const urlGroups = r.urlDuplicateGroups || [];
      if (semanticPairs.length === 0 && urlGroups.length === 0) {
        updateLastMessage(() => ({ role:"ai", kind:"text", text:"No duplicates found. Your library is clean! ✨" }));
      } else {
        updateLastMessage(() => ({ role:"ai", kind:"duplicates", text:"Here's what I found:", urlGroups, semanticPairs }));
      }
    } catch (err) {
      updateLastMessage(() => ({ role:"ai", kind:"text", text: err?.message || "Could not check for duplicates." }));
    } finally {
      setBusyChip(null);
    }
  };

  const deleteDuplicate = async id => {
    try {
      await deleteBmMut.mutateAsync({ id });
      patchMessage(
        m => m.kind === "duplicates",
        m => ({
          ...m,
          urlGroups: (m.urlGroups||[]).map(g => ({ ...g, bookmarks: g.bookmarks.filter(b => b.id !== id) })).filter(g => g.bookmarks.length > 1),
          semanticPairs: (m.semanticPairs||[]).filter(p => p.a.id !== id && p.b.id !== id),
        }),
      );
      onBookmarksChanged?.();
    } catch (err) {
      pushMessage({ role:"ai", kind:"text", text: err?.message || "Could not delete bookmark." });
    }
  };

  const runReorganize = async () => {
    if (busyChip) return;
    setBusyChip("reorganize");
    pushMessage({ role:"user", kind:"text", text:"Reorganize ideas" });
    pushMessage({ role:"ai", kind:"loading", text:"Thinking about your library structure…" });
    try {
      const r = await reorganizeMut.mutateAsync({});
      if (!r.suggestions || r.suggestions.length === 0) {
        updateLastMessage(() => ({ role:"ai", kind:"text", text: r.notice || "No reorganization suggestions right now." }));
      } else {
        updateLastMessage(() => ({ role:"ai", kind:"reorganize", text:"Here are some ideas:", suggestions:r.suggestions }));
      }
    } catch (err) {
      updateLastMessage(() => ({ role:"ai", kind:"text", text: err?.message || "Could not generate suggestions." }));
    } finally {
      setBusyChip(null);
    }
  };

  if (!open) return null;

  const chips = [
    { key:"autotag", label:"Auto-tag recent", fn:runAutoTag },
    { key:"summarize", label:"Summarize a category", fn:runSummarize },
    { key:"duplicates", label:"Find duplicates", fn:runDuplicates },
    { key:"reorganize", label:"Reorganize ideas", fn:runReorganize },
  ];

  return (
    <div ref={trapRef} role="dialog" aria-modal="true" aria-label="AI Assistant" style={{
      position:"fixed", top:0, right:0, bottom:0, width:380, maxWidth:"100vw", zIndex:800,
      background:T.bgEl, borderLeft:`1px solid ${T.border}`, display:"flex", flexDirection:"column",
      animation:"mmSlideLeft .25s cubic-bezier(0.32,0.72,0,1)", boxShadow:"-8px 0 32px rgba(0,0,0,0.3)",
    }}>
      {/* Header */}
      <div style={{ padding:"16px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center", color:T.onPrimary }}>
            <I.Sparkle />
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>AI Assistant</div>
            <div style={{ fontSize:10, color:T.textMuted }}>Powered by OpenRouter</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close AI panel" style={{ ...S.btn, background:T.bgInput, width:32, height:32, padding:0, color:T.textMuted, border:`1px solid ${T.border}` }}><I.X /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((m,i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:m.role==="user"?"flex-end":"flex-start", flexDirection:m.role==="user"?"row-reverse":"row" }}>
            <div style={{
              width:24, height:24, flexShrink:0,
              background:m.role==="ai" ? `linear-gradient(135deg, ${T.primary}, ${T.secondary})` : T.bgInput,
              border:m.role==="user" ? `1px solid ${T.border}` : "none",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:m.role==="ai"?T.onPrimary:T.textMuted,
            }}>{m.role==="ai" ? <I.Sparkle /> : "U"}</div>
            <div style={{
              maxWidth:"85%", padding:"10px 14px", fontSize:13, lineHeight:1.6, color:T.text, fontFamily:T.font,
              background:m.role==="ai" ? T.bgPanel : T.primary+"18",
              border:m.role==="ai" ? `1px solid ${T.border}` : `1px solid ${T.primary}30`,
              whiteSpace:"pre-wrap", wordBreak:"break-word",
            }}>
              {m.kind === "loading" && (
                <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                  {m.text}
                  <span style={{ display:"flex", gap:3 }}>
                    {[0,1,2].map(j=><span key={j} style={{ width:4, height:4, background:T.primary, borderRadius:"50%", opacity:0.6, animation:`mmPulse 1s ease ${j*0.15}s infinite` }} />)}
                  </span>
                </span>
              )}

              {(!m.kind || m.kind === "text") && m.text}

              {m.kind === "autotag" && (
                <div>
                  <div style={{ marginBottom:8 }}>{m.text}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {m.items.map(it => (
                      <div key={it.id} style={{ background:T.bgInput, border:`1px solid ${T.border}`, padding:"8px 10px" }}>
                        <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.title}</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:3, marginBottom:6 }}>
                          {it.suggestedTags.map(t => <Tag key={t} tag={t} small />)}
                          {it.suggestedTags.length === 0 && <span style={{ fontSize:11, color:T.textMuted }}>No new tags suggested</span>}
                        </div>
                        <button onClick={()=>applyAutoTag(it)} disabled={it.applied || it.suggestedTags.length===0}
                          style={{ ...S.btn, padding:"3px 10px", fontSize:11, fontWeight:700, background:it.applied?T.success+"20":T.primary, color:it.applied?T.success:T.onPrimary, opacity:(it.applied||it.suggestedTags.length===0)?0.7:1 }}>
                          {it.applied ? <><I.Check /> Applied</> : "Apply"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {m.kind === "summary" && (
                <div>
                  <div style={{ marginBottom:8 }}>{m.text}</div>
                  {m.keyTopics?.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                      {m.keyTopics.map(t => <Tag key={t} tag={t} small />)}
                    </div>
                  )}
                </div>
              )}

              {m.kind === "duplicates" && (
                <div>
                  <div style={{ marginBottom:8 }}>{m.text}</div>
                  {m.urlGroups?.length > 0 && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:5 }}>Same URL</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {m.urlGroups.map((g,gi) => (
                          <div key={gi} style={{ background:T.bgInput, border:`1px solid ${T.border}`, padding:"8px 10px" }}>
                            {g.bookmarks.map(b => (
                              <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:4 }}>
                                <span style={{ fontSize:12, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.title}</span>
                                <button onClick={()=>deleteDuplicate(b.id)} aria-label={`Delete ${b.title}`} style={{ ...S.btn, padding:"2px 8px", fontSize:10, fontWeight:700, background:"transparent", color:T.error, border:`1px solid ${T.error}30`, flexShrink:0 }}><I.Trash /> Delete</button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {m.semanticPairs?.length > 0 && (
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:5 }}>Similar bookmarks</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {m.semanticPairs.map((p,pi) => (
                          <div key={pi} style={{ background:T.bgInput, border:`1px solid ${T.border}`, padding:"8px 10px" }}>
                            {[p.a,p.b].map(b => (
                              <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:4 }}>
                                <span style={{ fontSize:12, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.title}</span>
                                <button onClick={()=>deleteDuplicate(b.id)} aria-label={`Delete ${b.title}`} style={{ ...S.btn, padding:"2px 8px", fontSize:10, fontWeight:700, background:"transparent", color:T.error, border:`1px solid ${T.error}30`, flexShrink:0 }}><I.Trash /> Delete</button>
                              </div>
                            ))}
                            <div style={{ fontSize:10, color:T.textMuted }}>{Math.round(p.similarity*100)}% similar</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {m.kind === "reorganize" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div>{m.text}</div>
                  {m.suggestions.map((s,si) => (
                    <div key={si} style={{ background:T.bgInput, border:`1px solid ${T.border}`, padding:"8px 10px" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:2 }}>{s.action}</div>
                      <div style={{ fontSize:11, color:T.textMuted }}>{s.reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <div style={{ width:24, height:24, flexShrink:0, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center", color:T.onPrimary }}><I.Sparkle /></div>
            <div style={{ padding:"12px 16px", background:T.bgPanel, border:`1px solid ${T.border}`, display:"flex", gap:4 }}>
              {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, background:T.primary, borderRadius:"50%", opacity:0.5, animation:`mmPulse 1s ease ${i*0.15}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && !loading && (
        <div style={{ padding:"0 18px 8px", display:"flex", flexWrap:"wrap", gap:4 }}>
          {chips.map(c => (
            <button key={c.key} onClick={c.fn} disabled={!!busyChip} style={{
              ...S.btn, padding:"4px 10px", fontSize:10, fontWeight:600, background:T.primarySubtle, color:T.primary, border:`1px solid ${T.primary}25`, textAlign:"left", opacity:busyChip?0.6:1,
            }}
              onMouseEnter={e=>{if(!busyChip)e.currentTarget.style.background=T.primary+"25"}} onMouseLeave={e=>e.currentTarget.style.background=T.primarySubtle}
            >{busyChip===c.key ? "Working…" : c.label}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"12px 18px", borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}}}
            placeholder="Ask about your bookmarks…" aria-label="AI message input"
            style={{ ...S.input, flex:1, padding:"10px 14px" }} />
          <button onClick={sendMessage} disabled={loading||!input.trim()} aria-label="Send message"
            style={{ ...S.btn, width:40, height:40, padding:0, background:input.trim()?T.primary:T.bgInput, color:input.trim()?T.onPrimary:T.textMuted, flexShrink:0, transition:"all 0.15s" }}>
            <I.Send />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   APP ROOT — ROUTER
   ══════════════════════════════════════════════════════════════════════════ */
const PAGE_PATHS = {
  landing: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  pricing: "/pricing",
  profile: "/profile",
  newtab: "/newtab",
};

function pathToPage(pathname) {
  const clean = (pathname || "/").replace(/\/+$/, "") || "/";
  const entry = Object.entries(PAGE_PATHS).find(([, path]) => path === clean);
  return entry?.[0] || "landing";
}

function pageToPath(page) {
  return PAGE_PATHS[page] || "/";
}

export default function App() {
  const { data: session, isPending } = authClient.useSession();
  const online = useOnlineStatus();
  const [page, setPage] = useState(() =>
    typeof window !== "undefined" ? pathToPage(window.location.pathname) : "landing",
  );
  const [user, setUser] = useState(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const neonUser = session?.user;
  const isAuthed = !!neonUser?.id || (!!user?.id && !online);

  const { data: categories = [] } = trpc.category.list.useQuery(undefined, {
    enabled: isAuthed,
    retry: online ? 1 : 0,
  });
  const { data: profile } = trpc.user.me.useQuery(undefined, {
    enabled: !!neonUser?.id,
    retry: online ? 1 : 0,
  });

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [page]);

  useEffect(() => {
    const onPop = () => setPage(pathToPage(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Restore last-known user when offline so the dashboard can mount with cached data.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const snap = await getLastUser();
      if (cancelled) return;
      if (!navigator.onLine && snap && !session?.user) {
        setUser(snap);
        setPage(p => (p === "landing" || p === "login" || p === "signup" ? "dashboard" : p));
      }
      setOfflineReady(true);
    })();
    return () => { cancelled = true; };
  }, [session?.user]);

  useEffect(() => {
    if (isPending && online) return;
    if (neonUser) {
      const next = {
        id: neonUser.id,
        name: profile?.name || neonUser.name || neonUser.email?.split("@")[0] || "User",
        email: profile?.email || neonUser.email || "",
        avatar: profile?.avatarUrl || neonUser.image || null,
        plan: profile?.plan || "free",
        joinedAt: profile?.createdAt
          ? (profile.createdAt instanceof Date ? profile.createdAt.toISOString() : String(profile.createdAt))
          : new Date().toISOString(),
      };
      setUser(next);
      void setLastUser(next);
      setPage(p => {
        if (p !== "landing" && p !== "login" && p !== "signup") return p;
        const nextPath = new URLSearchParams(window.location.search).get("next");
        if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
          window.location.href = nextPath;
          return p;
        }
        return "dashboard";
      });
    } else if (online && offlineReady) {
      setUser(null);
    }
  }, [neonUser, profile, isPending, online, offlineReady]);

  const navigate = p => {
    setPage(p);
    const path = pageToPath(p);
    const keepSearch = p === "login" || p === "signup" ? window.location.search : "";
    if (window.location.pathname !== path || (!keepSearch && window.location.search)) {
      window.history.pushState({}, "", path + keepSearch);
    }
  };

  useEffect(() => {
    if (!online || isPending) return;
    if ((page === "dashboard" || page === "profile") && !user && !neonUser) {
      navigate("login");
    }
  }, [page, user, neonUser, isPending, online]);

  const logout = async () => {
    await clearLastUser();
    if (online) await authClient.signOut();
    setUser(null);
    navigate("landing");
  };

  const appStats = {
    cats: categories.length,
    bms: categories.reduce((a,c) => a + c.bookmarks.length, 0),
    pinned: categories.reduce((a,c) => a + c.bookmarks.filter(b=>b.pinned).length, 0),
    tags: [...new Set(categories.flatMap(c=>[...(c.tags||[]),...c.bookmarks.flatMap(b=>b.tags||[])]))].length,
  };

  if ((isPending && online) || (!offlineReady && !neonUser)) {
    return (
      <div style={{ minHeight:"100vh", background:T.bg, color:T.textMuted, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.font, fontSize:14, fontWeight:600 }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <style>{`
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
        @keyframes mmShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes mmPulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.1)}}
      `}</style>
      <PageTransition pageKey={page}>
        {page === "landing" && <ErrorBoundary fallbackTitle="Page error" fallbackMessage="The landing page encountered an error."><LandingPage onNavigate={navigate} /></ErrorBoundary>}
        {page === "pricing" && <ErrorBoundary fallbackTitle="Page error" fallbackMessage="The pricing page encountered an error."><PricingPage onNavigate={navigate} /></ErrorBoundary>}
        {page === "newtab" && <ErrorBoundary fallbackTitle="Page error" fallbackMessage="The new tab page encountered an error."><NewTabPage onNavigate={navigate} categories={categories} /></ErrorBoundary>}
        {page === "login" && <ErrorBoundary fallbackTitle="Auth error" fallbackMessage="The login form encountered an error."><AuthPage mode="login" onNavigate={navigate} /></ErrorBoundary>}
        {page === "signup" && <ErrorBoundary fallbackTitle="Auth error" fallbackMessage="The signup form encountered an error."><AuthPage mode="signup" onNavigate={navigate} /></ErrorBoundary>}
        {page === "profile" && user && <ErrorBoundary fallbackTitle="Profile error" fallbackMessage="The profile page encountered an error."><ProfilePage user={user} onUpdate={setUser} onNavigate={navigate} onLogout={logout} stats={appStats} /></ErrorBoundary>}
        {page === "dashboard" && user && <ErrorBoundary fallbackTitle="Dashboard error" fallbackMessage="The dashboard encountered an error. Your data is safe."><Dashboard user={user} onNavigate={navigate} onLogout={logout} /></ErrorBoundary>}
      </PageTransition>
    </>
  );
}
