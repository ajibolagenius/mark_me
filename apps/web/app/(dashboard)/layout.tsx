"use client";

import { Atmosphere, SkipLink } from "@markme/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if NextAuth is configured and user is definitively unauthenticated
    if (status === "unauthenticated" && process.env.NEXT_PUBLIC_AUTH_ENABLED === "true") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mm-bg font-sans text-mm-text">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-mm-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-mm-bg font-sans text-mm-text">
      <Atmosphere />
      <SkipLink />
      {children}
    </div>
  );
}
