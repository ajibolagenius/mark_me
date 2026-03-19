"use client";

import { Field, Logo, MOCK_USERS } from "@markme/ui";
import { motion } from "framer-motion";
import { Eye, EyeOff, Github, Lock, Mail, Zap } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: login/signup + OAuth/magic-link in one form
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const router = useRouter();

  const [email, setEmail] = useState(isLogin ? "demo@markme.io" : "");
  const [pass, setPass] = useState(isLogin ? "mark_me1" : "");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState<"google" | "github" | null>(null);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    if (pass.length < 6) {
      setError("Password must be 6+ characters");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password: pass,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid demo credentials — use the demo cards or OAuth / magic link.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const submitMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    const res = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.error) {
      setError(
        "Magic link is unavailable (configure RESEND_API_KEY and EMAIL_FROM) or use OAuth / demo login.",
      );
      return;
    }
    setNotice("Check your email for the sign-in link.");
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    const res = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.error) {
      setError("Could not send a magic link. Add Resend env vars or sign in with Google / GitHub.");
      return;
    }
    setNotice("Check your email to finish signing up.");
  };

  const oauth = async (provider: "google" | "github") => {
    setOAuthLoading(provider);
    setError("");
    setNotice("");
    await signIn(provider, { callbackUrl: "/dashboard" });
    setOAuthLoading(null);
  };

  return (
    <>
      <nav aria-label="Back to home" className="relative z-1 px-5 py-4">
        <Link href="/">
          <Logo />
        </Link>
      </nav>

      <main id="main-content" className="relative z-1 flex flex-1 items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-8">
            <h1 className="mb-2 font-sans text-[28px] font-extrabold tracking-tighter">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-mm-text-sec">
              {isLogin
                ? "Sign in to access your bookmarks"
                : "Start organizing your internet for free"}
            </p>
          </div>

          {isLogin && (
            <div className="mb-[18px] border border-mm-secondary/20 bg-mm-secondary-subtle p-3">
              <div className="mb-2 flex items-center gap-[5px] text-[11px] font-bold uppercase tracking-wider text-mm-secondary">
                <Zap size={12} /> Demo credentials
              </div>
              <div className="grid grid-cols-2 gap-[6px]">
                {Object.entries(MOCK_USERS).map(([em, u]) => (
                  <button
                    type="button"
                    key={em}
                    onClick={() => {
                      setEmail(em);
                      setPass(u.password);
                      setError("");
                      setNotice("");
                    }}
                    className="flex flex-col items-start gap-[2px] border border-mm-border bg-mm-bg-input p-2 text-left transition-colors hover:border-mm-secondary/40"
                  >
                    <span className="text-[11px] font-bold text-mm-text">{u.name}</span>
                    <span className="font-mono text-[10px] text-mm-text-muted">{em}</span>
                    <span
                      className={`mt-[1px] text-[9px] font-bold uppercase tracking-wider ${u.plan === "pro" ? "text-mm-primary" : "text-mm-text-muted"}`}
                    >
                      {u.plan} plan
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLogin && (
            <>
              <form onSubmit={submitPassword} aria-label="Sign in with password">
                <Field
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={14} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Field
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  icon={<Lock size={14} />}
                  rightIcon={showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  onRightClick={() => setShowPass(!showPass)}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
                {error && (
                  <div
                    role="alert"
                    className="mb-3 border border-mm-error/20 bg-mm-error/[0.08] px-3 py-2 text-xs font-semibold text-mm-error"
                  >
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="mb-3 border border-mm-success/20 bg-mm-success/[0.08] px-3 py-2 text-xs font-semibold text-mm-success">
                    {notice}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 inline-flex w-full items-center justify-center gap-[6px] bg-white px-[13px] py-[13px] text-sm font-extrabold text-mm-bg shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-all hover:-translate-y-px hover:shadow-[6px_6px_0_rgba(0,0,0,0.5)] disabled:opacity-70"
                >
                  {loading ? "Please wait..." : "Sign In"}
                </button>
              </form>

              <form onSubmit={submitMagicLink} className="mt-3" aria-label="Email magic link">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-[6px] border border-mm-border bg-mm-bg-input px-3 py-3 text-[13px] font-bold text-mm-text-sec transition-all hover:border-mm-border-strong hover:text-mm-text disabled:opacity-70"
                >
                  {loading ? "Sending…" : "Email me a magic link"}
                </button>
              </form>
            </>
          )}

          {!isLogin && (
            <form onSubmit={submitSignup} aria-label="Sign up with email">
              <Field
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={14} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && (
                <div
                  role="alert"
                  className="mb-3 border border-mm-error/20 bg-mm-error/[0.08] px-3 py-2 text-xs font-semibold text-mm-error"
                >
                  {error}
                </div>
              )}
              {notice && (
                <div className="mb-3 border border-mm-success/20 bg-mm-success/[0.08] px-3 py-2 text-xs font-semibold text-mm-success">
                  {notice}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex w-full items-center justify-center gap-[6px] bg-white px-[13px] py-[13px] text-sm font-extrabold text-mm-bg shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition-all hover:-translate-y-px hover:shadow-[6px_6px_0_rgba(0,0,0,0.5)] disabled:opacity-70"
              >
                {loading ? "Sending…" : "Continue with email"}
              </button>
              <p className="mt-2 text-center text-[11px] text-mm-text-muted">
                We&apos;ll email you a link — no password needed. For demo passwords,{" "}
                <Link href="/login" className="font-bold text-mm-primary">
                  log in
                </Link>
                .
              </p>
            </form>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-mm-border" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mm-text-muted">
              or
            </span>
            <div className="h-px flex-1 bg-mm-border" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => oauth("google")}
              disabled={oAuthLoading !== null}
              className="inline-flex w-full items-center justify-center gap-[6px] border border-mm-border bg-mm-bg-input px-3 py-3 text-[13px] text-mm-text-sec transition-all hover:border-mm-border-strong hover:text-mm-text disabled:opacity-70"
            >
              {oAuthLoading === "google" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-mm-text-muted border-t-transparent" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Google">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {oAuthLoading === "google" ? "Connecting..." : "Continue with Google"}
            </button>

            <button
              type="button"
              onClick={() => oauth("github")}
              disabled={oAuthLoading !== null}
              className="inline-flex w-full items-center justify-center gap-[6px] border border-mm-border bg-mm-bg-input px-3 py-3 text-[13px] text-mm-text-sec transition-all hover:border-mm-border-strong hover:text-mm-text disabled:opacity-70"
            >
              {oAuthLoading === "github" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-mm-text-muted border-t-transparent" />
              ) : (
                <Github size={16} aria-hidden />
              )}
              {oAuthLoading === "github" ? "Connecting..." : "Continue with GitHub"}
            </button>
          </div>

          <p className="mt-6 text-center text-[13px] text-mm-text-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-bold text-mm-primary transition-opacity hover:opacity-80"
            >
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
