import { useState, useEffect } from 'react';
import { T, ACCENTS } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from '../components/Icons';
import { Atmosphere } from '../components/Atmosphere';
import { FaviconWithFallback } from '../components/FaviconWithFallback';
import { Highlight } from '../components/Highlight';
import { getDomain, timeAgo } from '../utils/helpers';

export function NewTabPage({ onNavigate, categories }) {
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
        <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", background:T.primary+"20", color:T.primary, padding:"4px 10px", border:`1px solid ${T.primary}30`, fontFamily:T.font }}>
          <I.Chrome /> Extension Preview
        </span>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"80px 20px 60px", textAlign:"center", position:"relative", zIndex:1 }}>
        {/* Clock */}
        <div style={{ animation:"mmSlideUp .5s ease both" }}>
          <div style={{ fontSize:"clamp(4rem, 12vw, 7rem)", fontWeight:800, letterSpacing:"-0.06em", lineHeight:1, marginBottom:8, background:`linear-gradient(135deg, ${T.text}, ${T.textSec})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            {hours}<span style={{ opacity:0.4 }}>:</span>{mins}
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
