import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Reads and decrypts the httpOnly session cookie at the edge — no backend
  // round trip, so this stays cheap on every navigation.
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthenticated = Boolean(token) && !token?.error;

  // Signed in, but sitting on /login — send them to the dashboard.
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Signed out on a protected route — remember where they were headed.
  if (!isAuthRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Everything except:
     * - /api (route handlers, incl. /api/auth)
     * - /_next/static, /_next/image (build output)
     * - favicon.ico and files with an extension (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
