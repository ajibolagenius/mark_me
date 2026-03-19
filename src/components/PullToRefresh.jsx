import { useState, useRef } from 'react';
import { T } from '../constants/tokens';

export function PullToRefresh({ onRefresh, children }) {
  const containerRef = useRef(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const PULL_THRESHOLD = 70;

  const onTouchStart = e => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const onTouchMove = e => {
    if (!pulling.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy < 0) { pulling.current = false; setPullDist(0); return; }
    const dampened = Math.min(dy * 0.45, 120);
    setPullDist(dampened);
  };

  const onTouchEnd = () => {
    if (pullDist >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDist(50);
      onRefresh();
      setTimeout(() => {
        setRefreshing(false);
        setPullDist(0);
      }, 800);
    } else {
      setPullDist(0);
    }
    pulling.current = false;
  };

  const ready = pullDist >= PULL_THRESHOLD;

  return (
    <div ref={containerRef}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ position:"relative" }}>
      <div aria-hidden="true" style={{
        height: pullDist, overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition: pulling.current ? "none" : "height 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {pullDist > 10 && (
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            opacity: Math.min(pullDist / 50, 1),
            transform: `rotate(${refreshing ? 360 : ready ? 180 : (pullDist / PULL_THRESHOLD) * 180}deg)`,
            transition: refreshing ? "transform 0.5s linear" : pulling.current ? "none" : "transform 0.2s ease",
            animation: refreshing ? "mmSpin 0.6s linear infinite" : "none",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ready || refreshing ? T.primary : T.textMuted} strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </div>
        )}
        {pullDist > 10 && !refreshing && (
          <span style={{ position:"absolute", fontSize:10, fontWeight:600, color:ready ? T.primary : T.textMuted, fontFamily:T.font, marginTop:30 }}>
            {ready ? "Release to refresh" : "Pull to refresh"}
          </span>
        )}
        {refreshing && (
          <span style={{ position:"absolute", fontSize:10, fontWeight:600, color:T.primary, fontFamily:T.font, marginTop:30 }}>Refreshing…</span>
        )}
      </div>
      {children}
    </div>
  );
}
