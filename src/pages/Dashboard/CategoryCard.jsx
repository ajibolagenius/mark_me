import React, { useState } from 'react';
import { T, ACCENTS } from '../../constants/tokens';
import { S } from '../../constants/styles';
import { I } from '../../components/Icons';
import { Highlight } from '../../components/Highlight';
import { Tag } from '../../components/Tag';
import { AnimatedCollapse } from '../../components/AnimatedCollapse';
import { SwipeRow } from '../../components/SwipeRow';
import { BookmarkRow } from './BookmarkRow';
import { BookmarkModal } from './BookmarkModal';
import { useIsMobile } from '../../hooks/useIsMobile';
import { uid } from '../../utils/helpers';

export const CategoryCard = React.memo(function CategoryCard({ cat, onUpdate, onDelete, onEdit, onDeleteBm, allTags, searchQuery }) {
  const [exp,setExp]=useState(true); const [addBm,setAddBm]=useState(false); const [editBm,setEditBm]=useState(null);
  const ac=ACCENTS[cat.color]||ACCENTS[0]; const sorted=[...cat.bookmarks].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
  const isMobile = useIsMobile();
  const q = searchQuery || "";
  const isEmpty = cat.bookmarks.length === 0;
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
        {isEmpty ? (
          <div style={{ padding:"24px 18px", textAlign:"center" }}>
            <div style={{ width:48, height:48, margin:"0 auto 10px", background:ac.bg+"12", border:`1px solid ${ac.bg}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <I.BookmarkSm />
              <span style={{ position:"absolute", color:ac.bg, opacity:0.5, fontSize:18 }}>+</span>
            </div>
            <p style={{ fontSize:12, fontWeight:600, color:T.textSec, marginBottom:4, fontFamily:T.font }}>No bookmarks yet</p>
            <p style={{ fontSize:11, color:T.textMuted, marginBottom:12, fontFamily:T.font }}>Save your first link to this collection</p>
            <button onClick={()=>setAddBm(true)} style={{ ...S.btn, background:ac.bg+"18", color:ac.bg, padding:"7px 16px", fontSize:12, fontWeight:700, border:`1px solid ${ac.bg}30` }}
              onMouseEnter={e=>{e.currentTarget.style.background=ac.bg+"30"}} onMouseLeave={e=>{e.currentTarget.style.background=ac.bg+"18"}}><I.Plus /> Add Bookmark</button>
          </div>
        ) : (<>
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
        </>)}
        </div>
      </AnimatedCollapse>
      <BookmarkModal open={addBm} onClose={()=>setAddBm(false)} accent={cat.color} onSave={bm=>{onUpdate({...cat,bookmarks:[...cat.bookmarks,{...bm,id:uid(),addedAt:Date.now()}]});setAddBm(false)}} allTags={allTags} />
      <BookmarkModal open={!!editBm} onClose={()=>setEditBm(null)} bm={editBm} accent={cat.color} onSave={bm=>{onUpdate({...cat,bookmarks:cat.bookmarks.map(b=>b.id===bm.id?bm:b)});setEditBm(null)}} allTags={allTags} />
    </article>
  );
});
