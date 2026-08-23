"use client";

import { useCallback, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

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
 *
 * Nothing here may touch the RTK Query cache. `GET /api/auth/session` re-issues
 * the session cookie on every hit (next-auth's jwt session route), and every
 * query goes through `prepareHeaders` -> `getSession()`. Kicking off a refetch
 * — `resetApiState()` used to do exactly that — races the sign-out below, and
 * whenever the session response lands last it puts the cookie straight back and
 * the user stays signed in. The hard navigation at the end drops the whole
 * store anyway, so there is nothing to clear by hand.
 */
export function useLogout(callbackUrl = "/login") {
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

    // `redirect: false` so the navigation below is ours to control — this
    // resolves only once the server has expired the session cookie.
    await signOut({ redirect: false });

    toast.success("Signed out successfully");

    // Hard navigation, not router.replace: the client Router Cache still holds
    // RSC payloads rendered while signed in, and a client-side transition would
    // re-serve one of those instead of leaving the page. A full load also drops
    // the Redux store, so nothing of this session survives — and it aborts any
    // request still in flight, which is what keeps a late `/api/auth/session`
    // response from resurrecting the cookie we just cleared.
    window.location.assign(new URL(callbackUrl, window.location.origin));

    // Deliberately no `setIsSigningOut(false)`: the page is unloading, and
    // flipping the button back to "Sign Out" just flickers.
  }, [callbackUrl, isSigningOut]);

  return { handleLogout, isSigningOut };
}
