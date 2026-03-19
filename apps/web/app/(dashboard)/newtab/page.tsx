"use client";

import { trpc } from "@/lib/trpc";
import { ACCENTS, FaviconWithFallback, Highlight, getDomain, timeAgo } from "@markme/ui";
import { ArrowRight, Chrome, Clock, Pin, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NewTabPage() {
  const { data: categories = [] } = trpc.category.list.useQuery(undefined, {
    staleTime: 30_000,
  });
  const [time, setTime] = useState(new Date());
  const [ntSearch, setNtSearch] = useState("");

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

  const allBm = categories.flatMap((c) =>
    c.bookmarks.map((b) => ({
      ...b,
      catColor: c.color,
      catName: c.name,
      catIcon: c.icon,
    })),
  );
  const pinned = allBm.filter((b) => b.pinned);
  const recent = [...allBm].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 8);
  const searchResults = ntSearch
    ? allBm.filter(
        (b) =>
          b.title.toLowerCase().includes(ntSearch.toLowerCase()) ||
          b.url.toLowerCase().includes(ntSearch.toLowerCase()),
      )
    : [];

  return (
    <div className="flex min-h-screen flex-col items-center bg-mm-bg px-5 pb-16 pt-[12vh] font-sans text-mm-text">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed left-1/2 top-[15%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-mm-primary opacity-[0.04] blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-mm-secondary opacity-[0.03] blur-[100px]" />

      {/* Clock */}
      <div className="mb-2 text-center">
        <div className="font-sans text-[clamp(4rem,12vw,7rem)] font-extrabold leading-none tracking-[-0.04em] text-mm-text">
          <span>{hours}</span>
          <span className="mx-1 animate-pulse text-mm-primary">:</span>
          <span>{mins}</span>
        </div>
        <p className="mt-2 text-[15px] font-medium text-mm-text-sec">
          {greeting} — {dateStr}
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto mt-8 w-full max-w-[560px]">
        <div className="relative">
          <div className="absolute left-4 top-1/2 flex -translate-y-1/2 text-mm-text-muted">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={ntSearch}
            onChange={(e) => setNtSearch(e.target.value)}
            placeholder="Search bookmarks…"
            aria-label="Search bookmarks"
            className="w-full border border-mm-border bg-mm-bg-el py-3.5 pl-11 pr-10 text-[14px] text-mm-text outline-none transition-colors focus:border-mm-primary"
          />
          {ntSearch && (
            <button
              type="button"
              onClick={() => setNtSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer border-none bg-transparent p-1 text-mm-text-muted hover:text-mm-text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {ntSearch && (
          <div className="absolute left-0 top-full z-50 mt-1 max-h-[320px] w-full overflow-y-auto border border-mm-border bg-mm-bg-el shadow-[6px_6px_0_rgba(0,0,0,0.4)]">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px] text-mm-text-muted">
                No bookmarks found for &quot;{ntSearch}&quot;
              </div>
            ) : (
              searchResults.map((b) => {
                const accent = ACCENTS[b.catColor % ACCENTS.length] ?? ACCENTS[0]!;
                return (
                  <a
                    key={b.id}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border-b border-mm-border px-4 py-3 transition-colors last:border-b-0 hover:bg-mm-bg-panel"
                  >
                    <FaviconWithFallback url={b.url} title={b.title} size={18} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-mm-text">
                        <Highlight text={b.title} query={ntSearch} />
                      </div>
                      <div className="truncate text-[11px] text-mm-text-muted">
                        <Highlight text={getDomain(b.url)} query={ntSearch} />
                      </div>
                    </div>
                    <span
                      className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em]"
                      style={{
                        background: `${accent!.bg}15`,
                        border: `1px solid ${accent!.bg}25`,
                        color: accent!.bg,
                      }}
                    >
                      {b.catName}
                    </span>
                  </a>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Pinned shortcuts */}
      {pinned.length > 0 && (
        <section className="mx-auto mt-12 w-full max-w-[700px]">
          <h2 className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
            <Pin size={11} />
            Pinned
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {pinned.map((b) => {
              const accent = (ACCENTS[b.catColor % ACCENTS.length] ?? ACCENTS[0])!;
              return (
                <a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-mm-border bg-mm-bg-el px-4 py-3.5 transition-colors hover:bg-mm-bg-panel"
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
              );
            })}
          </div>
        </section>
      )}

      {/* Recent bookmarks */}
      {recent.length > 0 && (
        <section className="mx-auto mt-10 w-full max-w-[700px]">
          <h2 className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
            <Clock size={11} />
            Recently Added
          </h2>
          <div className="border border-mm-border bg-mm-bg-el">
            {recent.map((b, i) => {
              const accent = (ACCENTS[b.catColor % ACCENTS.length] ?? ACCENTS[0])!;
              const ago = timeAgo(b.addedAt);
              return (
                <a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-mm-bg-panel",
                    i < recent.length - 1 ? "border-b border-mm-border" : "",
                  ].join(" ")}
                >
                  <FaviconWithFallback url={b.url} title={b.title} size={16} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-mm-text">{b.title}</div>
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
                    <span className="shrink-0 text-[11px] tabular-nums text-mm-text-muted">
                      {ago}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state / CTA */}
      {allBm.length === 0 && (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-mm-primary/15 bg-mm-primary-subtle text-mm-primary">
            <Chrome size={24} />
          </div>
          <h2 className="mb-2 text-[18px] font-extrabold text-mm-text">No bookmarks yet</h2>
          <p className="mx-auto mb-6 max-w-[340px] text-[14px] text-mm-text-sec">
            Head to your dashboard to create categories and start saving bookmarks.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white px-6 py-3 text-[13px] font-extrabold text-mm-bg shadow-[3px_3px_0_rgba(0,0,0,0.3)] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
          >
            Go to Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Footer branding */}
      <div className="mt-auto pt-16 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] text-mm-text-muted transition-colors hover:text-mm-text"
        >
          <Chrome size={12} />
          Powered by mark
          <span className="text-mm-primary">_</span>me
        </Link>
      </div>
    </div>
  );
}
