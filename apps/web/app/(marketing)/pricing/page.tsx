"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Crown, ChevronDown } from "lucide-react";
import { Atmosphere, Logo, SkipLink, AnimatedCollapse } from "@markme/ui";

interface Plan {
  id: string;
  name: string;
  price: string;
  priceAnnual: string;
  period?: string;
  desc: string;
  features: string[];
  cta: string;
  color?: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceAnnual: "$0",
    period: "forever",
    desc: "For casual bookmarkers",
    features: [
      "Up to 100 bookmarks",
      "5 categories",
      "Tag filtering & search",
      "Export/Import JSON",
      "Basic sort controls",
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$5/mo",
    priceAnnual: "$4/mo",
    desc: "For power users",
    features: [
      "Unlimited bookmarks",
      "Unlimited categories",
      "Cloud sync & backup",
      "Chrome extension + new tab",
      "AI auto-tagging & summaries",
      "Link preview tooltips",
      "Priority support",
    ],
    color: "#A855F7",
    popular: true,
    cta: "Start Free Trial",
  },
  {
    id: "team",
    name: "Team",
    price: "$12/mo",
    priceAnnual: "$9/mo",
    desc: "For teams & companies",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Team bookmark collections",
      "Admin dashboard & roles",
      "Bio website generator",
      "API access",
      "Dedicated support",
    ],
    color: "#EC4899",
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate the difference.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes — Pro comes with a 14-day free trial, no credit card required. You'll only be charged if you decide to continue.",
  },
  {
    q: "What happens to my bookmarks if I downgrade?",
    a: "Your bookmarks are never deleted. If you exceed the free tier limit, you'll have read-only access until you upgrade or remove some.",
  },
  {
    q: "Does the Chrome extension work on other browsers?",
    a: "We're starting with Chrome and Chromium-based browsers (Edge, Brave, Arc). Firefox and Safari support is planned.",
  },
  {
    q: "How does AI auto-tagging work?",
    a: "When you save a bookmark, our AI analyzes the URL, title, and page content to suggest relevant tags and a category. You can accept, edit, or ignore the suggestions.",
  },
];

function checkColor(color: string | undefined) {
  if (color === "#A855F7") return "text-mm-primary";
  if (color === "#EC4899") return "text-mm-secondary";
  return "text-mm-success";
}

