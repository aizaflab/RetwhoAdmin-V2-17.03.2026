"use client";

import { useCallback, useState } from "react";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import { apiSlice } from "@/featured/api/apiSlice";

/**
 * Signs the employee out of both sides of the session:
 *
 * 1. `POST /api/logout`, which revokes the backend refresh token — otherwise
 *    it stays valid until it expires on its own. The call is same-origin on
 *    purpose: the backend reads the refresh token from a cookie the browser
 *    never received, so only the server can make it (see the route).
 * 2. next-auth `signOut()`, which clears the httpOnly session cookie.
 *
 * The server call is best effort: if it fails (offline, already-expired
 * token) the local session is still cleared, because leaving the user signed
 * in on a failed logout is the worse outcome.
 */
export function useLogout(callbackUrl = "/login") {
  const dispatch = useDispatch();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // Never throws for a backend failure; it reports one in `revoked` so the
      // sign-out below still completes.
      const result = await (
        await fetch("/api/logout", { method: "POST" })
      ).json();

      if (!result.revoked) {
        console.warn("Backend session not revoked:", result.reason);
      }
    } catch (error) {
      // Swallowed on purpose — see the note above.
      console.error("Server logout failed:", error);
    }

    // Drop every cached response so the next user never sees stale data.
    dispatch(apiSlice.util.resetApiState());

    toast.success("Signed out successfully");

    // `redirect: false` so the navigation below is ours to control — this
    // resolves only once the server has expired the session cookie.
    await signOut({ redirect: false });

    // Hard navigation, not router.replace: the client Router Cache still holds
    // RSC payloads rendered while signed in, and a client-side transition would
    // re-serve one of those instead of leaving the page. A full load also drops
    // the Redux store, so nothing of this session survives.
    window.location.assign(new URL(callbackUrl, window.location.origin));

    // Deliberately no `setIsSigningOut(false)`: the page is unloading, and
    // flipping the button back to "Sign Out" just flickers.
  }, [callbackUrl, dispatch, isSigningOut]);

  return { handleLogout, isSigningOut };
}
