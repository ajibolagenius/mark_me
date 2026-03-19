import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema/users";
import { categories } from "./schema/categories";
import { bookmarks } from "./schema/bookmarks";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

const now = Date.now();
const hoursAgo = (n: number) => new Date(now - n * 3600000);
const daysAgo = (n: number) => new Date(now - n * 86400000);

async function seed() {
  console.log("Seeding database...");

  const [demoUser] = await db
    .insert(users)
    .values({
      id: "seed-demo-user",
      email: "demo@markme.io",
      name: "Ajibola Genius",
      plan: "pro",
      createdAt: new Date("2025-11-14T00:00:00.000Z"),
    })
    .onConflictDoNothing()
    .returning();

  const [freeUser] = await db
    .insert(users)
    .values({
      id: "seed-free-user",
      email: "free@markme.io",
      name: "Free Tester",
      plan: "free",
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
    })
    .onConflictDoNothing()
    .returning();

  const userId = demoUser?.id ?? "seed-demo-user";

  const categoryData = [
    { id: "c1", name: "Design Inspiration", color: 0, emoji: "🎨", tags: ["design", "ui/ux"], position: 0 },
    { id: "c2", name: "Dev Tools", color: 1, emoji: "⚡", tags: ["dev", "tools"], position: 1 },
    { id: "c3", name: "Reading List", color: 5, emoji: "📚", tags: ["articles"], position: 2 },
    { id: "c4", name: "Productivity", color: 2, emoji: "🚀", tags: ["work", "apps"], position: 3 },
    { id: "c5", name: "Entertainment", color: 4, emoji: "🎬", tags: ["fun", "media"], position: 4 },
    { id: "c6", name: "AI & ML", color: 6, emoji: "🤖", tags: ["ai", "research"], position: 5 },
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
    { id: "b1", categoryId: "c1", title: "Dribbble", url: "https://dribbble.com", tags: ["design"], note: "Daily design inspiration", pinned: true, createdAt: daysAgo(2) },
    { id: "b2", categoryId: "c1", title: "Behance", url: "https://behance.net", tags: ["design"], note: "Portfolio showcase", pinned: false, createdAt: daysAgo(5) },
    { id: "b3", categoryId: "c1", title: "Awwwards", url: "https://awwwards.com", tags: ["ui/ux"], note: "Award-winning websites", pinned: false, createdAt: daysAgo(12) },
    { id: "b4", categoryId: "c2", title: "GitHub", url: "https://github.com", tags: ["dev"], note: "Code hosting", pinned: true, createdAt: hoursAgo(3) },
    { id: "b5", categoryId: "c2", title: "VS Code Web", url: "https://vscode.dev", tags: ["tools"], note: "Browser-based IDE", pinned: false, createdAt: daysAgo(1) },
    { id: "b6", categoryId: "c2", title: "CodePen", url: "https://codepen.io", tags: ["dev"], note: "Frontend playground", pinned: false, createdAt: daysAgo(7) },
    { id: "b7", categoryId: "c2", title: "Stack Overflow", url: "https://stackoverflow.com", tags: ["dev"], note: "Q&A for devs", pinned: false, createdAt: daysAgo(30) },
    { id: "b8", categoryId: "c3", title: "Medium", url: "https://medium.com", tags: ["articles"], note: "Blog platform", pinned: false, createdAt: daysAgo(3) },
    { id: "b9", categoryId: "c3", title: "Dev.to", url: "https://dev.to", tags: ["articles"], note: "Developer community", pinned: false, createdAt: daysAgo(14) },
    { id: "b10", categoryId: "c4", title: "Notion", url: "https://notion.so", tags: ["work"], note: "All-in-one workspace", pinned: true, createdAt: hoursAgo(1) },
    { id: "b11", categoryId: "c4", title: "Linear", url: "https://linear.app", tags: ["work"], note: "Issue tracking", pinned: false, createdAt: daysAgo(4) },
    { id: "b12", categoryId: "c4", title: "Figma", url: "https://figma.com", tags: ["apps"], note: "Design tool", pinned: false, createdAt: daysAgo(20) },
    { id: "b13", categoryId: "c5", title: "YouTube", url: "https://youtube.com", tags: ["media"], note: "Video platform", pinned: false, createdAt: daysAgo(6) },
    { id: "b14", categoryId: "c5", title: "Spotify", url: "https://spotify.com", tags: ["fun"], note: "Music streaming", pinned: false, createdAt: daysAgo(10) },
    { id: "b15", categoryId: "c6", title: "Hugging Face", url: "https://huggingface.co", tags: ["ai"], note: "ML models hub", pinned: true, createdAt: hoursAgo(6) },
    { id: "b16", categoryId: "c6", title: "Papers With Code", url: "https://paperswithcode.com", tags: ["research"], note: "ML papers + code", pinned: false, createdAt: daysAgo(8) },
    { id: "b17", categoryId: "c6", title: "Anthropic", url: "https://anthropic.com", tags: ["ai"], note: "AI safety", pinned: false, createdAt: daysAgo(15) },
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

  console.log(`Seeded ${categoryData.length} categories, ${bookmarkData.length} bookmarks for user ${userId}`);

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
