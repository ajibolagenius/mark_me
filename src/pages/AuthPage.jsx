import { useState } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { MOCK_USERS } from '../constants/data';
import { I } from '../components/Icons';
import { Atmosphere } from '../components/Atmosphere';
import { Logo } from '../components/Logo';
import { SkipLink } from '../components/SkipLink';
import { Field } from '../components/Field';

export function AuthPage({ mode, onNavigate, onLogin }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState(isLogin ? "demo@markme.io" : "");
  const [pass, setPass] = useState(isLogin ? "mark_me1" : "");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const submit = e => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (pass.length < 6) { setError("Password must be 6+ characters"); return; }
    if (!isLogin && !name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setTimeout(() => {
      if (isLogin) {
        const mock = MOCK_USERS[email.toLowerCase()];
        if (mock && mock.password === pass) {
          onLogin({ name:mock.name, email, avatar:null, plan:mock.plan, joinedAt:mock.joinedAt });
        } else if (mock) {
          setError("Incorrect password"); setLoading(false); return;
        } else {
          onLogin({ name:email.split("@")[0], email, avatar:null, plan:"free", joinedAt:new Date().toISOString() });
        }
      } else {
        onLogin({ name:name||email.split("@")[0], email, avatar:null, plan:"free", joinedAt:new Date().toISOString() });
      }
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
            {isLogin && (
              <div style={{ background:T.secondarySubtle, border:`1px solid ${T.secondary}30`, padding:"12px 14px", marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.secondary, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:8, display:"flex", alignItems:"center", gap:5 }}>
                  <I.Zap /> Demo credentials
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {Object.entries(MOCK_USERS).map(([em,u])=>(
                    <button type="button" key={em} onClick={()=>{setEmail(em);setPass(u.password);setError("")}}
                      style={{ ...S.btn, padding:"8px 10px", background:T.bgInput, border:`1px solid ${T.border}`, justifyContent:"flex-start", textAlign:"left", flexDirection:"column", alignItems:"flex-start", gap:2 }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.secondary+"60"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border}}>
                      <span style={{ fontSize:11, fontWeight:700, color:T.text }}>{u.name}</span>
                      <span style={{ fontSize:10, color:T.textMuted, fontFamily:"monospace" }}>{em}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:u.plan==="pro"?T.primary:T.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:1 }}>{u.plan} plan</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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

          {/* Social auth */}
          <button onClick={()=>{setGLoading(true);setTimeout(()=>setGLoading(false),2000)}} disabled={gLoading}
            style={{ ...S.btn, width:"100%", padding:"12px", background:T.bgInput, color:gLoading?T.textMuted:T.textSec, border:`1px solid ${T.border}`, fontSize:13, opacity:gLoading?0.7:1, transition:"all 0.2s" }}
            onMouseEnter={e=>{if(!gLoading){e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.color=T.text}}} onMouseLeave={e=>{if(!gLoading){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textSec}}}>
            {gLoading
              ? <div style={{ width:16, height:16, border:`2px solid ${T.textMuted}`, borderTopColor:"transparent", borderRadius:"50%", animation:"mmSpin 0.5s linear infinite" }} />
              : <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
            {gLoading ? "Connecting..." : "Continue with Google"}
          </button>

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
