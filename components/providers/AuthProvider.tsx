"use client";

import type { ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { SessionProvider, useSession } from "next-auth/react";

import { store } from "@/featured/store";
import { useLogout } from "@/hooks/useLogout";

/**
 * Wraps the app in the next-auth session and the Redux store. The session
 * cookie is httpOnly and encrypted, so tokens are never readable from JS —
 * `useAuth()` reads them through the session endpoint instead.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // Re-run the jwt callback every 10 minutes so an expiring access token
      // is rotated before a request needs it.
      refetchInterval={10 * 60}
      refetchOnWindowFocus
    >
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </SessionProvider>
  );
}

/**
 * Thin wrapper over useSession() that keeps the shape the app already expects.
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const { handleLogout, isSigningOut } = useLogout();

  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !session?.error,
    accessToken: session?.accessToken ?? null,
    // Revokes the refresh token server-side before clearing the session.
    logout: handleLogout,
    isSigningOut,
  };
}
