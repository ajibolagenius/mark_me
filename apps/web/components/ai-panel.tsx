"use client";

import type { Category } from "@markme/ui";
import { useFocusTrap } from "@markme/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

export function AiPanel({ open, onClose }: AiPanelProps) {
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
  const abortRef = useRef<AbortController | null>(null);

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

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    const ac = new AbortController();
    abortRef.current = ac;

    // Add placeholder for streaming AI text
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "ai", text: err.error ?? `Error ${res.status}` },
        ]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (raw === "[DONE]") break;
          try {
            const evt = JSON.parse(raw) as { text?: string; error?: string };
            if (evt.error) {
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "ai", text: evt.error ?? "Error" },
              ]);
              break;
            }
            if (evt.text) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "ai") {
                  return [
                    ...prev.slice(0, -1),
                    { role: "ai", text: last.text + evt.text },
                  ];
                }
                return [...prev, { role: "ai", text: evt.text ?? "" }];
              });
            }
          } catch {
            /* skip malformed event */
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading]);

  // Cancel in-flight request when panel closes
  useEffect(() => {
    if (!open) abortRef.current?.abort();
  }, [open]);

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
                <div className="text-sm font-extrabold tracking-tight">AI Assistant</div>
                <div className="text-[10px] text-mm-text-muted">Powered by Claude</div>
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
                // biome-ignore lint/suspicious/noArrayIndexKey: static ordered message list
                key={i}
                className={`flex gap-2 ${
                  m.role === "user" ? "flex-row-reverse items-end" : "items-start"
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
                  {/* blinking cursor on active AI stream */}
                  {m.role === "ai" && loading && i === messages.length - 1 && (
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-mm-primary align-middle" />
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "ai" && (
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-linear-to-br from-mm-primary to-mm-secondary">
                  <Sparkles size={10} className="text-white" />
                </div>
                <div className="flex gap-1 border border-mm-border bg-mm-bg-panel px-4 py-3">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="h-1.5 w-1.5 rounded-full bg-mm-primary opacity-50"
                      style={{ animation: `pulse 1s ease ${idx * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-wrap gap-1 px-[18px] pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
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
                    void sendMessage();
                  }
                }}
                placeholder="Ask about your bookmarks…"
                aria-label="AI message input"
                className="flex-1 border border-mm-border bg-[#111113] px-3.5 py-2.5 font-sans text-sm text-mm-text outline-none focus:border-mm-primary"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center p-0 transition-all duration-150 ${
                  input.trim() ? "bg-mm-primary text-white" : "bg-mm-bg-input text-mm-text-muted"
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
