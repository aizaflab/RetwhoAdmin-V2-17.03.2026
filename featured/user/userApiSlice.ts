import { apiSlice } from "../api/apiSlice";

import type {
  User,
  UserListMeta,
  UserListQuery,
  UserListResult,
  UserPayload,
  UserStatsData,
  UserUpdatePayload,
} from "@/components/modules/users";

// Platform users live at `/users` (mounted under the NEXT_PUBLIC_BACKEND_URL
// `/api/v1` base). Every response is wrapped in the standard envelope —
// `{ status, statusCode, message, meta, data }` — so each endpoint unwraps it
// and callers only ever see the payload.

const EMPTY_META: UserListMeta = { page: 1, limit: 10, total: 0, totalPage: 1 };

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: UserListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&status=`. */
function buildQueryString(params: UserListQuery = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET : paginated user list. Search, filters and paging are all
    // server-side — the table sends its state straight through.
    getUsers: builder.query({
      query: (params: UserListQuery = {}) => ({
        url: `/users${buildQueryString(params)}`,
      }),
      transformResponse: (response: Envelope<User[]>): UserListResult => ({
        users: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["users"],
    }),

    // GET : headline counts for the stat cards. Separate from the list so the
    // numbers describe every user, not just the current page.
    getUserStats: builder.query({
      query: () => ({ url: "/users/stats" }),
      transformResponse: (response: Envelope<UserStatsData>) => response?.data,
      providesTags: ["users"],
    }),

    // GET : one user, by id.
    getUser: builder.query({
      query: (id: string) => ({ url: `/users/${id}` }),
      transformResponse: (response: Envelope<User>) => response?.data,
      providesTags: (result, error, id) => [{ type: "user" as const, id }],
    }),

    // GET : the logged-in employee's own profile. This panel signs in through
    // /admin/employees/auth/login, so the session token is an employee token —
    // the user-side /users/me would reject it.
    getProfile: builder.query({
      query: () => ({ url: "/admin/employees/me" }),
      transformResponse: (response: Envelope<unknown>) =>
        response?.data ?? null,
      providesTags: ["user"],
    }),

    // POST : create. The API pre-verifies the account and emails the
    // credentials, so the user can log in immediately.
    createUser: builder.mutation({
      query: (data: UserPayload) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["users"],
    }),

    // PATCH : update. Name, username, email, phone, status and verification —
    // the API's strict schema rejects anything else.
    updateUser: builder.mutation({
      query: ({ id, data }: { id: string; data: UserUpdatePayload }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "users",
        { type: "user" as const, id },
      ],
    }),

    // DELETE : soft delete. The API refuses to remove a user who still owns
    // shops, so failures here are expected and get toasted.
    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

// RTK Query infers every argument and result type from the definitions above,
// so these hooks come out fully typed.
export const {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useGetUserQuery,
  useGetProfileQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
