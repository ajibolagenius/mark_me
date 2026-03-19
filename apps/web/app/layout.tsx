import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-mm-bg font-sans text-mm-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
