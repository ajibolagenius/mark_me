import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getPostgresConnectionOptions } from "./postgres-connection-options";
import { users } from "./schema/users";
import { categories } from "./schema/categories";
import { bookmarks } from "./schema/bookmarks";
import { eq } from "drizzle-orm";

/**
 * Optional sample data for an existing app user.
 * Usage: SEED_USER_ID=<neon-auth-user-uuid> pnpm --filter @markme/db db:seed
 *
 * Create the user first via the app (Neon Auth sign-up), then seed bookmarks.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env");
  process.exit(1);
}

const userId = process.env.SEED_USER_ID?.trim();
if (!userId) {
  console.error(
    "SEED_USER_ID is required. Sign up in the app (Neon Auth), then run:\n  SEED_USER_ID=<uuid> pnpm --filter @markme/db db:seed",
  );
  process.exit(1);
}

const client = postgres(connectionString, getPostgresConnectionOptions(connectionString));
const db = drizzle(client);

const now = Date.now();
const hoursAgo = (n: number) => new Date(now - n * 3600000);
const daysAgo = (n: number) => new Date(now - n * 86400000);

async function seed() {
  console.log("Seeding sample bookmarks for user", userId);

  const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!existing) {
    console.error(
      `No public.users row for ${userId}. Sign in once so Neon Auth can provision the app user, then re-run seed.`,
    );
    process.exit(1);
  }

  const categoryData = [
    { id: `seed-c1-${userId.slice(0, 8)}`, name: "Design Inspiration", color: 0, emoji: "🎨", tags: ["design", "ui/ux"], position: 0 },
    { id: `seed-c2-${userId.slice(0, 8)}`, name: "Dev Tools", color: 1, emoji: "⚡", tags: ["dev", "tools"], position: 1 },
    { id: `seed-c3-${userId.slice(0, 8)}`, name: "Reading List", color: 5, emoji: "📚", tags: ["articles"], position: 2 },
  ] as const;

  await db
    .insert(categories)
    .values(
      categoryData.map((c) => ({
        id: c.id,
        userId,
        name: c.name,
        color: c.color,
        emoji: c.emoji,
        tags: [...c.tags],
        position: c.position,
      })),
    )
    .onConflictDoNothing();

  const bookmarkData = [
    { id: `seed-b1-${userId.slice(0, 8)}`, categoryId: categoryData[0].id, title: "Dribbble", url: "https://dribbble.com", tags: ["design"], note: "Daily design inspiration", pinned: true, createdAt: daysAgo(2) },
    { id: `seed-b2-${userId.slice(0, 8)}`, categoryId: categoryData[0].id, title: "Behance", url: "https://behance.net", tags: ["design"], note: "Portfolio showcase", pinned: false, createdAt: daysAgo(5) },
    { id: `seed-b3-${userId.slice(0, 8)}`, categoryId: categoryData[1].id, title: "GitHub", url: "https://github.com", tags: ["dev"], note: "Code hosting", pinned: true, createdAt: hoursAgo(3) },
    { id: `seed-b4-${userId.slice(0, 8)}`, categoryId: categoryData[1].id, title: "VS Code Web", url: "https://vscode.dev", tags: ["tools"], note: "Browser-based IDE", pinned: false, createdAt: daysAgo(1) },
    { id: `seed-b5-${userId.slice(0, 8)}`, categoryId: categoryData[2].id, title: "Medium", url: "https://medium.com", tags: ["articles"], note: "Blog platform", pinned: false, createdAt: daysAgo(3) },
  ];

  await db
    .insert(bookmarks)
    .values(
      bookmarkData.map((b) => ({
        id: b.id,
        categoryId: b.categoryId,
        userId,
        url: b.url,
        title: b.title,
        note: b.note,
        tags: b.tags,
        pinned: b.pinned,
        createdAt: b.createdAt,
      })),
    )
    .onConflictDoNothing();

  console.log(`Seeded ${categoryData.length} categories, ${bookmarkData.length} bookmarks`);
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
