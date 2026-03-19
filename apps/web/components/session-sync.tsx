"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@markme/ui";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

function applySessionToStore(session: Session | null | undefined, login: (user: User) => void) {
  const u = session?.user;
  if (!u) return;
  const email = u.email ?? "";
  if (!email) return;
  const plan = u.plan ?? "free";
  login({
    name: u.name?.trim() ? u.name : (email.split("@")[0] ?? "User"),
    email,
    plan,
    joinedAt: u.joinedAt ?? new Date().toISOString(),
    avatar: u.image ?? undefined,
  });
}

/** Keeps the legacy Zustand auth store aligned with NextAuth session. */
export function SessionSync() {
  const { data: session, status } = useSession();
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (status === "unauthenticated") {
      logout();
      return;
    }
    if (status === "authenticated") {
      applySessionToStore(session, login);
    }
  }, [status, session, login, logout]);

  return null;
}
