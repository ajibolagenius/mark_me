import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== "production",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        newtab: resolve(__dirname, "newtab.html"),
        background: resolve(__dirname, "src/background/service-worker.ts"),
      },
      output: {
        // Predictable names so manifest.json references stay stable
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "pages/[name].js",
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
