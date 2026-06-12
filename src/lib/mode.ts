/**
 * Credentials-only handoff: with all keys present the app runs the full
 * Convex-backed flow; with any missing it boots into clearly labelled demo
 * mode (seeded personas + replayable recorded synthesis runs).
 *
 * Server-side only — reads process.env.
 */

export const FULL_MODE_ENV_VARS = [
  "NEXT_PUBLIC_CONVEX_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "CONVEX_AUTH_PRIVATE_KEY",
] as const;

export interface AppModeInfo {
  mode: "demo" | "full";
  missing: string[];
}

export function getAppMode(): AppModeInfo {
  const missing = FULL_MODE_ENV_VARS.filter((key) => !process.env[key]);
  return missing.length === 0 ? { mode: "full", missing: [] } : { mode: "demo", missing: [...missing] };
}
