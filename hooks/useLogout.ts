"use client";

import { useCallback, useState } from "react";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import { apiSlice } from "@/featured/api/apiSlice";
import { useLogoutMutation } from "@/featured/auth/authApiSlice";

/**
 * Signs the employee out of both sides of the session:
 *
 * 1. `POST /admin/employees/auth/logout` so the backend revokes the refresh
 *    token — otherwise it stays valid until it expires on its own.
 * 2. next-auth `signOut()`, which clears the httpOnly session cookie.
 *
 * The server call is best effort: if it fails (offline, already-expired
 * token) the local session is still cleared, because leaving the user signed
 * in on a failed logout is the worse outcome.
 */
export function useLogout(callbackUrl = "/login") {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // The endpoint takes no argument; RTK Query's generated hook still
      // requires the slot to be filled.
      await logout(undefined).unwrap();
    } catch (error) {
      // Swallowed on purpose — see the note above.
      console.error("Server logout failed:", error);
    }

    // Drop every cached response so the next user never sees stale data.
    dispatch(apiSlice.util.resetApiState());

    toast.success("Signed out successfully");
    await signOut({ callbackUrl });
  }, [callbackUrl, dispatch, isSigningOut, logout]);

  return { handleLogout, isSigningOut };
}
