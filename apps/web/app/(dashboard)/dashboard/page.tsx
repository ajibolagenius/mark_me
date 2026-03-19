"use client";

import { AiPanel } from "@/components/ai-panel";
import { CategoryCard } from "@/components/category-card";
import { CategoryModal } from "@/components/category-modal";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/auth-store";
import type { Category } from "@markme/ui";
import {
  AnimCount,
  ConfirmDialog,
  DEMO_DATA,
  ErrorBoundary,
  Logo,
  MobileNavOverlay,
  PullToRefresh,
  Tag,
  VirtualMasonry,
  useDebounce,
  useUndoToast,
} from "@markme/ui";
import {
  ArrowDownAZ,
  ArrowUpDown,
  Clock,
  Download,
  Hash,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type SortKey = "default" | "az" | "za" | "most" | "least" | "newest";

interface StatItem {
  label: string;
  val: number;
  colorClass: string;
}

interface SortOption {
  id: SortKey;
  label: string;
  icon: React.ReactNode | null;
}

const SORT_OPTIONS: SortOption[] = [
  { id: "default", label: "Default", icon: null },
  { id: "az", label: "A→Z", icon: <ArrowDownAZ size={10} /> },
  { id: "za", label: "Z→A", icon: null },
  { id: "most", label: "Most links", icon: <Hash size={10} /> },
  { id: "least", label: "Fewest", icon: null },
  { id: "newest", label: "Newest", icon: <Clock size={10} /> },
];

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: nav + grid + modals in one page (existing layout)
export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const utils = trpc.useUtils();

  // Demo data fallback when tRPC is unavailable (no DATABASE_URL)
  const [demoCategories, setDemoCategories] = useState<Category[]>(DEMO_DATA as Category[]);

  const {
    data: serverCategories,
    isLoading: listLoading,
    isError: listError,
    error: listErr,
    refetch,
  } = trpc.category.list.useQuery(undefined, {
    staleTime: 30_000,
    retry: 1,
  });

  // Use server data when available, otherwise fall back to demo data
  const categories = serverCategories ?? demoCategories;
  const isDemo = !serverCategories;

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 150);
  const searchActive = debouncedSearch.trim().length > 0;
  const { data: searchHits = [], isFetching: searchFetching } = trpc.bookmark.search.useQuery(
    { query: debouncedSearch.trim(), limit: 100 },
    { enabled: searchActive && !isDemo, retry: false },
  );

  const invalidateCategories = () => {
    if (!isDemo) void utils.category.list.invalidate();
  };

  // tRPC mutations — only fire when connected to real backend
  const createCategory = trpc.category.create.useMutation({
    onSuccess: invalidateCategories,
  });
  const updateCategory = trpc.category.update.useMutation({
    onSuccess: invalidateCategories,
  });
  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: invalidateCategories,
  });
  const createBookmark = trpc.bookmark.create.useMutation({
    onSuccess: invalidateCategories,
  });
  const updateBookmark = trpc.bookmark.update.useMutation({
    onSuccess: invalidateCategories,
  });
  const deleteBookmark = trpc.bookmark.delete.useMutation({
    onSuccess: invalidateCategories,
  });
  const togglePinBookmark = trpc.bookmark.togglePin.useMutation({
    onSuccess: invalidateCategories,
  });
  const importFromJson = trpc.export.fromJSON.useMutation({
    onSuccess: invalidateCategories,
  });
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [confirmDel, setConfirmDel] = useState<{ cat: Category } | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [showAi, setShowAi] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { flash, ToastEl } = useUndoToast();
  const isSearching = searchInput !== debouncedSearch || (searchActive && searchFetching);

  const allTags = useMemo(
    () => [
      ...new Set(
        categories.flatMap((c) => [...(c.tags || []), ...c.bookmarks.flatMap((b) => b.tags || [])]),
      ),
    ],
    [categories],
  );

  const filtered = useMemo(() => {
    const qLower = debouncedSearch.trim().toLowerCase();
    let result = categories;

    // Server-side search (only when connected to real backend)
    if (searchActive && !isDemo && searchHits.length > 0) {
      const hitIds = new Set(searchHits.map((b) => b.id));
      result = categories.map((cat) => ({
        ...cat,
        bookmarks: cat.bookmarks.filter((b) => hitIds.has(b.id)),
      }));
      result = result.filter(
        (cat) =>
          cat.bookmarks.length > 0 ||
          (qLower.length > 0 && cat.name.toLowerCase().includes(qLower)),
      );
    }

    result = result
      .map((cat) => {
        const bms = cat.bookmarks.filter((bm) => {
          const matchesTag =
            !filterTag || bm.tags?.includes(filterTag) || cat.tags?.includes(filterTag);
          if (searchActive && !isDemo && searchHits.length > 0) return matchesTag;
          const matchesSearch =
            !qLower ||
            bm.title.toLowerCase().includes(qLower) ||
            bm.url.toLowerCase().includes(qLower) ||
            bm.note?.toLowerCase().includes(qLower);
          return matchesSearch && matchesTag;
        });
        return { ...cat, bookmarks: bms };
      })
      .filter(
        (cat) =>
          (filterTag && cat.tags?.includes(filterTag)) ||
          cat.bookmarks.length > 0 ||
          (!debouncedSearch.trim() && !filterTag),
      );

    if (sortBy === "az") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "za") result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === "most")
      result = [...result].sort((a, b) => b.bookmarks.length - a.bookmarks.length);
    else if (sortBy === "least")
      result = [...result].sort((a, b) => a.bookmarks.length - b.bookmarks.length);
    else if (sortBy === "newest") result = [...result].reverse();

    return result;
  }, [categories, debouncedSearch, filterTag, sortBy, searchActive, searchHits, isDemo]);

  const saveCat = (cat: Category) => {
    if (isDemo) {
      // Demo mode: local state update
      if (editCat) {
        setDemoCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
      } else {
        setDemoCategories(prev => [...prev, { ...cat, id: `demo-${Date.now()}`, bookmarks: cat.bookmarks ?? [] }]);
      }
      setShowNewCat(false);
      setEditCat(null);
      return;
    }
    if (editCat) {
      updateCategory.mutate({
        id: cat.id,
        name: cat.name,
        emoji: cat.icon,
        color: cat.color,
        tags: cat.tags,
      });
    } else {
      createCategory.mutate({
        name: cat.name,
        emoji: cat.icon,
        color: cat.color,
        tags: cat.tags,
      });
    }
    setShowNewCat(false);
    setEditCat(null);
  };

  const exportData = async () => {
    try {
      const data = isDemo ? categories : await utils.export.toJSON.fetch();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "markme_bookmarks.json";
      a.click();
      URL.revokeObjectURL(url);
      flash("Exported ✓");
    } catch {
      flash("Export failed");
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse((ev.target as FileReader).result as string);
        const payload = Array.isArray(raw) ? { categories: raw } : raw;
        if (!payload?.categories || !Array.isArray(payload.categories)) {
          flash("Invalid file");
          return;
        }
        if (isDemo) {
          setDemoCategories(payload.categories);
          flash("Imported ✓");
          return;
        }
        importFromJson.mutate(
          { categories: payload.categories },
          {
            onSuccess: () => flash("Imported ✓"),
            onError: () => flash("Import failed"),
          },
        );
      } catch {
        flash("Invalid file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const requestDeleteCat = (cat: Category) => setConfirmDel({ cat });

  const confirmDeleteCat = () => {
    const cat = confirmDel?.cat;
    if (!cat) return;
    if (isDemo) {
      setDemoCategories(prev => prev.filter(c => c.id !== cat.id));
      setConfirmDel(null);
      flash(`"${cat.name}" deleted`);
      return;
    }
    deleteCategory.mutate(
      { id: cat.id },
      {
        onSuccess: () => {
          setConfirmDel(null);
          flash(`"${cat.name}" deleted`);
        },
        onError: () => flash("Couldn't delete category"),
      },
    );
  };

  const deleteBm = (catId: string, bmId: string, bmTitle: string) => {
    if (isDemo) {
      setDemoCategories(prev => prev.map(c =>
        c.id === catId ? { ...c, bookmarks: c.bookmarks.filter(b => b.id !== bmId) } : c
      ));
      flash(`"${bmTitle}" removed`);
      return;
    }
    deleteBookmark.mutate(
      { id: bmId },
      {
        onSuccess: () => flash(`"${bmTitle}" removed`),
        onError: () => flash("Couldn't remove bookmark"),
      },
    );
  };

  const handleLogout = () => {
    if (isDemo) {
      window.location.href = "/";
      return;
    }
    void signOut({ callbackUrl: "/" });
  };

  const totalBm = categories.reduce((acc, c) => acc + c.bookmarks.length, 0);
  const totalPinned = categories.reduce(
    (acc, c) => acc + c.bookmarks.filter((b) => b.pinned).length,
    0,
  );
  const stats: StatItem[] = [
    { label: "CATEGORIES", val: categories.length, colorClass: "bg-mm-primary" },
    { label: "BOOKMARKS", val: totalBm, colorClass: "bg-mm-secondary" },
    { label: "PINNED", val: totalPinned, colorClass: "bg-mm-warning" },
    { label: "TAGS", val: allTags.length, colorClass: "bg-mm-success" },
  ];

  const filteredBookmarkCount = filtered.reduce((acc, c) => acc + c.bookmarks.length, 0);

  if (listLoading && categories.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-sans text-sm text-mm-text-muted">
        Loading your library…
      </div>
    );
  }

  if (listError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center font-sans">
        <p className="mb-2 font-bold text-mm-error">Couldn&apos;t load data</p>
        <p className="mb-4 text-sm text-mm-text-muted">
          {listErr?.message ?? "Check DATABASE_URL and sign in again."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="border border-mm-border bg-mm-bg-input px-4 py-2 text-sm font-bold text-mm-text"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ─── Navigation ─── */}
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-100 border-b border-mm-border bg-[rgba(13,13,13,0.85)] backdrop-blur-[20px]"
      >
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4">
          <Logo />

          {/* Desktop nav items */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Search */}
            <div
              role="search"
              className={`flex min-w-[180px] items-center gap-1.5 border bg-mm-bg-input px-3 py-1.5 transition-colors duration-200 ${
                searchInput ? "border-mm-primary/60" : "border-mm-border"
              }`}
            >
              <Search size={14} className="shrink-0 text-mm-text-muted" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search…"
                aria-label="Search bookmarks"
                className="flex-1 border-none bg-transparent font-sans text-[13px] font-medium text-mm-text outline-none placeholder:text-mm-text-muted"
              />
              {isSearching && (
                <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-mm-primary border-t-transparent" />
              )}
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="cursor-pointer bg-transparent p-0.5 text-mm-text-muted hover:text-mm-text"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Export */}
            <button
              onClick={exportData}
              title="Export"
              aria-label="Export bookmarks as JSON"
              className="cursor-pointer border border-mm-border bg-transparent px-2.5 py-1.5 text-mm-text-sec transition-colors hover:border-mm-border-strong hover:text-mm-text"
            >
              <Download size={16} />
            </button>

            {/* Import */}
            <button
              onClick={() => fileRef.current?.click()}
              title="Import"
              aria-label="Import bookmarks from JSON"
              className="cursor-pointer border border-mm-border bg-transparent px-2.5 py-1.5 text-mm-text-sec transition-colors hover:border-mm-border-strong hover:text-mm-text"
            >
              <Upload size={16} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* AI Assistant */}
            <button
              onClick={() => setShowAi(true)}
              title="AI Assistant"
              aria-label="Open AI assistant"
              className="relative cursor-pointer border border-mm-primary/30 bg-mm-primary-subtle px-2.5 py-1.5 text-mm-primary transition-colors hover:bg-mm-primary/25"
            >
              <Sparkles size={16} />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-mm-secondary" />
            </button>

            {/* New Category */}
            <button
              onClick={() => setShowNewCat(true)}
              aria-label="Create new category"
              className="flex cursor-pointer items-center gap-1 bg-white px-4 py-[7px] font-sans text-[13px] font-extrabold text-mm-bg shadow-[2px_2px_0_rgba(0,0,0,0.3)] transition-all duration-150 hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)] active:scale-95 active:shadow-[1px_1px_0_rgba(0,0,0,0.2)]"
            >
              <Plus size={16} /> New
            </button>

            {/* Profile avatar */}
            <button
              onClick={() => router.push("/profile")}
              aria-label={`Profile — ${user?.name ?? "User"}`}
              title="Profile"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center bg-linear-to-br from-mm-primary to-mm-secondary p-0 text-xs font-extrabold text-white"
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Open menu"
            aria-expanded={mobileNav}
            className="flex cursor-pointer bg-transparent p-1.5 text-mm-text-sec md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* ─── Mobile nav overlay ─── */}
      <MobileNavOverlay
        open={mobileNav}
        onClose={() => setMobileNav(false)}
        items={[
          {
            icon: <Plus size={16} />,
            label: "New Category",
            fn: () => {
              setShowNewCat(true);
              setMobileNav(false);
            },
          },
          {
            icon: <Sparkles size={16} />,
            label: "AI Assistant",
            fn: () => {
              setShowAi(true);
              setMobileNav(false);
            },
          },
          {
            icon: <Download size={16} />,
            label: "Export",
            fn: () => {
              exportData();
              setMobileNav(false);
            },
          },
          {
            icon: <Upload size={16} />,
            label: "Import",
            fn: () => {
              fileRef.current?.click();
              setMobileNav(false);
            },
          },
          {
            icon: <User size={16} />,
            label: "Profile",
            fn: () => {
              router.push("/profile");
              setMobileNav(false);
            },
          },
          {
            icon: <LogOut size={16} />,
            label: "Log out",
            fn: () => {
              handleLogout();
              setMobileNav(false);
            },
          },
        ]}
      />

      {/* ─── Main content ─── */}
      <main id="main-content" className="relative z-1 mx-auto max-w-[1100px] px-4 pb-[60px] pt-4">
        <PullToRefresh
          onRefresh={async () => {
            await refetch();
            flash("Refreshed ✓");
          }}
        >
          {/* Mobile search */}
          <div className="mb-3.5 block md:hidden">
            <div
              role="search"
              className={`flex items-center gap-1.5 border bg-mm-bg-input px-3 py-2 transition-colors duration-200 ${
                searchInput ? "border-mm-primary/60" : "border-mm-border"
              }`}
            >
              <Search size={14} className="shrink-0 text-mm-text-muted" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search bookmarks…"
                aria-label="Search bookmarks"
                className="flex-1 border-none bg-transparent font-sans text-sm font-medium text-mm-text outline-none placeholder:text-mm-text-muted"
              />
              {isSearching && (
                <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-mm-primary border-t-transparent" />
              )}
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="cursor-pointer bg-transparent p-0.5 text-mm-text-muted hover:text-mm-text"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="mb-[18px] grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="relative overflow-hidden border border-mm-border bg-mm-bg-el px-4 py-3.5"
                style={{
                  animation: `mmCardSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms both`,
                }}
              >
                <div
                  className={`absolute -right-[15px] -top-[15px] h-[50px] w-[50px] rounded-full opacity-15 blur-[30px] ${s.colorClass}`}
                />
                <div className="relative text-2xl font-extrabold leading-none tracking-tight">
                  <AnimCount to={s.val} duration={700 + i * 100} />
                </div>
                <div className="relative mt-1 text-[10px] font-semibold uppercase tracking-wider text-mm-text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tag filter toolbar */}
          {allTags.length > 0 && (
            <div
              role="toolbar"
              aria-label="Filter by tags"
              className="mb-3 flex flex-wrap items-center gap-[5px] overflow-x-auto pb-1"
            >
              <span className="mr-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wider text-mm-text-muted">
                Filter
              </span>
              <Tag tag="ALL" small active={!filterTag} onClick={() => setFilterTag(null)} />
              {allTags.map((t) => (
                <Tag
                  key={t}
                  tag={t}
                  small
                  active={filterTag === t}
                  onClick={() => setFilterTag(filterTag === t ? null : t)}
                />
              ))}
            </div>
          )}

          {/* Sort toolbar */}
          <div
            role="toolbar"
            aria-label="Sort categories"
            className="mb-4 flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1">
              <span className="mr-0.5 flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-mm-text-muted">
                <ArrowUpDown size={10} /> Sort
              </span>
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id)}
                  aria-pressed={sortBy === s.id}
                  aria-label={`Sort by ${s.label}`}
                  className={`cursor-pointer px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-wide transition-all duration-150 ${
                    sortBy === s.id
                      ? "border border-mm-primary/40 bg-mm-primary/20 text-mm-primary"
                      : "border border-mm-border bg-transparent text-mm-text-muted hover:border-mm-border-strong hover:text-mm-text-sec"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span className="font-sans text-[11px] text-mm-text-muted">
              {filtered.length} categor{filtered.length === 1 ? "y" : "ies"} ·{" "}
              {filteredBookmarkCount} links
            </span>
          </div>

          {/* Category masonry grid */}
          <ErrorBoundary
            fallbackTitle="Dashboard error"
            fallbackMessage="The bookmark grid encountered an error. Try refreshing."
          >
            <VirtualMasonry
              items={filtered}
              columnCount={3}
              gap={14}
              renderItem={(cat: Category) => (
                <CategoryCard
                  cat={cat}
                  allTags={allTags}
                  searchQuery={debouncedSearch}
                  onEdit={(c) => setEditCat(c)}
                  onDelete={requestDeleteCat}
                  onDeleteBm={deleteBm}
                  onAddBookmark={(categoryId, data) => {
                    createBookmark.mutate({
                      categoryId,
                      title: data.title,
                      url: data.url,
                      note: data.note,
                      tags: data.tags,
                    });
                  }}
                  onUpdateBookmark={(_categoryId, bookmarkId, data) => {
                    updateBookmark.mutate({
                      id: bookmarkId,
                      title: data.title,
                      url: data.url,
                      note: data.note ?? null,
                      tags: data.tags,
                    });
                  }}
                  onTogglePinBookmark={(id) => togglePinBookmark.mutate({ id })}
                />
              )}
            />
          </ErrorBoundary>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="px-5 py-20 text-center">
              <div className="mb-3 text-[40px] opacity-40">🔍</div>
              <p className="mb-1.5 text-base font-bold text-mm-text-sec">
                {debouncedSearch || filterTag ? "No matches" : "No categories yet"}
              </p>
              <p className="text-[13px] text-mm-text-muted">
                {debouncedSearch || filterTag
                  ? "Try a different search"
                  : "Create your first category"}
              </p>
            </div>
          )}
        </PullToRefresh>
      </main>

      {/* ─── Mobile FAB ─── */}
      <button
        onClick={() => setShowNewCat(true)}
        aria-label="Create new category"
        className="fixed bottom-6 right-5 z-90 flex h-[52px] w-[52px] cursor-pointer items-center justify-center bg-linear-to-br from-mm-primary to-mm-secondary p-0 text-white shadow-[0_4px_20px_var(--mm-primary-50),4px_4px_0_rgba(0,0,0,0.3)] transition-all duration-200 active:scale-90 md:hidden"
      >
        <Plus size={22} />
      </button>

      {/* ─── Modals & panels ─── */}
      <CategoryModal open={showNewCat} onClose={() => setShowNewCat(false)} onSave={saveCat} />
      <CategoryModal
        open={!!editCat}
        onClose={() => setEditCat(null)}
        onSave={saveCat}
        cat={editCat}
      />
      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={confirmDeleteCat}
        title={`Delete "${confirmDel?.cat?.name}"?`}
        itemName={confirmDel?.cat?.name}
        count={confirmDel?.cat?.bookmarks?.length || 0}
      />
      <AiPanel open={showAi} onClose={() => setShowAi(false)} categories={categories} />
      {ToastEl}
    </>
  );
}
