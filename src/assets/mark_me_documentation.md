**mark_me**

Product Documentation

Feature Specification | Pricing Matrix | Tech Stack

Version 1.0 - March 2026

**Confidential**

# **1\. Test Accounts**

The following mock accounts are pre-configured in the application for testing purposes. On the login page, click any account card to auto-fill the credentials.

| **Name**           | **Email**        | **Password** | **Plan** | **Role**       |
| ------------------ | ---------------- | ------------ | -------- | -------------- |
| **Ajibola Genius** | <demo@markme.io> | mark_me1     | **PRO**  | Primary tester |
| **Free Tester**    | <free@markme.io> | test123      | **FREE** | Limit testing  |

**How to test:**

- Navigate to the Login page (click "Log in" on the landing page)
- The demo account (<demo@markme.io>) is pre-filled automatically
- Click a different account card to switch credentials
- Click "Sign In" - you'll be logged in with that account's plan and profile
- Any other email/password (6+ chars) creates a new Free account on the fly

# **2\. Pricing Tier Feature Matrix**

Features are grouped into five functional categories. Each tier inherits all features from the tier below it.

## **2.1 Core Bookmark Management**

| **Feature**                              | **Free** | **Pro**       | **Team**      |
| ---------------------------------------- | -------- | ------------- | ------------- |
| Create / edit / delete categories        | **✓**    | **✓**         | **✓**         |
| Add / edit / delete bookmarks with notes | **✓**    | **✓**         | **✓**         |
| Tag system (category + bookmark level)   | **✓**    | **✓**         | **✓**         |
| Pin bookmarks to top of category         | **✓**    | **✓**         | **✓**         |
| Masonry bento grid layout                | **✓**    | **✓**         | **✓**         |
| Search with debounced filtering          | **✓**    | **✓**         | **✓**         |
| Sort controls (A-Z, count, newest)       | **✓**    | **✓**         | **✓**         |
| Tag filter bar                           | **✓**    | **✓**         | **✓**         |
| Favicon auto-fetch with fallback         | **✓**    | **✓**         | **✓**         |
| Export / Import JSON backup              | **✓**    | **✓**         | **✓**         |
| Category limit                           | 5        | **Unlimited** | **Unlimited** |
| Bookmark limit                           | 100      | **Unlimited** | **Unlimited** |

## **2.2 UI / UX Polish**

| **Feature**                           | **Free** | **Pro** | **Team** |
| ------------------------------------- | -------- | ------- | -------- |
| Page transition crossfades            | ✓        | **✓**   | **✓**    |
| Spring card entrance animations       | ✓        | **✓**   | **✓**    |
| Smooth expand / collapse accordion    | ✓        | **✓**   | **✓**    |
| Animated stat counters                | ✓        | **✓**   | **✓**    |
| Delete confirmation + undo toast (5s) | ✓        | **✓**   | **✓**    |
| Bottom sheet modals on mobile         | ✓        | **✓**   | **✓**    |
| Swipe-to-delete on bookmarks          | ✓        | **✓**   | **✓**    |
| Pull-to-refresh on dashboard          | ✓        | **✓**   | **✓**    |
| Mobile FAB (floating action button)   | ✓        | **✓**   | **✓**    |
| Link preview tooltip on hover         | -        | **✓**   | **✓**    |
| Relative timestamps on bookmarks      | -        | **✓**   | **✓**    |
| Bookmark count + pinned count badges  | -        | **✓**   | **✓**    |

## **2.3 Accessibility & Performance**

| **Feature**                              | **Free** | **Pro** | **Team** |
| ---------------------------------------- | -------- | ------- | -------- |
| Full keyboard navigation (Tab/Enter/Esc) | ✓        | **✓**   | **✓**    |
| Focus trap in modals + overlays          | ✓        | **✓**   | **✓**    |
| ARIA labels on all interactive elements  | ✓        | **✓**   | **✓**    |
| Skip-to-content link                     | ✓        | **✓**   | **✓**    |
| Focus-visible ring styling               | ✓        | **✓**   | **✓**    |
| Error boundaries (per page + grid)       | ✓        | **✓**   | **✓**    |
| Virtualized masonry grid                 | -        | **✓**   | **✓**    |
| Debounced search (150ms)                 | -        | **✓**   | **✓**    |
| React.memo on CatCard                    | -        | **✓**   | **✓**    |
| Search match highlighting                | -        | **✓**   | **✓**    |

## **2.4 Chrome Extension & Sync**

| **Feature**                          | **Free** | **Pro** | **Team** |
| ------------------------------------ | -------- | ------- | -------- |
| Chrome extension (save bookmarks)    | -        | **✓**   | **✓**    |
| New Tab override (clock + shortcuts) | -        | **✓**   | **✓**    |
| New Tab search across all bookmarks  | -        | **✓**   | **✓**    |
| Pinned shortcuts on New Tab          | -        | **✓**   | **✓**    |
| Recently added grid on New Tab       | -        | **✓**   | **✓**    |
| Firebase cloud sync & backup         | -        | **✓**   | **✓**    |
| Cross-device sync (real-time)        | -        | **✓**   | **✓**    |
| Auto-import from browser bookmarks   | -        | -       | **✓**    |

