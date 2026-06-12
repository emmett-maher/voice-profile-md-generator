import type { Auth } from "convex/server";

/**
 * Server-enforced ownership. Every public query/mutation resolves the caller
 * from the validated JWT — never from client-supplied arguments — and every
 * document access filters or asserts on that userId.
 */
export async function requireUserId(ctx: { auth: Auth }): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

export async function requireIdentity(ctx: { auth: Auth }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export function assertOwner(doc: { userId: string } | null, userId: string): void {
  // Treat "not yours" identically to "not found" so the API leaks nothing.
  if (!doc || doc.userId !== userId) {
    throw new Error("Not found");
  }
}
