"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import type { Category } from "@markme/ui";
import { useFocusTrap } from "@markme/ui";

interface AiPanelProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

interface Message {
  role: "ai" | "user";
  text: string;
}

const SUGGESTIONS = [
  "Suggest tags for all my bookmarks",
  "Summarize my Dev Tools category",
  "Find duplicate or similar bookmarks",
  "Which categories should I reorganize?",
];

export function AiPanel({ open, onClose, categories }: AiPanelProps) {
  const trapRef = useFocusTrap(open);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm your bookmark AI assistant. I can help you auto-tag bookmarks, summarize categories, find duplicates, or discover connections. Try asking me something!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const buildContext = () => {
    return categories
      .map(
        (c) =>
          `Category "${c.name}" (${c.icon}, tags: ${c.tags?.join(", ") || "none"}):\n` +
          c.bookmarks
            .map(
              (b) =>
                `  - "${b.title}" ${b.url} [tags: ${b.tags?.join(", ") || "none"}]${b.pinned ? " (pinned)" : ""}${b.note ? ` note: ${b.note}` : ""}`
            )
            .join("\n")
      )
      .join("\n\n");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the AI assistant for mark_me, a bookmark manager app. The user has the following bookmarks:\n\n${buildContext()}\n\nHelp the user organize, tag, summarize, and discover insights about their bookmarks. Be concise and helpful. When suggesting tags, format them as comma-separated lowercase words. When summarizing, be brief (2-3 sentences max). If asked to find duplicates or suggest reorganization, analyze the data and give specific actionable suggestions.`,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const aiText =
        data.content?.map((c: { text?: string }) => c.text || "").join("") ||
        "Sorry, I couldn't process that request.";
      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Connection error. Please try again." },
      ]);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-label="AI Assistant"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-y-0 right-0 z-800 flex w-[380px] max-w-full flex-col border-l border-mm-border bg-mm-bg-el shadow-[-8px_0_32px_rgba(0,0,0,0.3)]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-mm-border px-[18px] py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center bg-linear-to-br from-mm-primary to-mm-secondary">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight">
                  AI Assistant
                </div>
                <div className="text-[10px] text-mm-text-muted">
                  Powered by Claude
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI panel"
              className="flex h-8 w-8 cursor-pointer items-center justify-center border border-mm-border bg-mm-bg-input p-0 text-mm-text-muted hover:text-mm-text"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-[18px] py-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  m.role === "user"
                    ? "flex-row-reverse items-end"
                    : "items-start"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-extrabold text-white ${
                    m.role === "ai"
                      ? "bg-linear-to-br from-mm-primary to-mm-secondary"
                      : "border border-mm-border bg-mm-bg-input"
                  }`}
                >
                  {m.role === "ai" ? <Sparkles size={10} /> : "U"}
                </div>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap wrap-break-word px-3.5 py-2.5 font-sans text-[13px] leading-relaxed text-mm-text ${
                    m.role === "ai"
                      ? "border border-mm-border bg-mm-bg-panel"
                      : "border border-mm-primary/20 bg-mm-primary/9"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-linear-to-br from-mm-primary to-mm-secondary">
                  <Sparkles size={10} className="text-white" />
                </div>
                <div className="flex gap-1 border border-mm-border bg-mm-bg-panel px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-mm-primary opacity-50"
                      style={{
                        animation: `pulse 1s ease ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-wrap gap-1 px-[18px] pb-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(s)}
                  className="border border-mm-primary/15 bg-mm-primary-subtle px-2.5 py-1 text-left text-[10px] font-semibold text-mm-primary transition-colors hover:bg-mm-primary/15"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-mm-border px-[18px] py-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about your bookmarks…"
                aria-label="AI message input"
                className="flex-1 border border-mm-border bg-[#111113] px-3.5 py-2.5 font-sans text-sm text-mm-text outline-none focus:border-mm-primary"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center p-0 transition-all duration-150 ${
                  input.trim()
                    ? "bg-mm-primary text-white"
                    : "bg-mm-bg-input text-mm-text-muted"
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