function priceColor(color: string | undefined) {
  if (color === "#A855F7") return "text-mm-primary";
  if (color === "#EC4899") return "text-mm-secondary";
  return "text-mm-text";
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function getPeriod(plan: (typeof plans)[number]) {
    if (plan.id === "free") return "forever";
    if (plan.id === "team")
      return `per user, ${annual ? "billed annually" : "billed monthly"}`;
    return annual ? "billed annually" : "billed monthly";
  }

  return (
    <div className="relative min-h-screen">
      <Atmosphere />
      <SkipLink />

      {/* Nav */}
      <nav
        aria-label="Site navigation"
        className="sticky top-0 z-100 border-b border-mm-border bg-mm-bg/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-5">
          <Link href="/" aria-label="Go to homepage">
            <Logo />
          </Link>
          <Link
            href="/signup"
            className="bg-white px-4 py-[7px] text-sm font-extrabold text-mm-bg shadow-[2px_2px_0_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-px"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main
        id="main-content"
        className="relative z-1 mx-auto max-w-[1100px] px-5 pb-20 pt-[60px]"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em]"
          >
            Simple, transparent{" "}
            <span className="bg-linear-to-br from-mm-primary to-mm-secondary bg-clip-text text-transparent">
              pricing
            </span>
          </motion.h1>
          <p className="mx-auto mb-6 max-w-[440px] text-[15px] text-mm-text-sec">
            Start free. Upgrade when you need more power.
          </p>

          {/* Annual / Monthly toggle */}
          <div className="inline-flex items-center gap-2.5 border border-mm-border bg-mm-bg-el p-1">
            {([
              { label: "Monthly", val: false },
              { label: "Annual", val: true },
            ] as const).map((o) => (
              <button
                key={o.label}
                onClick={() => setAnnual(o.val)}
                className={`px-5 py-[7px] text-xs font-bold transition-all ${
                  annual === o.val
                    ? "bg-white text-mm-bg"
                    : "bg-transparent text-mm-text-muted"
                }`}
              >
                {o.label}{" "}
                {o.val && (
                  <span
                    className={`ml-0.5 text-[10px] font-extrabold ${
                      annual ? "text-mm-bg" : "text-mm-success"
                    }`}
                  >
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-[60px] grid grid-cols-1 gap-px bg-mm-border md:grid-cols-3"
        >
          {plans.map((p) => (
            <div key={p.id} className="relative overflow-hidden bg-mm-bg px-7 py-9">
              {/* Popular top bar */}
              {p.popular && (
                <div
                  className={`absolute left-0 right-0 top-0 h-[3px] ${
                    p.color === "#A855F7" ? "bg-mm-primary" : "bg-mm-secondary"
                  }`}
                />
              )}

              {/* Popular badge */}
              {p.popular && (
                <span
                  className={`absolute right-3 top-3 border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] ${
                    p.color === "#A855F7"
                      ? "border-mm-primary/20 bg-mm-primary/10 text-mm-primary"
                      : "border-mm-secondary/20 bg-mm-secondary/10 text-mm-secondary"
                  }`}
                >
                  Most popular
                </span>
              )}

              {/* Glow */}
              {p.color && (
                <div
                  className={`absolute -right-10 -top-10 h-[120px] w-[120px] rounded-full opacity-[0.08] blur-[70px] ${
                    p.color === "#A855F7" ? "bg-mm-primary" : "bg-mm-secondary"
                  }`}
                />
              )}

              <div className="relative mb-1 text-[13px] font-extrabold tracking-[-0.02em] text-mm-text">
                {p.name}
              </div>
              <div className="relative mb-1 flex items-baseline gap-1">
                <span
                  className={`text-4xl font-extrabold leading-none tracking-[-0.04em] ${priceColor(
                    p.color
                  )}`}
                >
                  {annual ? p.priceAnnual : p.price}
                </span>
              </div>
              <div className="relative mb-5 text-[11px] text-mm-text-muted">
                {getPeriod(p)}
              </div>
              <p className="relative mb-5 text-[13px] leading-relaxed text-mm-text-sec">
                {p.desc}
              </p>

              <div className="relative mb-6 flex flex-col gap-2">
                {p.features.map((f, fi) => (
                  <div
                    key={fi}
                    className="flex items-center gap-1.5 text-[13px] text-mm-text-sec"
                  >
                    <span
                      className={`flex shrink-0 ${checkColor(p.color)}`}
                    >
                      <Check size={14} />
                    </span>
                    {f}
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={`relative block w-full py-3 text-center text-sm font-extrabold transition-transform hover:-translate-y-px ${
                  p.popular
                    ? "bg-white text-mm-bg shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
                    : p.color === "#A855F7"
                      ? "border border-mm-primary/25 bg-mm-primary/10 text-mm-primary"
                      : p.color === "#EC4899"
                        ? "border border-mm-secondary/25 bg-mm-secondary/10 text-mm-secondary"
                        : "border border-mm-border bg-transparent text-mm-text-sec"
                }`}
              >
                {p.popular && <Crown size={14} className="mr-1 inline-block" />}
                {p.cta}
              </Link>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <div className="mx-auto max-w-[700px]">
          <h2 className="mb-6 text-center text-[22px] font-extrabold tracking-[-0.03em]">
            Frequently asked questions
          </h2>
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-mm-border">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center justify-between bg-transparent py-4 text-left text-sm font-bold text-mm-text"
              >
                {f.q}
                <ChevronDown
                  size={16}
                  className={`ml-3 shrink-0 transition-transform duration-200 ${
                    openFaq === i ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              <AnimatedCollapse open={openFaq === i}>
                <p className="pb-4 text-[13px] leading-relaxed text-mm-text-sec">
                  {f.a}
                </p>
              </AnimatedCollapse>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
