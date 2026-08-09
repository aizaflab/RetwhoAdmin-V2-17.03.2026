import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    /** Set to "RefreshAccessTokenError" when the refresh call failed. */
    error?: string;
    user: {
      id?: string;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string | null;
    accessToken?: string;
    refreshToken?: string | null;
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    accessToken?: string;
    refreshToken?: string | null;
    accessTokenExpires?: number;
    error?: string;
  }
}
