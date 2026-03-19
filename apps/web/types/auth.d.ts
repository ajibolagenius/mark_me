import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      plan: "free" | "pro" | "team";
      joinedAt?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: "free" | "pro" | "team";
    joinedAt?: string;
  }
}
