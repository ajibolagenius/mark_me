"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Atmosphere, SkipLink } from "@markme/ui";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const user = useAuthStore((s) => s.user);

  if (status === "loading" || (status === "authenticated" && !user)) {
    return null;
  }

  if (status === "unauthenticated" || !user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-mm-bg font-sans text-mm-text">
      <Atmosphere />
      <SkipLink />
      {children}
    </div>
  );
}
