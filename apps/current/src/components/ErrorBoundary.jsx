import React from 'react';
import { T } from '../constants/tokens';
import { I } from './Icons';

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(err, info) { console.error("ErrorBoundary caught:", err, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background:T.bgEl, border:`1px solid ${T.error}30`, padding:24, margin:16, fontFamily:T.font }}>
          <div style={{ height:3, background:T.error, marginBottom:16, marginTop:-24, marginLeft:-24, marginRight:-24 }} />
          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:36, height:36, background:T.error+"15", border:`1px solid ${T.error}30`, display:"flex", alignItems:"center", justifyContent:"center", color:T.error, flexShrink:0 }}>
              <I.Shield />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{ fontFamily:T.font, fontSize:14, fontWeight:800, color:T.text, letterSpacing:"-0.02em", margin:"0 0 6px" }}>
                {this.props.fallbackTitle || "Something went wrong"}
              </h3>
              <p style={{ fontSize:12, color:T.textMuted, lineHeight:1.5, margin:"0 0 12px" }}>
                {this.props.fallbackMessage || "This section encountered an error. Your data is safe."}
              </p>
              <div style={{ fontSize:11, color:T.error, background:T.error+"10", border:`1px solid ${T.error}20`, padding:"6px 10px", marginBottom:12, fontFamily:"monospace", maxHeight:60, overflow:"auto", whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                {this.state.error?.message || "Unknown error"}
              </div>
              <button onClick={() => this.setState({ error: null })}
                style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:T.font, fontWeight:700, fontSize:12, cursor:"pointer", border:"none", borderRadius:0, background:T.error, color:"#fff", padding:"7px 16px", boxShadow:"2px 2px 0 rgba(0,0,0,0.3)", transition:"all 0.2s" }}>
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
