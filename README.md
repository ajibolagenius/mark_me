# mark_me

A visual bookmark manager — save, tag, and browse links in a masonry grid instead of a browser folder tree.

Includes a **Next.js** web app, a **Chrome extension** (popup + new tab), and shared packages for API, database, UI, and AI.

## Features

- Masonry categories with pins, tags, search, and sort
- Auth via Auth.js (credentials, Google/GitHub OAuth, magic links)
- Chrome extension: one-click save + new-tab dashboard
- AI assistant for tagging, summaries, and collection Q&A (Anthropic)
- Export / import JSON
- Shared neo-brutalist design system (`@markme/ui`)

## Monorepo layout

```
apps/
  web/          Next.js 15 app (App Router, tRPC, Auth.js)
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
| Auth         | Auth.js (NextAuth v5)                       |
| Database     | PostgreSQL + Drizzle ORM                    |
| Extension    | Vite, Chrome MV3                            |
| Tooling      | pnpm workspaces, Turborepo, Biome           |

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 10+
- PostgreSQL (local or hosted, e.g. Supabase / Neon)

## Setup

```bash
pnpm install
```

Copy env templates and fill in values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
cp apps/extension/.env.example apps/extension/.env
```

Minimum for local web + DB:

- `DATABASE_URL` in `apps/web/.env.local` and `packages/db/.env`
- `AUTH_SECRET` (or leave unset in dev — see `apps/web/.env.example`)
- `AUTH_URL` / `NEXTAUTH_URL` → `http://localhost:3000`

Optional: OAuth keys, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `EXTENSION_TOKEN_SECRET`.

### Database

```bash
pnpm --filter @markme/db db:push    # sync schema
pnpm --filter @markme/db db:seed    # optional demo data
pnpm --filter @markme/db db:studio  # Drizzle Studio
```

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

### Demo login (UI)

When using the in-app mock credentials surface:

| Email            | Password  | Plan |
| ---------------- | --------- | ---- |
| `demo@markme.io` | `mark_me1`| Pro  |
| `free@markme.io` | `test123` | Free |

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

## License

Private — all rights reserved.
