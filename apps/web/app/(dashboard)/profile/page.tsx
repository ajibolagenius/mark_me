"use client";

import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/auth-store";
import { ACCENTS, AnimCount, DEMO_DATA, Field, Logo, useUndoToast } from "@markme/ui";
import type { Category } from "@markme/ui";
import {
  Bookmark,
  Calendar,
  Camera,
  Check,
  Crown,
  LayoutGrid,
  LogOut,
  Mail,
  Pin,
  Shield,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const { data: me } = trpc.user.me.useQuery(undefined, { retry: false });
  const { data: serverCategories } = trpc.category.list.useQuery(undefined, {
    staleTime: 30_000,
    retry: false,
  });
  const categories = serverCategories ?? (DEMO_DATA as Category[]);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: (row) => {
      updateUser({ name: row.name, email: row.email });
    },
  });

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);
  const { flash, ToastEl } = useUndoToast();

  useEffect(() => {
    if (me) {
      setName(me.name);
      setEmail(me.email);
    }
  }, [me]);

  const stats = useMemo(
    () => ({
      cats: categories.length,
      bms: categories.reduce((a, c) => a + c.bookmarks.length, 0),
      pinned: categories.reduce((a, c) => a + c.bookmarks.filter((b) => b.pinned).length, 0),
      tags: new Set(categories.flatMap((c) => c.tags)).size,
    }),
    [categories],
  );

  const displayPlan = me?.plan ?? user?.plan ?? "free";
  const joinedLabel = me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : user?.joinedAt ?? new Date().toISOString();

  const isDemo = !serverCategories;

  const save = () => {
    if (isDemo) {
      updateUser({ name, email });
      setSaved(true);
      flash("Profile updated ✓");
      setTimeout(() => setSaved(false), 2000);
      return;
    }
    updateProfile.mutate(
      { name, email },
      {
        onSuccess: () => {
          setSaved(true);
          flash("Profile updated ✓");
          setTimeout(() => setSaved(false), 2000);
        },
        onError: () => flash("Couldn't save profile"),
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

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      desc: "Up to 100 bookmarks, 5 categories",
      features: ["100 bookmarks", "5 categories", "Export/Import JSON", "Tag filtering"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$4/mo",
      desc: "Unlimited everything + cloud sync",
      features: [
        "Unlimited bookmarks",
        "Unlimited categories",
        "Cloud sync & backup",
        "Chrome extension",
        "Bio website generator",
        "Priority support",
      ],
      color: ACCENTS[0].bg,
    },
  ];

  const initial = (me?.name ?? name ?? user?.name)?.[0]?.toUpperCase() ?? "U";

  if (meLoading && !me) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-sans text-sm text-mm-text-muted">
        Loading profile…
      </div>
    );
  }

  return (
    <>
      {/* Nav */}
      <nav
        aria-label="Profile navigation"
        className="sticky top-0 z-100 border-b border-mm-border bg-mm-bg/85 backdrop-blur-[20px]"
      >
        <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-5">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-mm-border bg-transparent px-3.5 py-[7px] text-[13px] text-mm-text-sec transition-colors hover:border-mm-border-strong hover:text-mm-text"
            >
              <LayoutGrid size={13} />
              Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-mm-border bg-transparent px-3.5 py-[7px] text-[13px] text-mm-text-sec transition-colors hover:border-mm-error/40 hover:text-mm-error"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main id="main-content" className="relative z-1 mx-auto max-w-[900px] px-5 pb-20 pt-10">
        {/* Profile card */}
        <section className="mb-8 border border-mm-border bg-mm-bg-el p-0">
          <div className="relative overflow-hidden border-b border-mm-border bg-mm-bg-panel px-8 py-10">
            <div className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] rounded-full bg-mm-primary opacity-[0.06] blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-[40px] -left-[40px] h-[160px] w-[160px] rounded-full bg-mm-secondary opacity-[0.04] blur-[60px]" />

            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="group relative">
                <div className="flex h-[88px] w-[88px] items-center justify-center bg-linear-to-br from-mm-primary to-mm-secondary text-[36px] font-extrabold text-white shadow-[4px_4px_0_rgba(0,0,0,0.4)]">
                  {initial}
                </div>
                <button
                  type="button"
                  aria-label="Change avatar"
                  className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center border border-mm-border bg-mm-bg-el text-mm-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Camera size={13} />
                </button>
              </div>

              {/* Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-mm-text">
                  {me?.name ?? name}
                </h1>
                <p className="mt-1 text-[14px] text-mm-text-sec">{me?.email ?? email}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1 border border-mm-primary/20 bg-mm-primary-subtle px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em] text-mm-primary">
                    <Crown size={10} />
                    {displayPlan} plan
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-mm-text-muted">
                    <Calendar size={10} />
                    Joined {joinedLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit fields */}
          <div className="px-8 py-8">
            <h2 className="mb-5 text-[13px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
              Edit Profile
            </h2>
            <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                icon={<User size={14} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Field
                label="Email"
                type="email"
                icon={<Mail size={14} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <button
              type="button"
              onClick={save}
              disabled={
                updateProfile.isPending || (me != null && name === me.name && email === me.email)
              }
              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 bg-white px-5 py-2.5 text-[13px] font-extrabold text-mm-bg shadow-[3px_3px_0_rgba(0,0,0,0.3)] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saved ? (
                <>
                  <Check size={13} />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8">
          <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
            Your Stats
          </h2>
          <div className="grid grid-cols-2 gap-px bg-mm-border sm:grid-cols-4">
            {[
              {
                label: "Categories",
                value: stats.cats,
                icon: <LayoutGrid size={16} />,
                accent: ACCENTS[0],
              },
              {
                label: "Bookmarks",
                value: stats.bms,
                icon: <Bookmark size={16} />,
                accent: ACCENTS[1],
              },
              {
                label: "Pinned",
                value: stats.pinned,
                icon: <Pin size={16} />,
                accent: ACCENTS[2],
              },
              {
                label: "Tags",
                value: stats.tags,
                icon: <Tag size={16} />,
                accent: ACCENTS[3],
              },
            ].map((s) => (
              <div key={s.label} className="bg-mm-bg-el px-5 py-6 text-center">
                <div
                  className="mx-auto mb-3 flex h-9 w-9 items-center justify-center"
                  style={{
                    background: `${s.accent.bg}15`,
                    border: `1px solid ${s.accent.bg}25`,
                    color: s.accent.bg,
                  }}
                >
                  {s.icon}
                </div>
                <div className="text-[26px] font-extrabold leading-none tracking-[-0.03em] text-mm-text">
                  <AnimCount to={s.value} />
                </div>
                <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-mm-text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section className="mb-8">
          <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
            Plans
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plans.map((plan) => {
              const isActive = displayPlan === plan.id;
              const isPro = plan.id === "pro";
              return (
                <div
                  key={plan.id}
                  className="relative border border-mm-border bg-mm-bg-el transition-colors hover:bg-mm-bg-panel"
                  style={
                    isPro
                      ? {
                          borderColor: `${plan.color}30`,
                        }
                      : undefined
                  }
                >
                  {isPro && <div className="h-[3px]" style={{ background: plan.color }} />}
                  <div className="p-6">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-[16px] font-extrabold text-mm-text">{plan.name}</h3>
                      {isActive && (
                        <span className="border border-mm-success/20 bg-mm-success/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-mm-success">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mb-1 text-[24px] font-extrabold tracking-[-0.02em] text-mm-text">
                      {plan.price}
                    </div>
                    <p className="mb-4 text-[13px] text-mm-text-muted">{plan.desc}</p>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-[13px] text-mm-text-sec"
                        >
                          <Check
                            size={12}
                            className={isPro ? "text-mm-primary" : "text-mm-success"}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {!isActive && (
                      <button
                        type="button"
                        className="mt-5 w-full cursor-pointer border border-mm-border bg-transparent py-2.5 text-[13px] font-bold text-mm-text-sec transition-colors hover:border-mm-border-strong hover:text-mm-text"
                        style={
                          isPro
                            ? {
                                background: plan.color,
                                border: "none",
                                color: "#fff",
                              }
                            : undefined
                        }
                      >
                        {isPro ? "Upgrade to Pro" : "Switch to Free"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em] text-mm-text-muted">
            Danger Zone
          </h2>
          <div className="border border-mm-error/20 bg-mm-error/5 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-mm-error">
                  <Shield size={15} />
                  Delete Account
                </h3>
                <p className="mt-1 text-[13px] text-mm-text-muted">
                  Permanently remove your account and all data. This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 cursor-pointer border border-mm-error/30 bg-transparent px-5 py-2 text-[13px] font-bold text-mm-error transition-colors hover:bg-mm-error hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 size={13} />
                  Delete Account
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {ToastEl}
    </>
  );
}
