import { spawnSync } from "node:child_process";
import path from "node:path";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: false,
  additionalPrecacheEntries: [
    { url: "/", revision },
    { url: "/~offline", revision },
  ],
});

const nextConfig: NextConfig = {
  transpilePackages: ["@markme/ui", "@markme/api", "@markme/db", "@markme/ai"],
  // Monorepo: include files outside apps/web in serverless traces
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Avoid picking a parent-directory lockfile as the Turbopack root
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons**" },
    ],
  },
};

export default withSerwist(nextConfig);
