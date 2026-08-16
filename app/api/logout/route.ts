import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { refreshCookieHeader } from "@/lib/auth/refreshCookie";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Revokes the backend session, server-side.
 *
 * `POST /admin/employees/auth/logout` deletes the refresh token it finds in the
 * `admin_refresh_token` cookie. That cookie was set on this process during
 * sign-in, never on the browser, so calling the endpoint straight from the
 * client arrived with nothing to revoke and came back `400 No refresh token
 * found.` — the session stayed alive on the server. Logging out from the same
 * side that logged in keeps the two halves symmetric.
 *
 * Always resolves 200: the local sign-out must go through even when the token
 * is already expired or the backend is unreachable. `revoked` reports whether
 * the backend actually acknowledged it.
 */
export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Nothing to revoke: no session, or the last refresh already failed, which
  // means the backend has dropped this refresh token anyway.
  if (!token?.refreshToken || token.error === "RefreshAccessTokenError") {
    return NextResponse.json({ revoked: false, reason: "no-valid-session" });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/employees/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: refreshCookieHeader(String(token.refreshToken)),
        ...(token.accessToken
          ? { Authorization: `Bearer ${token.accessToken}` }
          : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`Backend logout failed (${res.status}):`, detail);
      return NextResponse.json({
        revoked: false,
        reason: `http-${res.status}`,
      });
    }

    return NextResponse.json({ revoked: true });
  } catch (error) {
    console.error("Backend logout request failed:", error);
    return NextResponse.json({ revoked: false, reason: "network-error" });
  }
}
