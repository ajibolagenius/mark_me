"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@markme/ui";
import { MOCK_USERS } from "@markme/ui";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

function applySessionToStore(
  session: Session | null | undefined,
  login: (user: User) => void,
) {
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

/** Keeps the legacy Zustand auth store aligned with NextAuth session.
 *  Falls back to demo user when auth isn't configured. */
export function SessionSync() {
  const { data: session, status } = useSession();
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (status === "authenticated") {
      applySessionToStore(session, login);
      return;
    }

    if (status === "unauthenticated") {
      // If no real auth is configured, auto-login with demo user for development
      // This allows the app to be visually testable without DATABASE_URL
      if (!currentUser) {
        const demoEntry = MOCK_USERS["demo@markme.io"];
        if (demoEntry) {
          login({
            name: demoEntry.name,
            email: "demo@markme.io",
            plan: demoEntry.plan,
            joinedAt: demoEntry.joinedAt,
          });
        }
      }
    }
  }, [status, session, login, logout, currentUser]);

  return null;
}
