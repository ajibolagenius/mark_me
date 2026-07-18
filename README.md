# mark_me

A visual bookmark manager — save, tag, and browse links in a masonry grid instead of a browser folder tree.

Includes a **Next.js** web app, a **Chrome extension** (popup + new tab), and shared packages for API, database, UI, and AI.

## Features

- Masonry categories with pins, tags, search, and sort
- Auth via **Neon Auth** (email/password + Google OAuth) stored in `neon_auth.*`
- App profile rows synced to `public.users` for bookmarks/categories
- Chrome extension: one-click save + new-tab dashboard
- AI assistant for tagging, summaries, and collection Q&A (Anthropic)
- Export / import JSON
- Shared neo-brutalist design system (`@markme/ui`)

## Monorepo layout

```
apps/
  web/          Next.js 15 app (App Router, tRPC, Neon Auth)
  extension/    Chrome extension (Vite + React)
packages/
  api/          tRPC routers & shared API types
  db/           Drizzle schema, migrations, seed
  ui/           Design tokens & shared React components
  ai/           Anthropic helpers
  config/       Shared TypeScript / tooling config
```

## Stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Web          | Next.js 15, React 19, Tailwind CSS v4       |
| API          | tRPC 11, TanStack Query, Zod                |
| Auth         | Neon Auth (Managed Better Auth)             |
| Database     | Neon Postgres + Drizzle ORM                 |
| Extension    | Vite, Chrome MV3                            |
| Tooling      | pnpm workspaces, Turborepo, Biome           |

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 10+
- A [Neon](https://console.neon.tech) Postgres project with **Neon Auth** enabled
- [Neon CLI](https://neon.com/docs/reference/neon-cli) (`neon` / `neonctl`) for project link and Auth config

## Setup

```bash
pnpm install
```

Link the Neon project and pull Auth/DB env (from repo root):

```bash
neon link --org-id <org> --project-id <project>
neon checkout production
# copies NEON_AUTH_BASE_URL, DATABASE_URL, etc. into .env.local
```

Copy into the web app and fill the cookie secret:

```bash
cp apps/web/.env.example apps/web/.env.local
# Set DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET (openssl rand -base64 32)
cp packages/db/.env.example packages/db/.env   # use direct (non-pooler) URL for migrations
```

Enable localhost for Neon Auth during development:

```bash
neon neon-auth domain allow-localhost enable --project-id <project>
```

### Database

```bash
pnpm --filter @markme/db db:push    # sync public schema
# After you sign up in the app once:
SEED_USER_ID=<your-neon-auth-user-uuid> pnpm --filter @markme/db db:seed
pnpm --filter @markme/db db:studio
```

### Auth

Sign-up / sign-in uses Neon Auth against `neon_auth.user`, `neon_auth.account`, `neon_auth.session`, and `neon_auth.verification`.

On each authenticated API request the app upserts a matching `public.users` row (same id) so bookmarks and categories stay owned by a real profile.

- **Email + password** — enabled on the Neon Auth branch
- **Google** — shared OAuth provider on Neon Auth (dev branding)

## Development

```bash
pnpm dev                  # turbo: web + packages
```

- Web: [http://localhost:3000](http://localhost:3000)
- Extension (watch build):

```bash
pnpm --filter @markme/extension dev
```

Load `apps/extension/dist` as an unpacked extension in `chrome://extensions`. Set `VITE_API_URL` to your web origin.

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `pnpm dev`        | Start turbo dev tasks      |
| `pnpm build`      | Build all packages & apps  |
| `pnpm lint`       | Lint via Biome (turbo)     |
| `pnpm type-check` | TypeScript across workspace|
| `pnpm format`     | Format with Biome          |
| `pnpm check`      | Biome check + write        |

## Design system

Tokens and shared UI live in [`packages/ui`](packages/ui). Brand accents are acid lime + punch rose on near-black, with sharp neo-brutalist surfaces (zero radius, hard offset shadows).

Import styles in apps:

```css
@import "@markme/ui/styles";
```

```ts
import { T, Logo, Atmosphere } from "@markme/ui";
```

## Deploy (Vercel)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Keep the default framework (Next.js). Install/build are set in [`apps/web/vercel.json`](apps/web/vercel.json) (`pnpm` + Turbo filter).
4. Add env vars from [`apps/web/.env.example`](apps/web/.env.example) (`DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, etc.).
5. Add your production domain as a Neon Auth trusted domain:

```bash
neon neon-auth domain add https://your-domain.com --project-id <project>
```

This repo uses **pnpm workspaces**. Do not commit a root `package-lock.json` — Vercel will pick npm, skip the workspace, and fail with “No Next.js version detected.”

## License

Private — all rights reserved.
