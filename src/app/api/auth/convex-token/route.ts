import { SignJWT } from "jose";
import { auth } from "@/auth";
import { CONVEX_AUTH_KID, getSigningKey, siteUrl } from "@/lib/keys";

/**
 * Mints a short-lived RS256 JWT for the signed-in user. The Convex deployment
 * validates it against /api/auth/jwks (see convex/auth.config.ts), so all
 * authorization decisions happen server-side against a verified identity.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? session?.user?.email;
  if (!session?.user || !userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  const key = await getSigningKey();
  if (!key) {
    return Response.json({ error: "CONVEX_AUTH_PRIVATE_KEY not configured" }, { status: 503 });
  }
  const token = await new SignJWT({
    email: session.user.email ?? undefined,
    name: session.user.name ?? undefined,
  })
    .setProtectedHeader({ alg: "RS256", kid: CONVEX_AUTH_KID })
    .setSubject(userId)
    .setAudience("convex")
    .setIssuer(siteUrl())
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  return Response.json({ token });
}
