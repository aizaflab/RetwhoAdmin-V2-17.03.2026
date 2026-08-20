import { apiSlice } from "../api/apiSlice";

import type {
  Employee,
  EmployeeListMeta,
  EmployeeListQuery,
  EmployeeListResult,
  EmployeePayload,
  EmployeeStatsData,
  EmployeeUpdatePayload,
} from "@/components/modules/employee";

// The admin panel talks to `/admin/employees` (mounted under the
// NEXT_PUBLIC_BACKEND_URL `/api/v1` base). Every response is wrapped in the
// standard envelope — `{ status, statusCode, message, meta, data }` — so each
// endpoint unwraps it and callers only ever see the payload.

const EMPTY_META: EmployeeListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 1,
};

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: EmployeeListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&status=`. */
function buildQueryString(params: EmployeeListQuery = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET : paginated employee list. Search, role/status filters and paging are
    // all server-side — the table sends its state straight through.
    getEmployees: builder.query({
      query: (params: EmployeeListQuery = {}) => ({
        url: `/admin/employees${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<Employee[]>,
      ): EmployeeListResult => ({
        employees: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["employees"],
    }),

    // GET : headline counts for the stat cards. Separate from the list so the
    // numbers describe every employee, not just the current page.
    getEmployeeStats: builder.query({
      query: () => ({ url: "/admin/employees/stats" }),
      transformResponse: (response: Envelope<EmployeeStatsData>) =>
        response?.data,
      providesTags: ["employees"],
    }),

    // GET : one employee, by id.
    getEmployee: builder.query({
      query: (id: string) => ({ url: `/admin/employees/${id}` }),
      transformResponse: (response: Envelope<Employee>) => response?.data,
      providesTags: (result, error, id) => [{ type: "employee" as const, id }],
    }),

    // POST : create. The API emails the new employee their credentials, and
    // answers a duplicate address with a 409 the form shows on the email field.
    createEmployee: builder.mutation({
      query: (data: EmployeePayload) => ({
        url: "/admin/employees",
        method: "POST",
        body: data,
      }),
      // A new hire moves the role's employeeCount too, so the role list and its
      // stats are no longer accurate either.
      invalidatesTags: ["employees", "roles"],
    }),

    // PATCH : update. Name, phone, role and status only — the API rejects
    // email and password changes on this endpoint.
    updateEmployee: builder.mutation({
      query: ({ id, data }: { id: string; data: EmployeeUpdatePayload }) => ({
        url: `/admin/employees/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "employees",
        "roles",
        { type: "employee" as const, id },
      ],
    }),

    // DELETE : soft delete. The API refuses self-deletion and refuses to remove
    // the last active Super Admin, so failures here are expected and toasted.
    deleteEmployee: builder.mutation({
      query: (id: string) => ({
        url: `/admin/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["employees", "roles"],
    }),
  }),
});

// RTK Query infers every argument and result type from the definitions above,
// so these hooks come out fully typed.
export const {
  useGetEmployeesQuery,
  useGetEmployeeStatsQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApiSlice;
