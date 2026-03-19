import { users } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { updateProfileSchema } from "../schemas/user";
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.session.userId))
      .limit(1);
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl ?? row.image,
      plan: row.plan,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }),

  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ ctx, input }) => {
    if (input.email) {
      const taken = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (taken[0] && taken[0].id !== ctx.session.userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }
    }

    const patch: Partial<{
      name: string;
      email: string;
      avatarUrl: string | null;
    }> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.email !== undefined) patch.email = input.email;
    if (input.avatarUrl !== undefined) patch.avatarUrl = input.avatarUrl;

    if (Object.keys(patch).length === 0) {
      const [row] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.session.userId))
        .limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatarUrl ?? row.image,
        plan: row.plan,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }

    await ctx.db.update(users).set(patch).where(eq(users.id, ctx.session.userId));

    const [row] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.session.userId))
      .limit(1);
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl ?? row.image,
      plan: row.plan,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(users).where(eq(users.id, ctx.session.userId));
    return { ok: true as const };
  }),
});
