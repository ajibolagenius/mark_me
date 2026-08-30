"use client";

import type { AuthState } from "@/lib/storage";
import { clearAuth, getPrefs, setPrefs } from "@/lib/storage";
import { trpcReact } from "@/lib/trpc";
import { safeHttpUrl } from "@/lib/urls";
import { FaviconWithFallback, Logo, getDomain } from "@markme/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookmarkCheck,
  ChevronDown,
  ExternalLink,
  FolderPlus,
  Loader2,
  LogOut,
  Plus,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getWebAppUrl } from "../lib/hooks";
import { enqueueOffline } from "../lib/storage";

interface TabInfo {
  url: string;
  title: string;
  favIconUrl?: string;
}

interface PopupProps {
  auth: AuthState | null;
}

function ConnectScreen() {
  const webAppUrl = getWebAppUrl();

  function handleConnect() {
    const extId = chrome.runtime.id;
    chrome.tabs.create({ url: `${webAppUrl}/extension-auth?ext=${extId}` });
    window.close();
  }

  return (
    <div className="flex w-[300px] flex-col items-center gap-5 bg-mm-bg px-5 py-8">
      <Logo size={32} />
      <div className="text-center">
        <p className="text-[14px] font-semibold text-mm-text">Connect your account</p>
        <p className="mt-1 text-[12px] leading-relaxed text-mm-text-muted">
          Sign in to start saving bookmarks from any page.
        </p>
      </div>
      <button
        type="button"
        onClick={handleConnect}
        className="w-full bg-mm-primary px-4 py-2.5 text-[13px] font-bold text-mm-on-primary shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0_rgba(0,0,0,0.5)] active:translate-y-0"
      >
        Connect to mark_me →
      </button>
      <p className="text-[11px] text-mm-text-muted">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => chrome.tabs.create({ url: `${webAppUrl}/signup` })}
          className="cursor-pointer border-none bg-transparent p-0 font-semibold text-mm-primary underline"
        >
          Sign up free
        </button>
      </p>
    </div>
  );
}

function TagInput({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const trimmed = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !tags.includes(trimmed)) onAdd(trimmed);
    setValue("");
  }

  return (
    <div
      className="flex min-h-[36px] flex-wrap items-center gap-1.5 border border-mm-border bg-mm-bg-input px-2.5 py-1.5 focus-within:border-mm-primary/50"
      onClick={() => inputRef.current?.focus()}
      onKeyDown={(e) => {
        if (e.key === "Enter") inputRef.current?.focus();
      }}
    >
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-0.5 bg-mm-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-mm-primary"
        >
          {t}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(t);
            }}
            className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-mm-primary/60 hover:text-mm-primary"
            aria-label={`Remove tag ${t}`}
          >
            <X size={8} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !value && tags.length > 0) {
            const last = tags[tags.length - 1];
            if (last) onRemove(last);
          }
        }}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="min-w-[60px] flex-1 border-none bg-transparent text-[11px] text-mm-text outline-none placeholder:text-mm-text-muted"
      />
    </div>
  );
}

