import type { Category, MockUserEntry } from "./types";

const _now = Date.now();
const _h = (n: number) => _now - n * 3600000;
const _d = (n: number) => _now - n * 86400000;

export const DEMO_DATA: Category[] = [
  {
    id: "c1",
    name: "Design Inspiration",
    color: 0,
    icon: "🎨",
    tags: ["design", "ui/ux"],
    bookmarks: [
      { id: "b1", title: "Dribbble", url: "https://dribbble.com", tags: ["design"], note: "Daily design inspiration", pinned: true, addedAt: _d(2) },
      { id: "b2", title: "Behance", url: "https://behance.net", tags: ["design"], note: "Portfolio showcase", addedAt: _d(5) },
      { id: "b3", title: "Awwwards", url: "https://awwwards.com", tags: ["ui/ux"], note: "Award-winning websites", addedAt: _d(12) },
    ],
  },
  {
    id: "c2",
    name: "Dev Tools",
    color: 1,
    icon: "⚡",
    tags: ["dev", "tools"],
    bookmarks: [
      { id: "b4", title: "GitHub", url: "https://github.com", tags: ["dev"], note: "Code hosting", pinned: true, addedAt: _h(3) },
      { id: "b5", title: "VS Code Web", url: "https://vscode.dev", tags: ["tools"], note: "Browser-based IDE", addedAt: _d(1) },
      { id: "b6", title: "CodePen", url: "https://codepen.io", tags: ["dev"], note: "Frontend playground", addedAt: _d(7) },
      { id: "b7", title: "Stack Overflow", url: "https://stackoverflow.com", tags: ["dev"], note: "Q&A for devs", addedAt: _d(30) },
    ],
  },
  {
    id: "c3",
    name: "Reading List",
    color: 5,
    icon: "📚",
    tags: ["articles"],
    bookmarks: [
      { id: "b8", title: "Medium", url: "https://medium.com", tags: ["articles"], note: "Blog platform", addedAt: _d(3) },
      { id: "b9", title: "Dev.to", url: "https://dev.to", tags: ["articles"], note: "Developer community", addedAt: _d(14) },
    ],
  },
  {
    id: "c4",
    name: "Productivity",
    color: 2,
    icon: "🚀",
    tags: ["work", "apps"],
    bookmarks: [
      { id: "b10", title: "Notion", url: "https://notion.so", tags: ["work"], note: "All-in-one workspace", pinned: true, addedAt: _h(1) },
      { id: "b11", title: "Linear", url: "https://linear.app", tags: ["work"], note: "Issue tracking", addedAt: _d(4) },
      { id: "b12", title: "Figma", url: "https://figma.com", tags: ["apps"], note: "Design tool", addedAt: _d(20) },
    ],
  },
  {
    id: "c5",
    name: "Entertainment",
    color: 4,
    icon: "🎬",
    tags: ["fun", "media"],
    bookmarks: [
      { id: "b13", title: "YouTube", url: "https://youtube.com", tags: ["media"], note: "Video platform", addedAt: _d(6) },
      { id: "b14", title: "Spotify", url: "https://spotify.com", tags: ["fun"], note: "Music streaming", addedAt: _d(10) },
    ],
  },
  {
    id: "c6",
    name: "AI & ML",
    color: 6,
    icon: "🤖",
    tags: ["ai", "research"],
    bookmarks: [
      { id: "b15", title: "Hugging Face", url: "https://huggingface.co", tags: ["ai"], note: "ML models hub", pinned: true, addedAt: _h(6) },
      { id: "b16", title: "Papers With Code", url: "https://paperswithcode.com", tags: ["research"], note: "ML papers + code", addedAt: _d(8) },
      { id: "b17", title: "Anthropic", url: "https://anthropic.com", tags: ["ai"], note: "AI safety", addedAt: _d(15) },
    ],
  },
];

export const MOCK_USERS: Record<string, MockUserEntry> = {
  "demo@markme.io": { password: "mark_me1", name: "Ajibola Genius", plan: "pro", joinedAt: "2025-11-14T00:00:00.000Z" },
  "free@markme.io": { password: "test123", name: "Free Tester", plan: "free", joinedAt: "2026-02-01T00:00:00.000Z" },
};
