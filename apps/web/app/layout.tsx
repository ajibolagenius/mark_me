import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mark_me — Bookmark Manager",
  description:
    "Save, tag, and browse your bookmarks in a visual grid designed for humans.",
};

async function getSession() {
  try {
    const { auth } = await import("@/auth");
    return await auth();
  } catch {
    // Auth not configured (no DATABASE_URL) — render without session
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-mm-bg font-sans text-mm-text antialiased">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
