/**
 * Builds and packages store-ready zips for both browsers into release/.
 *
 * Usage: pnpm package
 *
 * Builds go into release/.build-* (NOT dist/), so a running `pnpm dev`
 * watcher rebuilding dist/ can never race the zip step.
 *
 * - Chrome Web Store expects a zip with manifest.json at the zip root.
 * - AMO (addons.mozilla.org) expects the same layout; Mozilla signs it
 *   into an .xpi during review (or via `web-ext sign` for self-hosting).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const { version } = JSON.parse(readFileSync(resolve(root, "public/manifest.json"), "utf8"));

// Release builds must point at the production API, never a dev fallback.
// Override with VITE_API_URL=... pnpm package (e.g. for a staging build).
// Trailing slashes would bake double-slash URLs (`...app//extension-auth`)
// into the bundle and break the auth-bridge match pattern — strip them.
const apiUrl = (process.env.VITE_API_URL ?? "https://markme-app.vercel.app").replace(/\/+$/, "");
console.log(`Packaging v${version} against API: ${apiUrl}`);

const targets = [
  { name: "chrome", env: {} },
  { name: "firefox", env: { TARGET: "firefox" } },
];

mkdirSync(resolve(root, "release"), { recursive: true });

for (const { name, env } of targets) {
  const buildDir = `release/.build-${name}`;
  const src = resolve(root, buildDir);

  execSync("pnpm vite build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      ...env,
      NODE_ENV: "production",
      RELEASE: "1",
      VITE_API_URL: apiUrl,
      OUTDIR: buildDir,
    },
  });

  const required = [
    "manifest.json",
    "background.js",
    "popup.html",
    "newtab.html",
    "pages/popup.js",
    "pages/newtab.js",
    "content/auth-bridge.js",
    "fonts/plus-jakarta-sans-latin.woff2",
  ];
  const missing = required.filter((f) => !existsSync(resolve(src, f)));
  if (missing.length > 0) {
    console.error(`✗ ${buildDir}/ is missing ${missing.join(", ")}`);
    process.exit(1);
  }

  const zip = `markme-${name}-v${version}.zip`;
  const out = resolve(root, "release", zip);
  rmSync(out, { force: true });
  execSync(`zip -qr ${JSON.stringify(out)} .`, { cwd: src });
  console.log(`✓ release/${zip}`);
}
