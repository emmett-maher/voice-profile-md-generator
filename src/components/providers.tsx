"use client";

import { useCallback, useMemo, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";

/**
 * Full-mode providers: Auth.js session + Convex reactive client. Convex
 * authenticates with the RS256 JWT minted at /api/auth/convex-token, so every
 * Convex function sees a server-verified identity.
 */
export function FullModeProviders({
  convexUrl,
  children,
}: {
  convexUrl: string;
  children: React.ReactNode;
}) {
  const [client] = useState(() => new ConvexReactClient(convexUrl));
  return (
    <SessionProvider>
      <ConvexProviderWithAuth client={client} useAuth={useAuthFromNextAuth}>
        {children}
      </ConvexProviderWithAuth>
    </SessionProvider>
  );
}

function useAuthFromNextAuth() {
  const { status } = useSession();
  const fetchAccessToken = useCallback(async () => {
    const res = await fetch("/api/auth/convex-token");
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    return data.token ?? null;
  }, []);
  return useMemo(
    () => ({
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
      fetchAccessToken,
    }),
    [status, fetchAccessToken],
  );
}
