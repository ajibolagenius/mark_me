import { useState, useEffect } from 'react';
import { T, ACCENTS } from '../../constants/tokens';
import { S } from '../../constants/styles';
import { I } from '../../components/Icons';
import { Modal } from '../../components/Modal';
import { Field } from '../../components/Field';
import { Tag } from '../../components/Tag';

export function BookmarkModal({ open, onClose, onSave, bm, allTags, accent }) {
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
