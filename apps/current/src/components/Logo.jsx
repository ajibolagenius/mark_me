import { T } from '../constants/tokens';

export function Logo({ size = 28 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
      <div style={{ width:size, height:size, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*0.55, filter:"brightness(2)" }}>🔖</span>
      </div>
      <span style={{ fontWeight:800, fontSize:size*0.6, letterSpacing:"-0.04em", fontFamily:T.font }}>mark<span style={{ color:T.primary }}>_</span>me</span>
    </div>
  );
}
