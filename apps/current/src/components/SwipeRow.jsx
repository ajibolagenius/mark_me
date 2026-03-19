import { useState, useRef } from 'react';
import { T } from '../constants/tokens';
import { I } from './Icons';

export function SwipeRow({ onSwipeDelete, children }) {
  const rowRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const [offset, setOffset] = useState(0);
  const [showBg, setShowBg] = useState(false);
  const THRESHOLD = 90;

  const onTouchStart = e => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = 0;
    swiping.current = false;
  };

  const onTouchMove = e => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    if (!swiping.current && Math.abs(dy) > Math.abs(dx)) return;
    if (dx < -10) swiping.current = true;
    if (!swiping.current) return;
    e.preventDefault();
    const clamped = Math.max(Math.min(dx, 0), -160);
    currentX.current = clamped;
    setOffset(clamped);
    setShowBg(clamped < -20);
  };

  const onTouchEnd = () => {
    if (currentX.current < -THRESHOLD) {
      setOffset(-160);
      setTimeout(() => {
        onSwipeDelete();
        setOffset(0);
        setShowBg(false);
      }, 200);
    } else {
      setOffset(0);
      setShowBg(false);
    }
    swiping.current = false;
  };

  return (
    <div style={{ position:"relative", overflow:"hidden" }}>
      <div style={{
        position:"absolute", inset:0, background:T.error,
        display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:20,
        opacity:showBg ? 1 : 0, transition:"opacity 0.15s",
      }}>
        <div style={{ color:"#fff", display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, fontFamily:T.font }}>
          <I.Trash /> Delete
        </div>
      </div>
      <div ref={rowRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform:`translateX(${offset}px)`,
          transition: offset === 0 || offset === -160 ? "transform 0.25s cubic-bezier(0.4,0,0.2,1)" : "none",
          position:"relative", zIndex:1, background:T.bgEl,
        }}>
        {children}
      </div>
    </div>
  );
}
