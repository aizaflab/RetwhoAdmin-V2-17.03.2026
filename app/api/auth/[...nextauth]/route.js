import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Fallback lifetime used when the backend does not report one (15 minutes).
const DEFAULT_ACCESS_TOKEN_TTL = 15 * 60;

/**
 * The backend wraps its payload as { data: {...} } on some endpoints and
 * returns it flat on others, so read through both shapes.
 */
function unwrap(payload) {
  return payload?.data ?? payload ?? {};
}

function toExpiryMs(body) {
  const expiresIn = Number(body.expiresIn ?? body.accessTokenExpiresIn);
  const ttl =
    Number.isFinite(expiresIn) && expiresIn > 0
      ? expiresIn
      : DEFAULT_ACCESS_TOKEN_TTL;
  return Date.now() + ttl * 1000;
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

    const res = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const body = unwrap(await res.json());

    if (!res.ok || !body.accessToken) {
      throw new Error(body.message || "Failed to refresh access token");
    }

    return {
      ...token,
      accessToken: body.accessToken,
      // Backends that rotate refresh tokens return a new one; keep the old
      // one when they don't.
      refreshToken: body.refreshToken ?? token.refreshToken,
      accessTokenExpires: toExpiryMs(body),
      error: undefined,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return { ...token, error: "RefreshAccessTokenError" };
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

        const res = await fetch(`${BACKEND_URL}/auth/login`, {
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
          refreshToken: body.refreshToken ?? null,
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

      // Access token still valid — reuse it.
      if (Date.now() < (token.accessTokenExpires ?? 0)) {
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
