import type { AuthState } from "@/lib/storage";
import { clearAuth } from "@/lib/storage";
import { trpcReact } from "@/lib/trpc";
import { ACCENTS, FaviconWithFallback, Highlight, Logo, getDomain, timeAgo } from "@markme/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookmarkPlus,
  Check,
  Clock,
  Command,
  Copy,
  ExternalLink,
  Folder,
  Globe,
  LayoutDashboard,
  LogOut,
  Pin,
  PinOff,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getWebAppUrl } from "../lib/hooks";

interface NewTabProps {
  auth: AuthState | null | false;
}

type BmRow = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  note?: string | null;
  pinned: boolean;
  addedAt?: number | null;
  catId: string;
  catColor: number;
  catName: string;
  catIcon: string;
};

function Ambient() {
  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-[24%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mm-primary opacity-[0.07] blur-[160px]" />
      <div className="pointer-events-none fixed bottom-[10%] right-[10%] h-[340px] w-[340px] rounded-full bg-mm-secondary opacity-[0.05] blur-[130px]" />
      {/* Neo-brutalist subtle grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(var(--color-mm-text) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </>
  );
}

function TopBar({
  showDashboard,
  onDisconnect,
  stats,
}: {
  showDashboard?: boolean;
  onDisconnect?: () => void;
  stats?: { cats: number; bms: number; pinned: number };
}) {
  const webAppUrl = getWebAppUrl();
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
      <div className="pointer-events-auto flex items-center gap-3">
        <Logo size={24} />
        <span className="hidden items-center gap-1.5 border border-mm-primary/30 bg-mm-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-mm-primary sm:inline-flex">
          <Sparkles size={11} /> New Tab
        </span>
      </div>

      {stats && (
        <div className="pointer-events-auto hidden items-center gap-3 border border-mm-border bg-mm-bg-el/90 px-3 py-1.5 text-[11px] font-bold text-mm-text-muted backdrop-blur-md md:flex">
          <span className="text-mm-text">
            <strong className="text-mm-primary">{stats.bms}</strong> Bookmarks
          </span>
          <span className="text-mm-border">•</span>
          <span>
            <strong className="text-mm-secondary">{stats.cats}</strong> Categories
          </span>
          <span className="text-mm-border">•</span>
          <span>
            <strong className="text-mm-warning">{stats.pinned}</strong> Pinned
          </span>
        </div>
      )}

      <div className="pointer-events-auto flex items-center gap-2">
        {showDashboard && (
          <a
            href={`${webAppUrl}/dashboard`}
            className="inline-flex items-center gap-1.5 border border-mm-border bg-mm-bg-el/90 px-3.5 py-2 text-[12px] font-bold text-mm-text transition-all hover:-translate-y-px hover:border-mm-primary/50 hover:text-mm-primary hover:shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
          >
            <LayoutDashboard size={13} />
            <span>Dashboard</span>
          </a>
        )}
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            title="Disconnect account"
            aria-label="Disconnect"
            className="inline-flex cursor-pointer items-center border border-mm-border bg-mm-bg-el/90 p-2 text-mm-text-muted transition-colors hover:border-mm-error/40 hover:text-mm-error"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </header>
  );
}

function ConnectPrompt() {
  const webAppUrl = getWebAppUrl();

  return (
    <div className="relative flex h-full min-h-dvh items-center justify-center bg-mm-bg px-5">
      <Ambient />
      <TopBar />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[440px] border border-mm-border bg-mm-bg-el p-8 text-center shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
      >
        <Logo size={42} />
        <h1 className="mt-6 text-[22px] font-extrabold tracking-[-0.03em] text-mm-text">
          Welcome to mark_me
        </h1>
        <p className="mx-auto mt-2.5 max-w-[340px] text-[13px] leading-relaxed text-mm-text-sec">
          Connect your account to access your pinned shortcuts, fast category shelves, and smart search in every new tab.
        </p>
        <button
          type="button"
          onClick={() => {
            const extId = chrome.runtime.id;
            window.location.href = `${webAppUrl}/extension-auth?ext=${extId}`;
          }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-mm-primary px-6 py-3.5 text-[13px] font-extrabold text-mm-on-primary shadow-[3px_3px_0_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
        >
          Connect Account →
        </button>
      </motion.div>
    </div>
  );
}

function BookmarkGrid() {
  const webAppUrl = getWebAppUrl();
  const utils = trpcReact.useUtils();
  const { data: categories = [], isLoading } = trpcReact.category.list.useQuery(undefined, {
    staleTime: 30_000,
  });
  const togglePin = trpcReact.bookmark.togglePin.useMutation({
    onSuccess: () => void utils.category.list.invalidate(),
  });
  const deleteBm = trpcReact.bookmark.delete.useMutation({
    onSuccess: () => void utils.category.list.invalidate(),
  });

  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"recent" | "categories" | "tags">("recent");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Keyboard shortcut listener ('/' or 'Cmd+K' focuses search)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) &&
        document.activeElement !== searchInputRef.current
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === "Escape") {
        setSearch("");
        searchInputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const mins = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const greeting =
    time.getHours() < 12
      ? "Good morning"
      : time.getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  const allBm: BmRow[] = useMemo(
    () =>
      categories.flatMap((c) =>
        (c.bookmarks ?? []).map((b) => ({
          ...b,
          tags: b.tags ?? [],
          catId: c.id,
          catColor: c.color,
          catName: c.name,
          catIcon: c.icon,
        })),
      ),
    [categories],
  );

  const pinned = useMemo(() => allBm.filter((b) => b.pinned), [allBm]);
  const recent = useMemo(
    () => [...allBm].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)).slice(0, 15),
    [allBm],
  );

  const allTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of allBm) {
      for (const t of b.tags) {
        if (!t) continue;
        const norm = t.trim().toLowerCase();
        counts[norm] = (counts[norm] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [allBm]);

  const isEmpty = !isLoading && allBm.length === 0;

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allBm.filter((b) => {
      const hay = [b.title, b.url, b.catName, b.note ?? "", ...(b.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allBm, search]);

  const filteredList = useMemo(() => {
    let list = allBm;
    if (selectedCatId) {
      list = list.filter((b) => b.catId === selectedCatId);
    }
    if (selectedTag) {
      list = list.filter((b) => b.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));
    }
    return list.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
  }, [allBm, selectedCatId, selectedTag]);

  function handlePin(id: string) {
    togglePin.mutate({ id });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    deleteBm.mutate(
      { id },
      {
        onSettled: () => setConfirmDeleteId(null),
      },
    );
  }

  function handleCopy(b: BmRow) {
    void navigator.clipboard.writeText(b.url);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div className="relative h-full min-h-dvh bg-mm-bg font-sans text-mm-text selection:bg-mm-primary selection:text-mm-on-primary">
      <Ambient />
      <TopBar
        showDashboard
        onDisconnect={() => void clearAuth()}
        stats={{
          cats: categories.length,
          bms: allBm.length,
          pinned: pinned.length,
        }}
      />

      <main
        className={[
          "relative z-10 mx-auto flex w-full max-w-[840px] flex-col items-center px-4 sm:px-6",
          isEmpty || isLoading
            ? "min-h-dvh justify-center py-28"
            : "min-h-dvh justify-start pb-24 pt-[min(14vh,110px)]",
        ].join(" ")}
      >
        {/* Hero: Jumbo Neo-Brutalist Clock + Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full text-center"
        >
          <div className="inline-flex items-baseline font-sans text-[clamp(4rem,10vw,6.5rem)] font-extrabold leading-none tracking-[-0.06em] text-mm-text">
            <span>{hours}</span>
            <span className="mx-[0.04em] animate-pulse text-mm-primary">:</span>
            <span>{mins}</span>
            <span className="ml-2 text-[clamp(1.2rem,3vw,1.8rem)] font-semibold text-mm-text-muted">
              {seconds}
            </span>
          </div>
          <p className="mt-2 text-[14px] font-semibold text-mm-text-sec sm:text-[15px]">
            {greeting} · <span className="text-mm-text-muted">{dateStr}</span>
          </p>
        </motion.div>

        {/* Omnibar Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="relative mt-7 w-full max-w-[620px]"
        >
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-mm-text-muted">
              <Search size={16} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks by title, url, tags… (press / to focus)"
              aria-label="Search bookmarks"
              className="w-full border border-mm-border bg-mm-bg-el/90 py-3.5 pl-11 pr-20 text-[14px] font-medium text-mm-text outline-none backdrop-blur-md shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-all placeholder:text-mm-text-muted focus:border-mm-primary focus:shadow-[5px_5px_0_rgba(0,0,0,0.5)]"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="cursor-pointer border-none bg-transparent p-1 text-mm-text-muted hover:text-mm-text"
                >
                  <X size={14} />
                </button>
              ) : (
                <kbd className="hidden border border-mm-border bg-mm-bg-input px-1.5 py-0.5 text-[10px] font-bold text-mm-text-muted sm:inline-block">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Search Dropdown Overlay */}
          <AnimatePresence>
            {search && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-50 mt-1.5 max-h-[min(400px,45vh)] w-full overflow-y-auto border border-mm-border bg-mm-bg-panel text-left shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
              >
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <p className="text-[13px] font-semibold text-mm-text-muted">
                      No bookmarks found matching &quot;{search}&quot;
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(search)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 border border-mm-border bg-mm-bg-el px-3 py-1.5 text-[11px] font-bold text-mm-text hover:border-mm-primary/50"
                      >
                        <Globe size={11} /> Search on Google ↗
                      </a>
                      <a
                        href={`https://github.com/search?q=${encodeURIComponent(search)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 border border-mm-border bg-mm-bg-el px-3 py-1.5 text-[11px] font-bold text-mm-text hover:border-mm-primary/50"
                      >
                        Search on GitHub ↗
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="border-b border-mm-border bg-mm-bg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mm-text-muted">
                      {searchResults.length} Match{searchResults.length === 1 ? "" : "es"} Found
                    </div>
                    {searchResults.map((b) => {
                      const accent =
                        ACCENTS[b.catColor % ACCENTS.length] ??
                        ACCENTS[0] ?? { bg: "#D4FF4F", glow: "rgba(212,255,79,0.18)" };
                      return (
                        <div
                          key={b.id}
                          className="group flex items-center gap-3 border-b border-mm-border px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-mm-bg-el"
                        >
                          <a
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <FaviconWithFallback url={b.url} title={b.title} size={18} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-semibold text-mm-text transition-colors group-hover:text-mm-primary">
                                <Highlight text={b.title} query={search} />
                              </div>
                              <div className="truncate text-[11px] text-mm-text-muted">
                                <Highlight text={getDomain(b.url)} query={search} />
                              </div>
                            </div>
                            <span
                              className="hidden shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] sm:inline-block"
                              style={{
                                background: `${accent.bg}15`,
                                border: `1px solid ${accent.bg}25`,
                                color: accent.bg,
                              }}
                            >
                              {b.catName}
                            </span>
                          </a>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopy(b)}
                              title="Copy URL"
                              className="cursor-pointer border-none bg-transparent p-1.5 text-mm-text-muted hover:text-mm-text"
                            >
                              {copiedId === b.id ? (
                                <Check size={12} className="text-mm-success" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePin(b.id)}
                              title={b.pinned ? "Unpin" : "Pin"}
                              className="cursor-pointer border-none bg-transparent p-1.5 text-mm-text-muted hover:text-mm-primary"
                            >
                              {b.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {isLoading && (
          <div className="mt-12 flex items-center gap-2.5 text-[13px] font-semibold text-mm-text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-mm-border border-t-mm-primary" />
            Loading bookmarks from cloud…
          </div>
        )}

        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-12 w-full max-w-[420px] border border-mm-border bg-mm-bg-el p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-mm-primary/25 bg-mm-primary-subtle text-mm-primary">
              <BookmarkPlus size={24} strokeWidth={2.25} />
            </div>
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em] text-mm-text">
              No bookmarks yet
            </h2>
            <p className="mx-auto mt-2 text-[13px] leading-relaxed text-mm-text-sec">
              Use the extension popup on any webpage or head over to the dashboard to organize your library.
            </p>
            <a
              href={`${webAppUrl}/dashboard`}
              className="mt-6 inline-flex items-center gap-2 bg-mm-primary px-6 py-3 text-[13px] font-extrabold text-mm-on-primary shadow-[3px_3px_0_rgba(0,0,0,0.35)] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
            >
              Open Dashboard →
            </a>
          </motion.div>
        )}

        {/* Pinned Speed-Dial Grid */}
        {!isLoading && !search && pinned.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="mt-10 w-full"
          >
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-mm-text-muted">
                <Pin size={12} className="text-mm-warning" />
                Pinned Shortcuts ({pinned.length})
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {pinned.map((b) => {
                const accent =
                  ACCENTS[b.catColor % ACCENTS.length] ??
                  ACCENTS[0] ?? { bg: "#D4FF4F", glow: "rgba(212,255,79,0.18)" };
                return (
                  <div
                    key={b.id}
                    className="group relative flex flex-col justify-between border border-mm-border bg-mm-bg-el/90 p-3.5 transition-all hover:-translate-y-0.5 hover:border-mm-primary/50 hover:bg-mm-bg-panel hover:shadow-[3px_3px_0_rgba(0,0,0,0.4)]"
                  >
                    <div className="mb-2.5 h-[2px] w-6" style={{ background: accent.bg }} />
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <FaviconWithFallback url={b.url} title={b.title} size={18} />
                        <span className="truncate text-[13px] font-bold text-mm-text transition-colors group-hover:text-mm-primary">
                          {b.title}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-[11px] text-mm-text-muted">
                        {getDomain(b.url)}
                      </div>
                    </a>
                    <div className="mt-3 flex items-center justify-between border-t border-mm-border/60 pt-2 text-[10px] text-mm-text-muted">
                      <span className="truncate font-semibold opacity-75">{b.catName}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(b)}
                          title="Copy link"
                          className="cursor-pointer border-none bg-transparent p-1 text-mm-text-muted transition-colors hover:text-mm-text"
                        >
                          {copiedId === b.id ? (
                            <Check size={11} className="text-mm-success" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePin(b.id)}
                          title="Unpin"
                          className="cursor-pointer border-none bg-transparent p-1 text-mm-text-muted transition-colors hover:text-mm-warning"
                        >
                          <PinOff size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Exploration Section: Tabs + Filter Pills + Shelf */}
        {!isLoading && !search && allBm.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="mt-10 w-full"
          >
            {/* Tab selector bar */}
            <div className="mb-4 flex items-center justify-between border-b border-mm-border pb-2.5">
              <div className="flex items-center gap-1.5">
                {[
                  { id: "recent", label: "Recent Links", icon: <Clock size={12} /> },
                  { id: "categories", label: "Categories", icon: <Folder size={12} /> },
                  { id: "tags", label: "Tag Cloud", icon: <Tag size={12} /> },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as typeof activeTab);
                        setSelectedCatId(null);
                        setSelectedTag(null);
                      }}
                      className={[
                        "flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-bold transition-all",
                        active
                          ? "border-mm-primary bg-mm-primary text-mm-on-primary"
                          : "border-mm-border bg-mm-bg-el text-mm-text-muted hover:border-mm-border-strong hover:text-mm-text",
                      ].join(" ")}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-semibold text-mm-text-muted">
                {allBm.length} bookmark{allBm.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Category Filter Chips Bar (shown in recent and category views) */}
            {categories.length > 1 && activeTab !== "tags" && (
              <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCatId(null)}
                  className={[
                    "cursor-pointer border px-2.5 py-1 text-[10px] font-bold transition-colors",
                    selectedCatId === null
                      ? "border-mm-primary/50 bg-mm-primary/15 text-mm-primary"
                      : "border-mm-border bg-mm-bg-input text-mm-text-muted hover:text-mm-text",
                  ].join(" ")}
                >
                  All ({allBm.length})
                </button>
                {categories.map((c) => {
                  const active = selectedCatId === c.id;
                  const count = c.bookmarks?.length ?? 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCatId(active ? null : c.id)}
                      className={[
                        "flex cursor-pointer items-center gap-1 border px-2.5 py-1 text-[10px] font-bold transition-colors",
                        active
                          ? "border-mm-primary/50 bg-mm-primary/15 text-mm-primary"
                          : "border-mm-border bg-mm-bg-input text-mm-text-muted hover:text-mm-text",
                      ].join(" ")}
                    >
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                      <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tag Cloud Tab */}
            {activeTab === "tags" && (
              <div className="border border-mm-border bg-mm-bg-el p-4 text-left">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-mm-text-muted">
                  Filter by Tag ({allTagsWithCounts.length} tags)
                </p>
                {allTagsWithCounts.length === 0 ? (
                  <p className="text-[12px] text-mm-text-muted">No tags added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {allTagsWithCounts.map(({ tag, count }) => {
                      const active = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTag(active ? null : tag)}
                          className={[
                            "flex cursor-pointer items-center gap-1 border px-2.5 py-1 text-[11px] font-bold transition-all",
                            active
                              ? "border-mm-primary bg-mm-primary text-mm-on-primary"
                              : "border-mm-border bg-mm-bg-input text-mm-text-muted hover:border-mm-primary/40 hover:text-mm-text",
                          ].join(" ")}
                        >
                          <span>#{tag}</span>
                          <span className="text-[10px] opacity-75">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Bookmark List Rows */}
            <div className="mt-3.5 border border-mm-border bg-mm-bg-el/90 text-left shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
              {filteredList.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-mm-text-muted">
                  No bookmarks match the active filter
                </div>
              ) : (
                filteredList.map((b, i) => {
                  const accent =
                    ACCENTS[b.catColor % ACCENTS.length] ??
                    ACCENTS[0] ?? { bg: "#D4FF4F", glow: "rgba(212,255,79,0.18)" };
                  const ago = timeAgo(b.addedAt);
                  const tags = b.tags ?? [];
                  const visibleTags = tags.slice(0, 2);
                  const overflowTagCount = Math.max(0, tags.length - 2);

                  return (
                    <div
                      key={b.id}
                      className={[
                        "group flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-mm-bg-panel",
                        i < filteredList.length - 1 ? "border-b border-mm-border" : "",
                      ].join(" ")}
                    >
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <FaviconWithFallback url={b.url} title={b.title} size={16} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-mm-text transition-colors group-hover:text-mm-primary">
                            {b.title}
                          </div>
                          <div className="truncate text-[11px] text-mm-text-muted">
                            {getDomain(b.url)}
                          </div>
                        </div>

                        {visibleTags.length > 0 && (
                          <div className="hidden shrink-0 items-center gap-1 sm:flex">
                            {visibleTags.map((t) => (
                              <span
                                key={t}
                                className="border border-mm-border bg-mm-bg-input px-1.5 py-0.5 text-[9px] font-bold text-mm-text-muted"
                              >
                                #{t}
                              </span>
                            ))}
                            {overflowTagCount > 0 && (
                              <span className="border border-mm-border bg-mm-bg-input px-1 py-0.5 text-[9px] font-bold text-mm-text-muted">
                                +{overflowTagCount}
                              </span>
                            )}
                          </div>
                        )}

                        <span
                          className="hidden shrink-0 items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] sm:inline-flex"
                          style={{
                            background: `${accent.bg}15`,
                            border: `1px solid ${accent.bg}25`,
                            color: accent.bg,
                          }}
                        >
                          <span>{b.catIcon}</span>
                          <span>{b.catName}</span>
                        </span>

                        {ago && (
                          <span className="hidden shrink-0 text-[11px] tabular-nums text-mm-text-muted md:inline">
                            {ago}
                          </span>
                        )}
                      </a>

                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(b)}
                          title="Copy link"
                          className="cursor-pointer border-none bg-transparent p-1.5 text-mm-text-muted transition-colors hover:text-mm-text"
                        >
                          {copiedId === b.id ? (
                            <Check size={12} className="text-mm-success" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePin(b.id)}
                          disabled={togglePin.isPending}
                          title={b.pinned ? "Unpin" : "Pin"}
                          className="cursor-pointer border-none bg-transparent p-1.5 text-mm-text-muted transition-colors hover:text-mm-primary disabled:opacity-40"
                        >
                          {b.pinned ? (
                            <PinOff size={12} className="text-mm-warning" />
                          ) : (
                            <Pin size={12} />
                          )}
                        </button>
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open URL in new tab"
                          className="p-1.5 text-mm-text-muted transition-colors hover:text-mm-text"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          disabled={deleteBm.isPending}
                          title="Delete bookmark"
                          className="cursor-pointer border-none bg-transparent p-1.5 text-mm-text-muted transition-colors hover:text-mm-error disabled:opacity-40"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {confirmDeleteId && allBm.some((b) => b.id === confirmDeleteId) && (
              <p className="mt-2 text-center text-[11px] font-bold text-mm-warning">
                Click delete icon again to confirm permanent deletion
              </p>
            )}
          </motion.section>
        )}
      </main>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-5 pt-3">
        <a
          href={webAppUrl}
          className="pointer-events-auto text-[11px] font-medium text-mm-text-muted transition-colors hover:text-mm-text"
        >
          Powered by mark<span className="font-bold text-mm-primary">_</span>me
        </a>
      </footer>
    </div>
  );
}

export function NewTab({ auth }: NewTabProps) {
  if (auth === null) {
    return (
      <div className="flex h-full min-h-dvh items-center justify-center bg-mm-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-mm-border border-t-mm-primary" />
      </div>
    );
  }

  if (!auth) return <ConnectPrompt />;

  return <BookmarkGrid />;
}
