# @markme/extension

Browser extension for mark_me (Chrome/Chromium MV3 + Firefox MV3). Quick-save
bookmarks from any page, search them from the New Tab override.

## Requirements

- Node.js 22.x (built with v22.14.0)
- pnpm 10.12.4 (pinned via `packageManager` in the repo root `package.json`)
- macOS/Linux shell with the `zip` CLI (for packaging only)

## Build from source

From the **repository root** (the extension depends on the `@markme/*`
workspace packages, so install must run at the root):

```sh
pnpm install --frozen-lockfile
cd apps/extension
pnpm package
```

`pnpm package` (scripts/package.mjs) runs two production Vite builds and zips
them:

- `release/.build-chrome/`  → `release/markme-chrome-v<version>.zip`
- `release/.build-firefox/` → `release/markme-firefox-v<version>.zip`

The Firefox build differs only in its manifest (event-page background,
`browser_specific_settings.gecko`, no `externally_connectable`); the transform
lives in `vite.config.ts`. Release builds bake `VITE_API_URL`
(default `https://markme-app.vercel.app`) into the bundle and scope all
manifest origins to that URL. No other environment variables are required.

## Dev builds

```sh
pnpm build            # Chrome  → dist/       (load unpacked)
pnpm build:firefox    # Firefox → dist-firefox/ (about:debugging → Load Temporary Add-on)
pnpm dev              # Chrome build in watch mode
```

Dev builds keep localhost origins in the manifest and default the API to
`http://localhost:3000`.

## Source layout

- `src/popup/` — toolbar popup (save current tab)
- `src/newtab/` — New Tab page (clock, search, pinned/recent bookmarks)
- `src/background/service-worker.ts` — context menus, auth token storage,
  offline queue drain
- `src/content/auth-bridge.ts` — content script on the web app's
  `/extension-auth` page; relays the auth token to the background script
  (Firefox has no `externally_connectable`)
- `public/manifest.json` — Chrome manifest; the Firefox variant is generated
  at build time

Third-party code is unmodified npm dependencies (see `pnpm-lock.yaml`); the
bundled vendor chunk contains `react`, `react-dom`, `framer-motion`,
`@trpc/*`, `@tanstack/react-query`, `superjson`, `zod`, and `lucide-react`.
