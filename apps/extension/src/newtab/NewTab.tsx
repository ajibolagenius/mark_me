import type { AuthState } from "@/lib/storage";
import { clearAuth } from "@/lib/storage";
import { trpcReact } from "@/lib/trpc";
import { ACCENTS, FaviconWithFallback, Highlight, Logo, getDomain, timeAgo } from "@markme/ui";
import { motion } from "framer-motion";
import {
  BookmarkPlus,
  Clock,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Pin,
  PinOff,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  catColor: number;
  catName: string;
};

function Ambient() {
  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-[28%] h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mm-primary opacity-[0.06] blur-[140px]" />
      <div className="pointer-events-none fixed bottom-[12%] right-[8%] h-[300px] w-[300px] rounded-full bg-mm-secondary opacity-[0.04] blur-[110px]" />
    </>
  );
}

function TopBar({
  showDashboard,
  onDisconnect,
}: {
  showDashboard?: boolean;
  onDisconnect?: () => void;
}) {
  const webAppUrl = getWebAppUrl();
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-7">
      <div className="pointer-events-auto">
        <Logo size={24} />
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        {showDashboard && (
          <a
            href={`${webAppUrl}/dashboard`}
            className="inline-flex items-center gap-1.5 border border-mm-border bg-mm-bg-el/80 px-3 py-2 text-[12px] font-bold text-mm-text-sec backdrop-blur-sm transition-colors hover:border-mm-primary/40 hover:text-mm-text"
          >
            <LayoutDashboard size={13} />
            Dashboard
          </a>
        )}
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            aria-label="Disconnect"
            className="inline-flex cursor-pointer items-center border border-mm-border bg-mm-bg-el/80 p-2 text-mm-text-muted backdrop-blur-sm transition-colors hover:border-mm-error/40 hover:text-mm-error"
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
        className="relative z-10 w-full max-w-[420px] text-center"
      >
        <Logo size={40} />
        <h1 className="mt-7 text-[clamp(1.5rem,4vw,1.85rem)] font-extrabold tracking-[-0.04em] text-mm-text">
          Welcome to mark_me
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-relaxed text-mm-text-sec">
          Connect your account to see pinned and recent bookmarks in every new tab.
        </p>
        <button
          type="button"
          onClick={() => {
            const extId = chrome.runtime.id;
            window.location.href = `${webAppUrl}/extension-auth?ext=${extId}`;
          }}
          className="mt-8 inline-flex items-center gap-2 bg-mm-primary px-7 py-3.5 text-[14px] font-extrabold text-mm-on-primary shadow-[4px_4px_0_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(0,0,0,0.5)]"
        >
          Connect to mark_me →
        </button>
      </motion.div>
    </div>
  );
}

