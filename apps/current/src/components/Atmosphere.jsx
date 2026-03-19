import { T } from '../constants/tokens';

export function Atmosphere() {
  return (
    <>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.025, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      <div style={{ position:"fixed", top:-100, left:-100, width:300, height:300, borderRadius:"50%", background:T.primary, filter:"blur(120px)", opacity:0.06, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-80, right:-80, width:250, height:250, borderRadius:"50%", background:T.secondary, filter:"blur(100px)", opacity:0.05, pointerEvents:"none" }} />
    </>
  );
}
