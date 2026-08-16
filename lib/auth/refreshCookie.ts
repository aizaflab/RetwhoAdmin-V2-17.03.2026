/**
 * The backend keeps the admin refresh token in an httpOnly cookie: login sets
 * it with `res.cookie(...)`, and both refresh and logout read it back from
 * `req.cookies` — never from the request body (see the server's
 * `employee.controller.ts`).
 *
 * Sign-in happens inside NextAuth's `authorize()`, which runs on this server,
 * so that cookie is set on a fetch response nothing keeps: it reaches neither
 * the browser nor any later request. Unless we lift the value out and carry it
 * in the NextAuth JWT, the token is lost the moment login returns — which is
 * why refresh and logout were both failing with `400 No refresh token found.`
 */
const REFRESH_COOKIE_NAME = "admin_refresh_token";

/** Reads the refresh token out of a backend response's `Set-Cookie`. */
export function readRefreshCookie(res: Response): string | null {
  // getSetCookie() keeps multiple Set-Cookie headers separate. The plain get()
  // joins them with commas, which is ambiguous, but it is the only fallback on
  // runtimes without getSetCookie.
  const cookies = res.headers.getSetCookie?.() ?? [
    res.headers.get("set-cookie") ?? "",
  ];

  for (const cookie of cookies) {
    const match = cookie?.match(
      new RegExp(`(?:^|,\\s*)${REFRESH_COOKIE_NAME}=([^;]+)`),
    );
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Builds the `Cookie` header that hands a stored refresh token back to the
 * backend in the one place it looks for it.
 */
export function refreshCookieHeader(refreshToken: string): string {
  return `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`;
}
