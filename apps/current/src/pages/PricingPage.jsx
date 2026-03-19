import { useState } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from '../components/Icons';
import { Atmosphere } from '../components/Atmosphere';
import { Logo } from '../components/Logo';
import { SkipLink } from '../components/SkipLink';
import { AnimatedCollapse } from '../components/AnimatedCollapse';

export function PricingPage({ onNavigate }) {
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
        <div className="mm-pricing-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:T.border, marginBottom:60 }}>
          {plans.map((p,i)=>(
            <div key={p.id} style={{
              background:T.bg, padding:"36px 28px", position:"relative", overflow:"hidden",
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
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24, position:"relative" }}>
                {p.features.map((f,fi)=>(
                  <div key={fi} style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:T.textSec }}>
                    <span style={{ color:p.color||T.success, display:"flex", flexShrink:0 }}><I.Check /></span> {f}
                  </div>
                ))}
              </div>
              <button onClick={p.action} style={{
                ...S.btn, width:"100%", padding:"12px", fontSize:14, fontWeight:800, position:"relative",
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
