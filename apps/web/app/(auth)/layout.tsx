"use client";

import type { ReactNode } from "react";
import { Atmosphere, SkipLink } from "@markme/ui";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-mm-bg font-sans text-mm-text">
      <Atmosphere />
      <SkipLink />
      {children}
    </div>
  );
}
