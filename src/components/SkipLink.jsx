import { T } from '../constants/tokens';

export function SkipLink() {
  return (
    <a href="#main-content" style={{
      position:"absolute", top:-40, left:0, background:T.primary, color:"#fff",
      padding:"8px 16px", zIndex:9999, fontSize:13, fontWeight:700, fontFamily:T.font,
      transition:"top 0.2s", textDecoration:"none",
    }} onFocus={e=>e.currentTarget.style.top="0"} onBlur={e=>e.currentTarget.style.top="-40px"}>
      Skip to content
    </a>
  );
}
