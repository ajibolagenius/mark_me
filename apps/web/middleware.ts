import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  // When AUTH_SECRET is configured, use NextAuth middleware for protected routes
  const hasAuth =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();

  if (!hasAuth) {
    // No auth configured — allow all routes (dev mode with mock auth)
    return NextResponse.next();
  }

  try {
    const { default: NextAuth } = await import("next-auth");
    const { authConfig } = await import("./auth.config");
    const authMiddleware = NextAuth(authConfig).auth;
    // @ts-expect-error — NextAuth middleware type mismatch
    return authMiddleware(req);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/newtab", "/newtab/:path*"],
};