function RowActions({
  bookmark,
  onPin,
  onDelete,
  pinning,
  deleting,
}: {
  bookmark: BmRow;
  onPin: () => void;
  onDelete: () => void;
  pinning: boolean;
  deleting: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPin();
        }}
        disabled={pinning}
        aria-label={bookmark.pinned ? "Unpin" : "Pin"}
        className="cursor-pointer border-none bg-transparent p-1.5 text-mm-text-muted transition-colors hover:text-mm-primary disabled:opacity-40"
      >
        {bookmark.pinned ? <PinOff size={13} /> : <Pin size={13} />}
      </button>
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Open bookmark"
        className="p-1.5 text-mm-text-muted transition-colors hover:text-mm-text"
      >
        <ExternalLink size={13} />
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        disabled={deleting}
        aria-label="Delete bookmark"
        className="cursor-pointer border-none bg-transparent p-1.5 text-mm-text-muted transition-colors hover:text-mm-error disabled:opacity-40"
      >
        <Trash2 size={13} />
      </button>
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const mins = time.getMinutes().toString().padStart(2, "0");
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
          catColor: c.color,
          catName: c.name,
        })),
      ),
    [categories],
  );

  const pinned = allBm.filter((b) => b.pinned);
  const recent = [...allBm].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)).slice(0, 10);
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

  return (
    <div className="relative h-full min-h-dvh bg-mm-bg font-sans text-mm-text">
      <Ambient />
      <TopBar showDashboard onDisconnect={() => void clearAuth()} />

      <main
        className={[
          "relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-5",
          isEmpty || isLoading
            ? "min-h-dvh justify-center py-28"
            : "min-h-dvh justify-start pb-20 pt-[min(18vh,140px)]",
        ].join(" ")}
      >
        {/* Hero: clock + greeting + search — one centered composition when empty */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full text-center"
        >
          <div className="font-sans text-[clamp(4rem,11vw,6.75rem)] font-extrabold leading-none tracking-[-0.05em] text-mm-text">
            <span>{hours}</span>
            <span className="mx-[0.06em] text-mm-primary">:</span>
            <span>{mins}</span>
          </div>
          <p className="mt-3 text-[15px] font-medium text-mm-text-sec sm:text-[16px]">
            {greeting} — {dateStr}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="relative mt-8 w-full max-w-[560px]"
        >
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-mm-text-muted">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks"
              aria-label="Search bookmarks"
              className="w-full border border-mm-border bg-mm-bg-el/90 py-3.5 pl-11 pr-10 text-[15px] text-mm-text outline-none backdrop-blur-sm transition-colors placeholder:text-mm-text-muted focus:border-mm-primary/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer border-none bg-transparent p-1 text-mm-text-muted hover:text-mm-text"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {search && (
            <div className="absolute left-0 top-full z-50 mt-1.5 max-h-[min(360px,40vh)] w-full overflow-y-auto border border-mm-border bg-mm-bg-el text-left shadow-[6px_6px_0_rgba(0,0,0,0.4)]">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-mm-text-muted">
                  No bookmarks found for &quot;{search}&quot;
                </div>
              ) : (
                searchResults.map((b) => {
                  const accent = ACCENTS[b.catColor % ACCENTS.length] ??
                    ACCENTS[0] ?? { bg: "#D4FF4F", glow: "rgba(212,255,79,0.18)" };
                  return (
                    <div
                      key={b.id}
                      className="group flex items-center gap-3 border-b border-mm-border px-3 py-2.5 transition-colors last:border-b-0 hover:bg-mm-bg-panel"
                    >
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <FaviconWithFallback url={b.url} title={b.title} size={18} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-mm-text">
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
                      <RowActions
                        bookmark={b}
                        onPin={() => handlePin(b.id)}
                        onDelete={() => handleDelete(b.id)}
                        pinning={togglePin.isPending}
                        deleting={deleteBm.isPending}
                      />
                    </div>
                  );
                })
              )}
              {confirmDeleteId && searchResults.some((b) => b.id === confirmDeleteId) && (
                <div className="border-t border-mm-border bg-mm-bg-panel px-4 py-2 text-center text-[11px] text-mm-warning">
                  Click delete again to confirm
                </div>
              )}
            </div>
          )}
        </motion.div>

        {isLoading && (
          <div className="mt-10 flex items-center gap-2 text-[13px] text-mm-text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-mm-border border-t-mm-primary" />
            Loading your bookmarks…
          </div>
        )}

        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-10 w-full max-w-[400px] text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-mm-primary/25 bg-mm-primary-subtle text-mm-primary">
              <BookmarkPlus size={22} strokeWidth={2.25} />
            </div>
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em] text-mm-text">
              No bookmarks yet
            </h2>
            <p className="mx-auto mt-2 text-[14px] leading-relaxed text-mm-text-sec">
              Click the mark_me icon in your toolbar to save your first bookmark.
            </p>
            <a
              href={`${webAppUrl}/dashboard`}
              className="mt-6 inline-flex items-center gap-2 bg-mm-primary px-6 py-3 text-[13px] font-extrabold text-mm-on-primary shadow-[3px_3px_0_rgba(0,0,0,0.35)] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
            >
              Open Dashboard →
            </a>
          </motion.div>
        )}

        {!isLoading && !search && pinned.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-12 w-full"
          >
            <h2 className="mb-4 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
              <Pin size={11} />
              Pinned
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {pinned.map((b) => {
                const accent = ACCENTS[b.catColor % ACCENTS.length] ??
                  ACCENTS[0] ?? { bg: "#D4FF4F", glow: "rgba(212,255,79,0.18)" };
                return (
                  <div
                    key={b.id}
                    className="group relative border border-mm-border bg-mm-bg-el/90 transition-colors hover:bg-mm-bg-panel"
                  >
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3.5"
                    >
                      <div className="mb-0.5 h-[2px] w-6" style={{ background: accent.bg }} />
                      <div className="mt-2.5 flex items-center gap-2">
                        <FaviconWithFallback url={b.url} title={b.title} size={16} />
                        <span className="truncate text-[13px] font-semibold text-mm-text transition-colors group-hover:text-mm-primary">
                          {b.title}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-[11px] text-mm-text-muted">
                        {getDomain(b.url)}
                      </div>
                    </a>
                    <div className="absolute right-1 top-1 flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <RowActions
                        bookmark={b}
                        onPin={() => handlePin(b.id)}
                        onDelete={() => handleDelete(b.id)}
                        pinning={togglePin.isPending}
                        deleting={deleteBm.isPending}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {!isLoading && !search && recent.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14 }}
            className="mt-10 w-full"
          >
            <h2 className="mb-4 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
              <Clock size={11} />
              Recently Added
            </h2>
            <div className="border border-mm-border bg-mm-bg-el/90 text-left">
              {recent.map((b, i) => {
                const accent = ACCENTS[b.catColor % ACCENTS.length] ??
                  ACCENTS[0] ?? { bg: "#D4FF4F", glow: "rgba(212,255,79,0.18)" };
                const ago = timeAgo(b.addedAt);
                return (
                  <div
                    key={b.id}
                    className={[
                      "group flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-mm-bg-panel",
                      i < recent.length - 1 ? "border-b border-mm-border" : "",
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
                        <div className="truncate text-[13px] font-semibold text-mm-text">
                          {b.title}
                        </div>
                        <div className="truncate text-[11px] text-mm-text-muted">
                          {getDomain(b.url)}
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
                      {ago && (
                        <span className="hidden shrink-0 text-[11px] tabular-nums text-mm-text-muted sm:inline">
                          {ago}
                        </span>
                      )}
                    </a>
                    <RowActions
                      bookmark={b}
                      onPin={() => handlePin(b.id)}
                      onDelete={() => handleDelete(b.id)}
                      pinning={togglePin.isPending}
                      deleting={deleteBm.isPending}
                    />
                  </div>
                );
              })}
            </div>
            {confirmDeleteId && recent.some((b) => b.id === confirmDeleteId) && (
              <p className="mt-2 text-center text-[11px] text-mm-warning">
                Click delete again to confirm
              </p>
            )}
          </motion.section>
        )}
      </main>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-5 pt-3">
        <a
          href={webAppUrl}
          className="pointer-events-auto text-[11px] text-mm-text-muted transition-colors hover:text-mm-text"
        >
          Powered by mark<span className="text-mm-primary">_</span>me
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
