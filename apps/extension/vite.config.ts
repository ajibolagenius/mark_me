import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type Plugin, defineConfig } from "vite";

// TARGET=firefox pnpm build  → dist-firefox/ with a Gecko-compatible manifest.
// Default (Chrome/Chromium)  → dist/ with the manifest as-is from public/.
const target = process.env.TARGET === "firefox" ? "firefox" : "chrome";
// OUTDIR override lets scripts/package.mjs build into isolated dirs so
// release zips never race a `pnpm dev` watcher writing to dist/.
const outDir = process.env.OUTDIR ?? (target === "firefox" ? "dist-firefox" : "dist");

/**
 * Firefox MV3 differences, applied to the copied manifest after build:
 * - background runs as an event page (`scripts`), not a service worker
 * - `browser_specific_settings.gecko.id` is required for signing/installing
 * - `externally_connectable` is unsupported (auth uses the content-script
 *   bridge instead), so drop it to avoid install warnings
 */
function firefoxManifest(): Plugin {
  return {
    name: "markme:firefox-manifest",
    apply: "build",
    closeBundle() {
      if (target !== "firefox") return;
      const path = resolve(__dirname, outDir, "manifest.json");
      const manifest = JSON.parse(readFileSync(path, "utf8"));

      manifest.background = { scripts: ["background.js"], type: "module" };
      manifest.externally_connectable = undefined;
      manifest.browser_specific_settings = {
        gecko: {
          id: "extension@markme.live",
          strict_min_version: "142.0",
          // Required for new AMO submissions: what the extension transmits.
          // Saved bookmarks (URLs/titles) and the account token go to the
          // user's own mark_me account — nothing else is collected.
          data_collection_permissions: {
            required: ["authenticationInfo", "bookmarksInfo"],
          },
        },
      };

      writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), firefoxManifest()],
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== "production",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        newtab: resolve(__dirname, "newtab.html"),
        background: resolve(__dirname, "src/background/service-worker.ts"),
        // Content script: must bundle to a single import-free classic script
        "auth-bridge": resolve(__dirname, "src/content/auth-bridge.ts"),
      },
      output: {
        // Predictable names so manifest.json references stay stable
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "auth-bridge") return "content/auth-bridge.js";
          return "pages/[name].js";
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // Prevent Vite from trying to inline chrome.* references
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
  },
});
