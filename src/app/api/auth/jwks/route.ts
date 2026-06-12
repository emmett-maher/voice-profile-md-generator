import { exportJWK } from "jose";
import { CONVEX_AUTH_KID, getPublicKeyObject } from "@/lib/keys";

/** Public JWKS endpoint the Convex deployment uses to validate our JWTs. */
export async function GET() {
  const publicKey = getPublicKeyObject();
  if (!publicKey) {
    return Response.json({ error: "CONVEX_AUTH_PRIVATE_KEY not configured" }, { status: 503 });
  }
  const jwk = await exportJWK(publicKey);
  return Response.json(
    { keys: [{ ...jwk, alg: "RS256", use: "sig", kid: CONVEX_AUTH_KID }] },
    { headers: { "Cache-Control": "public, max-age=600" } },
  );
}
