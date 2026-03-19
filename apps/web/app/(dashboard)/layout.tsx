"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Atmosphere, SkipLink } from "@markme/ui";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-mm-bg font-sans text-mm-text">
      <Atmosphere />
      <SkipLink />
      {children}
    </div>
  );
}
