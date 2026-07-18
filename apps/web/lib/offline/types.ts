export type CategoryListItem = {
  id: string;
  name: string;
  color: number;
  icon: string;
  tags: string[];
  bookmarks: BookmarkListItem[];
};

export type BookmarkListItem = {
  id: string;
  categoryId: string;
  title: string;
  url: string;
  note?: string;
  tags: string[];
  pinned: boolean;
  addedAt: number;
};

export type LastUserSnapshot = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  plan: string;
  joinedAt: string;
};

export type OutboxProcedure =
  | "category.create"
  | "category.update"
  | "category.delete"
  | "bookmark.create"
  | "bookmark.update"
  | "bookmark.delete"
  | "bookmark.togglePin";

export type OutboxEntry = {
  id: string;
  procedure: OutboxProcedure;
  input: Record<string, unknown>;
  createdAt: number;
  /** Client-generated id used for optimistic creates so sync can remap. */
  clientId?: string;
};
