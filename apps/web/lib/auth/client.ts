"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/** Browser Neon Auth client (Better Auth API + `useSession`). */
export const authClient = createAuthClient();
