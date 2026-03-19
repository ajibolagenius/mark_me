import { useState, useEffect } from 'react';
import { T, ACCENTS } from '../../constants/tokens';
import { S } from '../../constants/styles';
import { Modal } from '../../components/Modal';
import { Field } from '../../components/Field';
import { Tag } from '../../components/Tag';
import { uid } from '../../utils/helpers';

export function CategoryModal({ open, onClose, onSave, cat }) {
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
