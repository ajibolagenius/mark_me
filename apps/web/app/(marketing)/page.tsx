"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Tag,
  Bookmark,
  Chrome,
  Cloud,
  Layout,
  PanelTop,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Atmosphere, Logo, SkipLink, ACCENTS } from "@markme/ui";

const features = [
  {
    icon: <LayoutGrid size={18} />,
    title: "Masonry Grid",
    desc: "Visual bento layout that makes browsing your links feel intentional",
  },
  {
    icon: <Tag size={18} />,
    title: "Smart Tags",
    desc: "Color-coded pills to slice and filter your collection instantly",
  },
  {
    icon: <Bookmark size={18} />,
    title: "Pin & Organize",
    desc: "Pin your most-used links, group by category, drag to reorder",
  },
  {
    icon: <Chrome size={18} />,
    title: "Chrome Extension",
    desc: "One-click save from any page — auto-tagged, auto-categorized",
    soon: true,
  },
  {
    icon: <Cloud size={18} />,
    title: "Cloud Sync",
    desc: "Firebase-backed storage keeps your bookmarks safe across devices",
    soon: true,
  },
  {
    icon: <Layout size={18} />,
    title: "Bio Website",
    desc: "Generate a sleek link-in-bio page from your public bookmarks",
    soon: true,
  },
  {
    icon: <PanelTop size={18} />,
    title: "New Tab Override",
    desc: "Replace Chrome's new tab with your bookmarks, clock, and quick search",
    isNew: true,
  },
  {
    icon: <Sparkles size={18} />,
    title: "AI Assistant",
    desc: "Auto-tag, summarize, and discover connections across your bookmarks",
    isNew: true,
  },
];

