import { apiSlice } from "../api/apiSlice";

import type {
  Role,
  RoleListMeta,
  RoleListQuery,
  RoleListResult,
  RolePayload,
  RoleStatsData,
} from "@/components/modules/role";

// The admin panel talks to `/admin/roles` (mounted under the NEXT_PUBLIC_BACKEND_URL
// `/api/v1` base). Every response is wrapped in the standard envelope —
// `{ status, statusCode, message, meta, data }` — so each endpoint unwraps it
// and callers only ever see the payload.

const EMPTY_META: RoleListMeta = { page: 1, limit: 10, total: 0, totalPage: 1 };

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: RoleListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&status=`. */
function buildQueryString(params: RoleListQuery = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const roleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET : paginated role list. Search, status filter and paging are all
    // server-side — the table sends its state straight through.
    getRoles: builder.query({
      query: (params: RoleListQuery = {}) => ({
        url: `/admin/roles${buildQueryString(params)}`,
      }),
      transformResponse: (response: Envelope<Role[]>): RoleListResult => ({
        roles: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["roles"],
    }),

    // GET : headline counts for the stat cards. Separate from the list so the
    // numbers describe every role, not just the current page.
    getRoleStats: builder.query({
      query: () => ({ url: "/admin/roles/stats" }),
      transformResponse: (response: Envelope<RoleStatsData>) => response?.data,
      providesTags: ["roles"],
    }),

    // GET : active roles as { label, value } — for the employee form's select.
    getRoleOptions: builder.query({
      query: () => ({ url: "/admin/roles/options" }),
      transformResponse: (
        response: Envelope<{ label: string; value: string }[]>,
      ) => response?.data ?? [],
      providesTags: ["roles"],
    }),

    // GET : one role, for the edit page.
    getRole: builder.query({
      query: (id: string) => ({ url: `/admin/roles/${id}` }),
      transformResponse: (response: Envelope<Role>) => response?.data,
      providesTags: (result, error, id) => [{ type: "role" as const, id }],
    }),

    // POST : create. A duplicate name comes back as a 409 the form surfaces on
    // the name field.
    createRole: builder.mutation({
      query: (data: RolePayload) => ({
        url: "/admin/roles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["roles"],
    }),

    // PATCH : update. Send only the changed fields — the API validates a
    // partial body.
    updateRole: builder.mutation({
      query: ({ id, data }: { id: string; data: Partial<RolePayload> }) => ({
        url: `/admin/roles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "roles",
        { type: "role" as const, id },
      ],
    }),

    // DELETE : soft delete. The API refuses system roles and roles still
    // assigned to employees, so failures here are expected and get toasted.
    deleteRole: builder.mutation({
      query: (id: string) => ({
        url: `/admin/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["roles"],
    }),
  }),
});

// RTK Query infers every argument and result type from the definitions above,
// so these hooks come out fully typed — `useGetRolesQuery` hands back
// `RoleListResult`, `useGetRoleQuery` a `Role`, and each mutation's trigger
// takes exactly the body its endpoint declares.
export const {
  useGetRolesQuery,
  useGetRoleStatsQuery,
  useGetRoleOptionsQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApiSlice;
