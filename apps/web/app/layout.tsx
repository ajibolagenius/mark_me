import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body style={{ background: "#0D0D0D", margin: 0 }}>{children}</body>
    </html>
  );
}