## **2.5 AI & Advanced Features**

| **Feature**                         | **Free** | **Pro** | **Team**  |
| ----------------------------------- | -------- | ------- | --------- |
| AI assistant panel (Claude-powered) | -        | **✓**   | **✓**     |
| AI auto-tagging suggestions         | -        | **✓**   | **✓**     |
| AI category summarization           | -        | **✓**   | **✓**     |
| AI duplicate detection              | -        | **✓**   | **✓**     |
| AI reorganization suggestions       | -        | **✓**   | **✓**     |
| AI queries per day                  | -        | 50      | Unlimited |
| Bio website generator (link-in-bio) | -        | -       | **✓**     |
| Shared team workspaces              | -        | -       | **✓**     |
| Admin dashboard & roles             | -        | -       | **✓**     |
| REST API access                     | -        | -       | **✓**     |
| Priority support                    | -        | **✓**   | **✓**     |
| Dedicated support channel           | -        | -       | **✓**     |

## **2.6 Pricing Summary**

|                    | **Free**      | **Pro**           | **Team**                |
| ------------------ | ------------- | ----------------- | ----------------------- |
| **Monthly price**  | \$0 / forever | **\$5 / month**   | **\$12 / user / month** |
| **Annual price**   | \$0 / forever | **\$4 / month**   | **\$9 / user / month**  |
| **Annual savings** | -             | **20% (\$12/yr)** | **25% (\$36/yr)**       |
| **Free trial**     | N/A           | 14 days           | 14 days                 |

# **3\. Recommended Tech Stack**

The following technology choices are recommended for building mark_me as a production-grade, scalable SaaS product across web, extension, and mobile.

## **3.1 Frontend (Web App)**

| **Layer**            | **Technology**                     | **Rationale**                                                                                 |
| -------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| **Framework**        | **Next.js 15 (App Router)**        | SSR/SSG, file-based routing, server actions, edge middleware, built-in image optimization     |
| **Language**         | **TypeScript 5.x**                 | Type safety across the full stack, better DX, IDE autocompletion, refactoring confidence      |
| **UI Library**       | **React 19**                       | Concurrent rendering, server components, Suspense for data fetching, hooks-first architecture |
| **Styling**          | **Tailwind CSS 4 + CSS Variables** | Utility-first, matches the design token system, JIT compilation, no runtime overhead          |
| **Animation**        | **Framer Motion 11**               | Declarative spring animations, layout animations, gesture support (replaces custom hooks)     |
| **State Management** | **Zustand + React Query**          | Zustand for client state (UI, auth), React Query for server state (bookmarks, categories)     |
| **Forms**            | **React Hook Form + Zod**          | Performant form handling with schema-based validation, zero re-renders                        |
| **Icons**            | **Lucide React**                   | Tree-shakeable, consistent stroke-width, matches the design system's icon style               |
| **Rich Text**        | **Tiptap (for notes)**             | ProseMirror-based, extensible, markdown shortcuts for bookmark notes                          |

## **3.2 Backend & API**

| **Layer**          | **Technology**                   | **Rationale**                                                                                      |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Runtime**        | **Node.js 22 (LTS)**             | JavaScript everywhere, excellent async I/O, largest package ecosystem                              |
| **API Framework**  | **Next.js API Routes / tRPC**    | Co-located with frontend, end-to-end type safety with tRPC, auto-generated client                  |
| **Authentication** | **NextAuth.js v5 (Auth.js)**     | Google/GitHub OAuth, email magic links, session management, JWT + database sessions                |
| **Database**       | **PostgreSQL 16 (via Supabase)** | Relational integrity for bookmark/category/tag relationships, full-text search, row-level security |
| **ORM**            | **Drizzle ORM**                  | Type-safe SQL queries, zero overhead, migrations, edge runtime compatible                          |
| **Caching**        | **Redis (Upstash)**              | Session cache, rate limiting, AI response cache, real-time pub/sub for sync                        |
| **File Storage**   | **Supabase Storage / S3**        | User avatars, bookmark screenshots, export files, CDN delivery                                     |
| **Search**         | **PostgreSQL FTS + pg_trgm**     | Full-text search with trigram fuzzy matching, no external service needed initially                 |

## **3.3 AI Integration**

