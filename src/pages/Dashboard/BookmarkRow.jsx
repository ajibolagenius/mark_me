import { useState } from 'react';
import { T, ACCENTS } from '../../constants/tokens';
import { S } from '../../constants/styles';
import { I } from '../../components/Icons';
import { FaviconWithFallback } from '../../components/FaviconWithFallback';
import { LinkPreview } from '../../components/LinkPreview';
import { Highlight } from '../../components/Highlight';
import { Tag } from '../../components/Tag';
import { getDomain, timeAgo } from '../../utils/helpers';

export function BookmarkRow({ bm, accent, onEdit, onDelete, onTogglePin, searchQuery }) {
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
