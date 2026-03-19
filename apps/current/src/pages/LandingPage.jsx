import { T, ACCENTS } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from '../components/Icons';
import { Atmosphere } from '../components/Atmosphere';
import { Logo } from '../components/Logo';
import { SkipLink } from '../components/SkipLink';

export function LandingPage({ onNavigate }) {
  const features = [
    { icon: <I.Grid />, title: "Masonry Grid", desc: "Visual bento layout that makes browsing your links feel intentional" },
    { icon: <I.Tag />, title: "Smart Tags", desc: "Color-coded pills to slice and filter your collection instantly" },
    { icon: <I.Bookmark />, title: "Pin & Organize", desc: "Pin your most-used links, group by category, drag to reorder" },
    { icon: <I.Chrome />, title: "Chrome Extension", desc: "One-click save from any page — auto-tagged, auto-categorized", soon: true },
    { icon: <I.Cloud />, title: "Cloud Sync", desc: "Firebase-backed storage keeps your bookmarks safe across devices", soon: true },
    { icon: <I.Layout />, title: "Bio Website", desc: "Generate a sleek link-in-bio page from your public bookmarks", soon: true },
    { icon: <I.Tab />, title: "New Tab Override", desc: "Replace Chrome's new tab with your bookmarks, clock, and quick search", isNew: true },
    { icon: <I.Sparkle />, title: "AI Assistant", desc: "Auto-tag, summarize, and discover connections across your bookmarks", isNew: true },
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
        <div className="mm-features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:T.border }}>
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

      {/* Footer */}
      <footer style={{ borderTop:`1px solid ${T.border}`, position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <Logo size={20} />
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {[{label:"Pricing",p:"pricing"},{label:"Extension",p:"newtab"}].map(l=>(
              <button key={l.p} onClick={()=>onNavigate(l.p)} style={{ ...S.btn, background:"transparent", color:T.textMuted, padding:0, fontSize:12 }}
                onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>{l.label}</button>
            ))}
            <span style={{ fontSize:12, color:T.textMuted }}>&copy; 2026 mark_me</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .mm-features-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 768px) {
          .mm-features-grid { grid-template-columns: 1fr !important; }
          .mm-landing-stats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
