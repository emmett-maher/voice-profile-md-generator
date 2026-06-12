#!/usr/bin/env node
/**
 * Generates the RS256 keypair that bridges Auth.js sessions to Convex.
 * Prints a single-line CONVEX_AUTH_PRIVATE_KEY value ready for .env.
 */
import { generateKeyPairSync } from "node:crypto";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const oneLine = pem.trim().replace(/\n/g, "\\n");

console.log("Add this line to your .env file:\n");
console.log(`CONVEX_AUTH_PRIVATE_KEY="${oneLine}"`);
console.log(
  "\nThe matching public key is served automatically at /api/auth/jwks — no separate value needed.",
);
