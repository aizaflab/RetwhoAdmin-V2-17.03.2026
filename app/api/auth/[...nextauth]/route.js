import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  readRefreshCookie,
  refreshCookieHeader,
} from "@/lib/auth/refreshCookie";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Last-resort lifetime, used only when neither the access token itself nor the
// response body says when it expires (15 minutes).
const DEFAULT_ACCESS_TOKEN_TTL = 15 * 60;

// Refresh this long before the real expiry so a token can never go stale
// mid-flight between the session callback and the request that uses it.
const EXPIRY_SKEW_MS = 60 * 1000;

/**
 * The backend wraps its payload as { data: {...} } on some endpoints and
 * returns it flat on others, so read through both shapes.
 */
function unwrap(payload) {
  return payload?.data ?? payload ?? {};
}

/**
 * Read the `exp` claim straight out of the access token. This is the only
 * source that is always right — the refresh endpoint returns just
 * `{ accessToken }` with no lifetime field, and the real lifetime is set by
 * the backend, not by anything we can hardcode here.
 *
 * Signature verification is the backend's job; we only need the timestamp, and
 * a forged one would be rejected on the next API call anyway.
 */
function decodeTokenExpiry(accessToken) {
  try {
    const payload = accessToken?.split(".")[1];
    if (!payload) return null;

    const json = Buffer.from(payload, "base64url").toString("utf8");
    const exp = Number(JSON.parse(json).exp);

    return Number.isFinite(exp) && exp > 0 ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Resolve when the access token expires, most trustworthy source first:
 * the token's own `exp` claim, then an explicit lifetime in the body, then
 * the fallback.
 */
function toExpiryMs(body) {
  const fromToken = decodeTokenExpiry(body.accessToken);
  if (fromToken) return fromToken;

  const expiresIn = Number(body.expiresIn ?? body.accessTokenExpiresIn);
  const ttl =
    Number.isFinite(expiresIn) && expiresIn > 0
      ? expiresIn
      : DEFAULT_ACCESS_TOKEN_TTL;

  return Date.now() + ttl * 1000;
}

/**
 * In-flight refreshes, keyed by the refresh token being spent.
 *
 * The jwt callback runs on every /api/auth/session hit, and the app fires
 * those concurrently (RTK Query's prepareHeaders, the axios interceptor, the
 * 10-minute SessionProvider poll). Without this, an expired token would kick
 * off several parallel refreshes — and if the backend rotates refresh tokens,
 * whichever call landed second would be spending an already-consumed token and
 * would log the user out.
 */
const refreshPromises = new Map();

async function requestRefreshedToken(token) {
  const res = await fetch(`${BACKEND_URL}/admin/employees/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // The endpoint reads the refresh token from `req.cookies`, so it has to
      // travel as a cookie. We run on the server, where the browser's cookie
      // jar does not exist, so the header is built by hand from the JWT.
      Cookie: refreshCookieHeader(token.refreshToken),
    },
  });

  const body = unwrap(await res.json().catch(() => ({})));

  if (!res.ok || !body.accessToken) {
    throw new Error(body.message || "Failed to refresh access token");
  }

  return {
    ...token,
    accessToken: body.accessToken,
    // Backends that rotate refresh tokens hand back a new cookie; keep the
    // old token when they don't (this one currently reuses it).
    refreshToken: readRefreshCookie(res) ?? token.refreshToken,
    accessTokenExpires: toExpiryMs(body),
    error: undefined,
  };
}

/**
 * Exchange the refresh token for a fresh access token. Returning a token with
 * `error` set lets the session callback surface it so the client can sign out.
 */
async function refreshAccessToken(token) {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token available");
    }

    const key = token.refreshToken;
    let pending = refreshPromises.get(key);

    if (!pending) {
      pending = requestRefreshedToken(token).finally(() => {
        refreshPromises.delete(key);
      });
      refreshPromises.set(key, pending);
    }

    return await pending;
  } catch (error) {
    console.error("Refresh token error:", error);
    // Drop the tokens: they are unusable, and keeping them around only invites
    // retry loops against an endpoint that has already refused them.
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days, matches the refresh token lifetime
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const res = await fetch(`${BACKEND_URL}/admin/employees/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const body = unwrap(await res.json());

        if (!res.ok || !body.accessToken) {
          // The message is forwarded to the client through signIn().error.
          throw new Error(body.message || "Invalid email or password");
        }

        const user = body.user ?? {};

        return {
          id: user.id ?? user._id ?? credentials.email,
          name: user.name ?? null,
          email: user.email ?? credentials.email,
          role: user.role ?? null,
          image: user.profileImage?.url ?? null,
          accessToken: body.accessToken,
          // Login returns only `{ accessToken }` in its body — the refresh
          // token comes back as a Set-Cookie that dies with this response
          // unless we keep it here.
          refreshToken: readRefreshCookie(res) ?? body.refreshToken ?? null,
          accessTokenExpires: toExpiryMs(body),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in.
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // A refresh has already failed for this session — there is nothing left
      // to try, so stop hitting the backend and let the client sign out.
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Access token still valid — reuse it. The skew rotates it slightly
      // early rather than handing out one that expires in flight.
      if (Date.now() + EXPIRY_SKEW_MS < (token.accessTokenExpires ?? 0)) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
      };
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: false,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
