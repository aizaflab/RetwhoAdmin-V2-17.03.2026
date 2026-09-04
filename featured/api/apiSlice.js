import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

const BaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const baseQuery = fetchBaseQuery({
  baseUrl: BaseUrl,
  prepareHeaders: async (headers) => {
    // getSession() hits /api/auth/session, which runs the jwt callback and
    // therefore returns an already-refreshed access token when needed.
    const session = await getSession();
    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReAuth = async (args, api, extraOptions) => {
  const session = await getSession();

  // Refresh already failed inside the jwt callback — the session is dead.
  if (session?.error === "RefreshAccessTokenError") {
    await signOut({ callbackUrl: "/login" });
    return { error: { status: 401, data: { message: "Session expired" } } };
  }

  const result = await baseQuery(args, api, extraOptions);

  // Only an authenticated session can *lose* its authentication. On public
  // pages (forgot/reset password) a 401 means the request itself was rejected —
  // e.g. an expired reset token — and signing out there would redirect away
  // before the user could read the error.
  if (result?.error?.status === 401 && session) {
    await signOut({ callbackUrl: "/login" });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReAuth,
  tagTypes: [
    "network",
    "user",
    "users",
    "auth",
    "admin",
    "role",
    "roles",
    "employee",
    "employees",
    "blog",
    "blogs",
    "blog-categories",
    "hiring",
    "hirings",
    "hiring-categories",
    "hiring-applications",
    "promotion",
    "promotions",
    "product",
    "products",
    "bulk-uploads",
  ],
  endpoints: () => ({}),
  refetchOnReconnect: true,
});