function SaveForm({ tabInfo }: { tabInfo: TabInfo }) {
  const webAppUrl = getWebAppUrl();
  const { data: categories = [], isLoading: loadingCats } = trpcReact.category.list.useQuery();
  const createBookmark = trpcReact.bookmark.create.useMutation();

  const [activeTab, setActiveTab] = useState<"save" | "recent">("save");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "offline" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showCatDrop, setShowCatDrop] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    void getPrefs().then((prefs) => {
      if (prefs.lastCategoryId) setCategoryId(prefs.lastCategoryId);
      setPrefsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!prefsReady || categories.length === 0) return;
    if (categoryId && categories.some((c) => c.id === categoryId)) return;
    setCategoryId(categories[0]?.id ?? "");
  }, [categories, categoryId, prefsReady]);

  const selectedCat = categories.find((c) => c.id === categoryId);

  const suggestedTags = useMemo(() => {
    const titleWords = (tabInfo.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["the", "and", "for", "with", "you", "that", "this", "from", "how", "what", "why", "com", "net", "org"].includes(w));
    const domain = getDomain(tabInfo.url).replace(/\..*$/, "");
    const raw = [domain, ...titleWords].slice(0, 6);
    return [...new Set(raw)].filter((t) => t && !tags.includes(t));
  }, [tabInfo, tags]);

  const recentBookmarks = useMemo(() => {
    return categories
      .flatMap((c) => (c.bookmarks ?? []).map((b) => ({ ...b, catName: c.name })))
      .sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))
      .slice(0, 5);
  }, [categories]);

  async function handleSave() {
    if (!categoryId) return;
    setStatus("saving");
    setErrorMsg("");

    try {
      await createBookmark.mutateAsync({
        categoryId,
        url: tabInfo.url,
        title: tabInfo.title,
        tags,
        note: notes,
        pinned: false,
        faviconUrl: safeHttpUrl(tabInfo.favIconUrl),
      });
      await setPrefs({ lastCategoryId: categoryId });
      setStatus("saved");
      setTimeout(() => window.close(), 1200);
    } catch (err) {
      const isOffline =
        !navigator.onLine || (err instanceof Error && err.message === "Failed to fetch");
      if (isOffline) {
        await enqueueOffline({
          id: crypto.randomUUID(),
          url: tabInfo.url,
          title: tabInfo.title,
          categoryId,
          tags,
          notes,
          savedAt: Date.now(),
        });
        setStatus("offline");
        setTimeout(() => window.close(), 1500);
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Save failed");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2500);
      }
    }
  }

  async function handleLogout() {
    await clearAuth();
  }

  if (status === "saved") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-[320px] flex-col items-center gap-3 bg-mm-bg px-5 py-8"
      >
        <div className="flex h-10 w-10 items-center justify-center bg-mm-success/10 text-mm-success">
          <BookmarkCheck size={22} />
        </div>
        <p className="text-[14px] font-bold text-mm-text">Saved to mark_me!</p>
        <p className="text-[12px] text-mm-text-muted">Closing…</p>
      </motion.div>
    );
  }

  if (status === "offline") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-[320px] flex-col items-center gap-3 bg-mm-bg px-5 py-8"
      >
        <div className="flex h-10 w-10 items-center justify-center bg-mm-warning/10 text-mm-warning">
          <WifiOff size={22} />
        </div>
        <p className="text-[14px] font-bold text-mm-text">Saved offline</p>
        <p className="text-center text-[12px] text-mm-text-muted">
          Will sync when you&apos;re back online.
        </p>
      </motion.div>
    );
  }

  if (!loadingCats && categories.length === 0) {
    return (
      <div className="flex w-[320px] flex-col bg-mm-bg">
        <div className="flex items-center justify-between border-b border-mm-border px-3 py-2.5">
          <Logo size={22} />
          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-1 text-[10px] text-mm-text-muted transition-colors hover:text-mm-error"
            aria-label="Disconnect account"
          >
            <LogOut size={11} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center border border-mm-primary/20 bg-mm-primary-subtle text-mm-primary">
            <FolderPlus size={20} />
          </div>
          <p className="text-[14px] font-bold text-mm-text">No categories yet</p>
          <p className="text-[12px] leading-relaxed text-mm-text-muted">
            Create a category in the web app, then come back to save.
          </p>
          <button
            type="button"
            onClick={() => {
              chrome.tabs.create({ url: `${webAppUrl}/dashboard` });
              window.close();
            }}
            className="mt-1 w-full bg-mm-primary px-4 py-2.5 text-[13px] font-bold text-mm-on-primary shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
          >
            Open dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[320px] flex-col bg-mm-bg">
      <div className="flex items-center justify-between border-b border-mm-border px-3 py-2">
        <Logo size={20} />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("save")}
            className={[
              "px-2 py-1 text-[11px] font-bold transition-colors",
              activeTab === "save"
                ? "bg-mm-primary/15 text-mm-primary"
                : "text-mm-text-muted hover:text-mm-text",
            ].join(" ")}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={[
              "px-2 py-1 text-[11px] font-bold transition-colors",
              activeTab === "recent"
                ? "bg-mm-primary/15 text-mm-primary"
                : "text-mm-text-muted hover:text-mm-text",
            ].join(" ")}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 flex cursor-pointer items-center gap-1 border-none bg-transparent p-1 text-[10px] text-mm-text-muted transition-colors hover:text-mm-error"
            title="Disconnect account"
            aria-label="Disconnect account"
          >
            <LogOut size={11} />
          </button>
        </div>
      </div>

      {activeTab === "recent" ? (
        <div className="flex flex-col p-2">
          {recentBookmarks.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-mm-text-muted">No recent bookmarks</p>
          ) : (
            <div className="flex flex-col divide-y divide-mm-border">
              {recentBookmarks.map((bm: { id: string; url: string; title: string; catName: string }) => (
                <div key={bm.id} className="flex items-center gap-2 py-2">
                  <FaviconWithFallback url={bm.url} title={bm.title} size={16} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-mm-text">{bm.title}</p>
                    <p className="truncate text-[9px] text-mm-text-muted">{getDomain(bm.url)} · {bm.catName}</p>
                  </div>
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-mm-text-muted hover:text-mm-text"
                  >
                    <ExternalLink size={11} />
                  </a>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              chrome.tabs.create({ url: `${webAppUrl}/dashboard` });
              window.close();
            }}
            className="mt-2 w-full border border-mm-border bg-mm-bg-input py-1.5 text-center text-[11px] font-bold text-mm-text transition-colors hover:border-mm-primary/50"
          >
            Open Dashboard →
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2.5 border-b border-mm-border bg-mm-bg-el px-3 py-2.5">
            <FaviconWithFallback url={tabInfo.url} title={tabInfo.title} size={18} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-mm-text">{tabInfo.title}</p>
              <p className="truncate text-[10px] text-mm-text-muted">{getDomain(tabInfo.url)}</p>
            </div>
            <a
              href={tabInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-mm-text-muted hover:text-mm-text"
              aria-label="Open URL"
            >
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex flex-col gap-2.5 px-3 py-3">
            <div className="relative">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.05em] text-mm-text-muted">
                Category
              </p>
              <button
                type="button"
                onClick={() => setShowCatDrop((v) => !v)}
                disabled={loadingCats}
                className="flex w-full items-center justify-between border border-mm-border bg-mm-bg-input px-2.5 py-2 text-[12px] text-mm-text transition-colors hover:border-mm-primary/40 disabled:opacity-50"
              >
                <span className="flex items-center gap-1.5">
                  {selectedCat ? (
                    <>
                      <span>{selectedCat.icon}</span>
                      <span>{selectedCat.name}</span>
                    </>
                  ) : loadingCats ? (
                    <span className="text-mm-text-muted">Loading…</span>
                  ) : (
                    <span className="text-mm-text-muted">Select category</span>
                  )}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${showCatDrop ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {showCatDrop && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute left-0 top-full z-50 mt-0.5 max-h-[180px] w-full overflow-y-auto border border-mm-border bg-mm-bg-panel shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
                  >
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(c.id);
                          setShowCatDrop(false);
                        }}
                        className={[
                          "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-mm-bg-el",
                          c.id === categoryId ? "text-mm-primary" : "text-mm-text",
                        ].join(" ")}
                      >
                        <span>{c.icon}</span>
                        <span>{c.name}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-mm-text-muted">
                          {c.bookmarks?.length ?? 0}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.05em] text-mm-text-muted">
                Tags
              </p>
              <TagInput
                tags={tags}
                onAdd={(t) => setTags((prev) => [...prev, t])}
                onRemove={(t) => setTags((prev) => prev.filter((x) => x !== t))}
              />
              {suggestedTags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[9px] font-bold text-mm-text-muted">✨ Suggest:</span>
                  {suggestedTags.slice(0, 4).map((st: string) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTags((prev) => [...prev, st])}
                      className="cursor-pointer border border-mm-primary/30 bg-mm-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-mm-primary transition-colors hover:bg-mm-primary/25"
                    >
                      +{st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.05em] text-mm-text-muted">
                Notes
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional note…"
                className="w-full resize-none border border-mm-border bg-mm-bg-input px-2.5 py-1.5 text-[12px] text-mm-text outline-none transition-colors placeholder:text-mm-text-muted focus:border-mm-primary/50"
              />
            </div>
          </div>

          <div className="border-t border-mm-border px-3 pb-3 pt-2.5">
            {status === "error" && (
              <p className="mb-2 text-center text-[11px] text-mm-error">
                {errorMsg || "Save failed. Please try again."}
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!categoryId || status === "saving"}
              className="flex w-full items-center justify-center gap-2 bg-mm-primary px-4 py-2.5 text-[13px] font-bold text-mm-on-primary shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0_rgba(0,0,0,0.5)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
            >
              {status === "saving" ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Plus size={13} />
                  Save Bookmark
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Popup({ auth }: PopupProps) {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [tabError, setTabError] = useState(false);

  useEffect(() => {
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const tab = tabs[0];
        if (tab?.url && tab.title && safeHttpUrl(tab.url)) {
          setTabInfo({ url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl });
        } else {
          setTabError(true);
        }
      })
      .catch(() => setTabError(true));
  }, []);

  if (!auth) return <ConnectScreen />;

  if (tabError) {
    return (
      <div className="flex w-[300px] flex-col items-center gap-3 bg-mm-bg px-5 py-8 text-center">
        <p className="text-[13px] font-semibold text-mm-text">Can&apos;t read this tab</p>
        <p className="text-[12px] leading-relaxed text-mm-text-muted">
          Open a regular web page to save a bookmark.
        </p>
      </div>
    );
  }

  if (!tabInfo) {
    return (
      <div className="flex h-[180px] w-[300px] items-center justify-center bg-mm-bg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-mm-border border-t-mm-primary" />
      </div>
    );
  }

  return <SaveForm tabInfo={tabInfo} />;
}
