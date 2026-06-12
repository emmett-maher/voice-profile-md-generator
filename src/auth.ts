import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

/**
 * Auth.js with the Google provider. In demo mode (no keys) this module still
 * loads safely — the provider list is empty and nothing ever calls auth() —
 * so a fresh clone boots without configuration.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "demo-mode-placeholder-secret-never-used-for-sessions",
  trustHost: true,
  session: { strategy: "jwt" },
  providers: googleConfigured ? [Google] : [],
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
