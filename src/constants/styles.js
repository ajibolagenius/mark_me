import { T } from './tokens';

export const S = {
  btn: { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:T.font, fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)", border:"none", borderRadius:0, textDecoration:"none" },
  input: { width:"100%", padding:"12px 14px", background:T.bgInput, border:`1px solid ${T.border}`, borderRadius:0, color:T.text, fontSize:14, fontFamily:T.font, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" },
};
