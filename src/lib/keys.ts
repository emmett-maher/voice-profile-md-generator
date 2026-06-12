import { importPKCS8 } from "jose";
import { createPublicKey, type KeyObject } from "node:crypto";

/**
 * The RS256 keypair that bridges Auth.js sessions to Convex: the Next.js
 * server signs short-lived JWTs with the private key, Convex validates them
 * against our JWKS endpoint. Generate with `npm run generate-keys`.
 */

export const CONVEX_AUTH_KID = "convex-auth-key";

function privateKeyPem(): string | null {
  const raw = process.env.CONVEX_AUTH_PRIVATE_KEY;
  if (!raw) return null;
  // .env files store the PEM on one line with literal \n sequences.
  return raw.replace(/\\n/g, "\n");
}

export async function getSigningKey() {
  const pem = privateKeyPem();
  if (!pem) return null;
  return await importPKCS8(pem, "RS256");
}

export function getPublicKeyObject(): KeyObject | null {
  const pem = privateKeyPem();
  if (!pem) return null;
  return createPublicKey({ key: pem, format: "pem" });
}

export function siteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}