| **Layer**               | **Technology**                       | **Rationale**                                                                               |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| **LLM Provider**        | **Anthropic Claude API**             | Best-in-class reasoning for categorization, Sonnet 4 for speed, Opus 4 for complex analysis |
| **SDK**                 | **Anthropic TypeScript SDK**         | Official SDK, streaming support, tool use for structured output (tag arrays, categories)    |
| **Prompt Pipeline**     | **Server-side w/ context injection** | Inject user's full bookmark graph as structured context, cache system prompts per user      |
| **Auto-tagging**        | **Claude + Tool Use**                | Structured output via tool_use to return JSON tag arrays, validated with Zod                |
| **Rate Limiting**       | **Upstash Redis**                    | Per-user daily limits (50 Free, unlimited Pro), token bucket algorithm                      |
| **Embeddings (future)** | **Voyage AI / Cohere**               | Semantic similarity for duplicate detection, related bookmark suggestions                   |

## **3.4 Chrome Extension**

| **Layer**            | **Technology**            | **Rationale**                                                                |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| **Manifest**         | **Chrome MV3**            | Required for Chrome Web Store, service workers, declarativeNetRequest        |
| **UI Framework**     | **React 19 + Vite**       | Shared components with web app, fast HMR during development                  |
| **Popup**            | **React (280px width)**   | Quick-save current tab, one-click tag + categorize                           |
| **New Tab Override** | **React full-page**       | Clock, search, pinned shortcuts, recent bookmarks - shared component library |
| **Background**       | **Service Worker (MV3)**  | Bookmark listener, context menu integration, sync orchestrator               |
| **Storage**          | **chrome.storage.sync**   | Cross-device extension settings, last sync timestamp, offline queue          |
| **Auth**             | **OAuth2 token exchange** | Share session with web app via secure token handoff                          |
| **Build**            | **CRXJS Vite Plugin**     | Hot reload in dev, auto-manifest generation, output for Chrome Web Store     |

## **3.5 Mobile App (Future)**

| **Layer**      | **Technology**                    | **Rationale**                                                                    |
| -------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| **Framework**  | **React Native 0.76+ (New Arch)** | Shared business logic with web, Fabric renderer, TurboModules for native perf    |
| **Navigation** | **Expo Router v4**                | File-based routing (matches Next.js mental model), deep linking, universal links |
| **UI Kit**     | **Tamagui / NativeWind**          | Tailwind-compatible styling on native, shared design tokens with web             |
| **Storage**    | **MMKV (via react-native-mmkv)**  | 10x faster than AsyncStorage, synchronous reads, encrypted storage for tokens    |
| **Sharing**    | **Share Extension (iOS/Android)** | Save bookmarks from any app's share sheet into mark_me                           |
| **Push**       | **Expo Notifications + FCM**      | Sync status alerts, shared bookmark notifications for teams                      |

## **3.6 Infrastructure & DevOps**

| **Layer**         | **Technology**                | **Rationale**                                                                         |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| **Hosting**       | **Vercel (Web + API)**        | Zero-config Next.js deployment, edge functions, preview deploys per PR, analytics     |
| **Database Host** | **Supabase (PostgreSQL)**     | Managed Postgres, built-in auth (backup), real-time subscriptions, row-level security |
| **CDN**           | **Vercel Edge Network**       | Global edge caching, automatic image optimization, <50ms TTFB worldwide               |
| **CI/CD**         | **GitHub Actions**            | PR checks (lint, type-check, test), preview deploys, automated releases               |
| **Monitoring**    | **Sentry + Vercel Analytics** | Error tracking with source maps, Web Vitals, custom event tracking                    |
| **Payments**      | **Stripe**                    | Subscription management, usage-based billing, customer portal, webhook events         |
| **Email**         | **Resend**                    | Transactional emails (welcome, password reset, export ready), React Email templates   |
| **Domain**        | **Cloudflare (DNS + WAF)**    | DNS management, DDoS protection, SSL, edge rules                                      |
| **Testing**       | **Vitest + Playwright**       | Unit tests (Vitest, 10x faster than Jest), E2E tests (Playwright, cross-browser)      |
| **Linting**       | **Biome**                     | All-in-one linter + formatter, 100x faster than ESLint + Prettier                     |

## **3.7 Architecture Diagram (High-Level)**

User → Vercel Edge (Next.js SSR) → tRPC API Routes → Supabase (PostgreSQL + Auth + Storage)

Chrome Extension → OAuth token exchange → Same API Routes → Same Database

AI Panel → Server Route → Anthropic Claude API → Structured response → Client

Mobile App → Expo + React Native → Same tRPC API → Same Database

All clients share the same API layer, database, and authentication system. The frontend component library (React) is shared between web, extension new tab, and mobile via a monorepo structure.

## **3.8 Monorepo Structure**

**Recommended: Turborepo + pnpm workspaces**

apps/web - Next.js web application

apps/extension - Chrome MV3 extension (Vite + CRXJS)

apps/mobile - React Native app (Expo)

packages/ui - Shared React components (design system)

packages/db - Drizzle schema, migrations, queries

packages/api - tRPC router definitions

packages/ai - Anthropic integration, prompt templates

packages/config - Shared ESLint, TypeScript, Tailwind configs
