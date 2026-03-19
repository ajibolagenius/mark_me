import { useState } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from '../components/Icons';
import { Atmosphere } from '../components/Atmosphere';
import { Logo } from '../components/Logo';
import { SkipLink } from '../components/SkipLink';
import { Field } from '../components/Field';
import { AnimCount } from '../components/AnimCount';
import { useUndoToast } from '../hooks/useUndoToast';

export function ProfilePage({ user, onUpdate, onNavigate, onLogout, stats }) {
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