const stats = [
  { val: "12K+", label: "Bookmarks saved" },
  { val: "2.4K", label: "Active users" },
  { val: "99.9%", label: "Uptime" },
  { val: "< 50ms", label: "Load time" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mm-bg font-sans text-mm-text">
      <Atmosphere />
      <SkipLink />

      {/* Nav */}
      <nav
        aria-label="Site navigation"
        className="sticky top-0 z-100 border-b border-mm-border bg-mm-bg/85 backdrop-blur-[20px]"
      >
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-1">
            {[
              { label: "Pricing", href: "/pricing" },
              { label: "Extension", href: "/newtab" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-[7px] text-[13px] text-mm-text-muted transition-colors hover:text-mm-text"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="border border-mm-border px-4 py-[7px] text-[13px] text-mm-text-sec transition-colors hover:border-mm-border-strong hover:text-mm-text"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-white px-4 py-[7px] text-[13px] font-extrabold text-mm-bg shadow-[2px_2px_0_rgba(0,0,0,0.3)] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="main-content"
        className="relative z-1 mx-auto max-w-[1100px] px-5 pb-[60px] pt-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-1.5 border border-mm-primary/20 bg-mm-primary-subtle px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-mm-primary">
            <Zap size={12} /> Now in public beta
          </div>
          <h1 className="mb-5 font-sans text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-mm-text">
            Your bookmarks,
            <br />
            <span className="bg-linear-to-br from-mm-primary to-mm-secondary bg-clip-text text-transparent">
              beautifully organized.
            </span>
          </h1>
          <p className="mx-auto mb-9 max-w-[520px] text-[clamp(1rem,2vw,1.15rem)] font-medium leading-[1.6] text-mm-text-sec">
            Stop losing links in browser chaos. Save, tag, and browse your
            bookmarks in a visual grid designed for humans — not file trees.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white px-8 py-3.5 text-[15px] font-extrabold text-mm-bg shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center border border-mm-border px-7 py-3.5 text-[15px] text-mm-text-sec transition-colors hover:border-mm-border-strong hover:text-mm-text"
            >
              I have an account
            </Link>
          </div>
        </motion.div>

        {/* Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative mt-[60px] overflow-hidden border border-mm-border bg-mm-bg-el p-[3px] shadow-[8px_8px_0_rgba(0,0,0,0.4)]"
        >
          <div className="pointer-events-none absolute -top-[30px] left-[20%] h-[200px] w-[200px] rounded-full bg-mm-primary opacity-[0.08] blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-[30px] right-[20%] h-[180px] w-[180px] rounded-full bg-mm-secondary opacity-[0.06] blur-[70px]" />
          <div
            className="flex items-center gap-2 border-b border-mm-border bg-mm-bg-panel px-4 py-3"
            aria-hidden="true"
          >
            <div className="flex gap-[5px]">
              <div className="h-2 w-2 rounded-full bg-mm-error opacity-60" />
              <div className="h-2 w-2 rounded-full bg-mm-warning opacity-60" />
              <div className="h-2 w-2 rounded-full bg-mm-success opacity-60" />
            </div>
            <div className="flex-1 border border-mm-border bg-mm-bg-input px-2.5 py-1 text-[11px] text-mm-text-muted">
              app.markme.io/dashboard
            </div>
          </div>
          <div className="grid min-h-[180px] grid-cols-3 gap-2.5 p-5">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const ac = ACCENTS[i % ACCENTS.length]!;
              return (
                <div
                  key={i}
                  className="overflow-hidden border border-mm-border bg-mm-bg-el"
                  style={{ minHeight: i % 3 === 0 ? 120 : 80 }}
                >
                  <div className="h-[3px]" style={{ background: ac.bg }} />
                  <div className="p-2.5">
                    <div className="mb-1.5 h-2 w-3/5 bg-white/8" />
                    <div className="h-1.5 w-2/5 bg-white/4" />
                    <div className="mt-2 flex gap-[3px]">
                      {[0, 1].map((j) => (
                        <div
                          key={j}
                          className="h-2.5 w-7"
                          style={{
                            background: `${ac.bg}25`,
                            border: `1px solid ${ac.bg}30`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-1 mx-auto max-w-[1100px] px-5 pb-[60px] pt-10">
        <div className="grid grid-cols-2 gap-px bg-mm-border md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-mm-bg px-5 py-7 text-center">
              <div className="text-[28px] font-extrabold leading-none tracking-[-0.03em] text-mm-text">
                {s.val}
              </div>
              <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-mm-text-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-1 mx-auto max-w-[1100px] px-5 pb-20 pt-5">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-sans text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.03em]">
            Everything you need.
          </h2>
          <p className="mx-auto max-w-[400px] text-[15px] text-mm-text-sec">
            A focused set of tools to replace the browser bookmark bar forever.
          </p>
        </div>
        <motion.div
          className="grid grid-cols-1 gap-px bg-mm-border md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="relative overflow-hidden bg-mm-bg px-7 py-8 transition-colors hover:bg-mm-bg-el"
            >
              {f.soon && (
                <span className="absolute right-3 top-3 border border-mm-warning/20 bg-mm-warning/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-mm-warning">
                  Soon
                </span>
              )}
              {f.isNew && (
                <span className="absolute right-3 top-3 border border-mm-secondary/20 bg-mm-secondary-subtle px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-mm-secondary">
                  New
                </span>
              )}
              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-mm-primary/15 bg-mm-primary-subtle text-mm-primary">
                {f.icon}
              </div>
              <h3 className="mb-2 font-sans text-[15px] font-extrabold tracking-[-0.02em] text-mm-text">
                {f.title}
              </h3>
              <p className="text-[13px] leading-normal text-mm-text-muted">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-1 border-t border-mm-border">
        <div className="mx-auto max-w-[1100px] px-5 py-20 text-center">
          <h2 className="mb-4 font-sans text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-[-0.03em]">
            Ready to organize your internet?
          </h2>
          <p className="mx-auto mb-8 max-w-[400px] text-[15px] text-mm-text-sec">
            Free to use. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white px-9 py-3.5 text-[15px] font-extrabold text-mm-bg shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
          >
            Create your account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-1 border-t border-mm-border">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-5 py-6">
          <Logo size={20} />
          <div className="flex items-center gap-4">
            {[
              { label: "Pricing", href: "/pricing" },
              { label: "Extension", href: "/newtab" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-mm-text-muted transition-colors hover:text-mm-text"
              >
                {l.label}
              </Link>
            ))}
            <span className="text-xs text-mm-text-muted">
              &copy; 2026 mark_me
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
