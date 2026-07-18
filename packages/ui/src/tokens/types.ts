export interface Bookmark {
    id: string;
    /** Present when data comes from the API (e.g. search grouping). */
    categoryId?: string;
    title: string;
    url: string;
    tags: string[];
    note?: string;
    pinned?: boolean;
    addedAt: number;
}

export interface Category {
    id: string;
    name: string;
    color: number;
    icon: string;
    tags: string[];
    bookmarks: Bookmark[];
}

export interface User {
    email: string;
    name: string;
    plan: "free" | "pro" | "team";
    joinedAt: string;
    avatar?: string;
    bio?: string;
}

export interface MockUserEntry {
    password: string;
    name: string;
    plan: "free" | "pro" | "team";
    joinedAt: string;
}

export interface AppStats {
    cats: number;
    bms: number;
    pinned: number;
    tags: number;
}
