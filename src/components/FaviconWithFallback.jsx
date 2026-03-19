import { useState } from 'react';
import { T, TAG_COLORS } from '../constants/tokens';
import { getDomain, getFavicon } from '../utils/helpers';

export function FaviconWithFallback({ url, title, size = 20 }) {
  const [state, setState] = useState("loading");
  const letter = (title || getDomain(url) || "?")[0].toUpperCase();
  const hash = (title || "").split("").reduce((a,c) => a + c.charCodeAt(0), 0);
  const color = TAG_COLORS[hash % TAG_COLORS.length];

  return (
    <div style={{ width:size, height:size, flexShrink:0, position:"relative", marginTop:2 }}>
      {state === "loading" && (
        <div aria-hidden="true" style={{ position:"absolute", inset:0, background:`linear-gradient(90deg, ${T.bgInput} 25%, rgba(255,255,255,0.06) 50%, ${T.bgInput} 75%)`, backgroundSize:"200% 100%", animation:"mmShimmer 1.2s ease infinite" }} />
      )}
      {state === "error" && (
        <div aria-hidden="true" style={{
          width:size, height:size, background:color+"25", border:`1px solid ${color}40`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:size*0.5, fontWeight:800, color, fontFamily:T.font, lineHeight:1,
        }}>{letter}</div>
      )}
      {state !== "error" && (
        <img src={getFavicon(url)} alt="" width={size} height={size}
          style={{ opacity:state==="loaded"?1:0, transition:"opacity 0.2s", display:"block" }}
          onLoad={()=>setState("loaded")} onError={()=>setState("error")} />
      )}
    </div>
  );
}
