import { useState, useEffect, useRef } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';
import { I } from '../components/Icons';
import { useFocusTrap } from '../hooks/useFocusTrap';

export function AiPanel({ open, onClose, categories }) {
  const trapRef = useFocusTrap(open);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role:"ai", text:"Hi! I'm your bookmark AI assistant. I can help you auto-tag bookmarks, summarize categories, find duplicates, or discover connections. Try asking me something!" },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const buildContext = () => {
    return categories.map(c =>
      `Category "${c.name}" (${c.icon}, tags: ${c.tags?.join(", ")||"none"}):\n` +
      c.bookmarks.map(b => `  - "${b.title}" ${b.url} [tags: ${b.tags?.join(", ")||"none"}]${b.pinned?" (pinned)":""}${b.note?` note: ${b.note}`:""}`).join("\n")
    ).join("\n\n");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role:"user", text:userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the AI assistant for mark_me, a bookmark manager app. The user has the following bookmarks:\n\n${buildContext()}\n\nHelp the user organize, tag, summarize, and discover insights about their bookmarks. Be concise and helpful. When suggesting tags, format them as comma-separated lowercase words. When summarizing, be brief (2-3 sentences max). If asked to find duplicates or suggest reorganization, analyze the data and give specific actionable suggestions.`,
          messages: [{ role:"user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const aiText = data.content?.map(c => c.text || "").join("") || "Sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role:"ai", text:aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role:"ai", text:"Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  if (!open) return null;

  const suggestions = [
    "Suggest tags for all my bookmarks",
    "Summarize my Dev Tools category",
    "Find duplicate or similar bookmarks",
    "Which categories should I reorganize?",
  ];

  return (
    <div ref={trapRef} role="dialog" aria-modal="true" aria-label="AI Assistant" style={{
      position:"fixed", top:0, right:0, bottom:0, width:380, maxWidth:"100vw", zIndex:800,
      background:T.bgEl, borderLeft:`1px solid ${T.border}`, display:"flex", flexDirection:"column",
      animation:"mmSlideLeft .25s cubic-bezier(0.32,0.72,0,1)", boxShadow:"-8px 0 32px rgba(0,0,0,0.3)",
    }}>
      {/* Header */}
      <div style={{ padding:"16px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <I.Sparkle />
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>AI Assistant</div>
            <div style={{ fontSize:10, color:T.textMuted }}>Powered by Claude</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close AI panel" style={{ ...S.btn, background:T.bgInput, width:32, height:32, padding:0, color:T.textMuted, border:`1px solid ${T.border}` }}><I.X /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((m,i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:m.role==="user"?"flex-end":"flex-start", flexDirection:m.role==="user"?"row-reverse":"row" }}>
            <div style={{
              width:24, height:24, flexShrink:0,
              background:m.role==="ai" ? `linear-gradient(135deg, ${T.primary}, ${T.secondary})` : T.bgInput,
              border:m.role==="user" ? `1px solid ${T.border}` : "none",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff",
            }}>{m.role==="ai" ? <I.Sparkle /> : "U"}</div>
            <div style={{
              maxWidth:"85%", padding:"10px 14px", fontSize:13, lineHeight:1.6, color:T.text, fontFamily:T.font,
              background:m.role==="ai" ? T.bgPanel : T.primary+"18",
              border:m.role==="ai" ? `1px solid ${T.border}` : `1px solid ${T.primary}30`,
              whiteSpace:"pre-wrap", wordBreak:"break-word",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <div style={{ width:24, height:24, flexShrink:0, background:`linear-gradient(135deg, ${T.primary}, ${T.secondary})`, display:"flex", alignItems:"center", justifyContent:"center" }}><I.Sparkle /></div>
            <div style={{ padding:"12px 16px", background:T.bgPanel, border:`1px solid ${T.border}`, display:"flex", gap:4 }}>
              {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, background:T.primary, borderRadius:"50%", opacity:0.5, animation:`mmPulse 1s ease ${i*0.15}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && !loading && (
        <div style={{ padding:"0 18px 8px", display:"flex", flexWrap:"wrap", gap:4 }}>
          {suggestions.map((s,i) => (
            <button key={i} onClick={()=>{setInput(s);}} style={{
              ...S.btn, padding:"4px 10px", fontSize:10, fontWeight:600, background:T.primarySubtle, color:T.primary, border:`1px solid ${T.primary}25`, textAlign:"left",
            }}
              onMouseEnter={e=>e.currentTarget.style.background=T.primary+"25"} onMouseLeave={e=>e.currentTarget.style.background=T.primarySubtle}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"12px 18px", borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}}}
            placeholder="Ask about your bookmarks…" aria-label="AI message input"
            style={{ ...S.input, flex:1, padding:"10px 14px" }} />
          <button onClick={sendMessage} disabled={loading||!input.trim()} aria-label="Send message"
            style={{ ...S.btn, width:40, height:40, padding:0, background:input.trim()?T.primary:T.bgInput, color:input.trim()?"#fff":T.textMuted, flexShrink:0, transition:"all 0.15s" }}>
            <I.Send />
          </button>
        </div>
      </div>
    </div>
  );
}
