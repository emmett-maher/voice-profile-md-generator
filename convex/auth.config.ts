/**
 * Convex validates the JWT minted by the Next.js app (Auth.js session →
 * /api/auth/convex-token, RS256). SITE_URL must be set in the Convex
 * deployment's environment variables and point at the Next.js app.
 */
export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "convex",
      issuer: process.env.SITE_URL ?? "http://localhost:3000",
      jwks: `${process.env.SITE_URL ?? "http://localhost:3000"}/api/auth/jwks`,
      algorithm: "RS256",
    },
  ],
};
