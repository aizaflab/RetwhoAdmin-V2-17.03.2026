import { apiSlice } from "../api/apiSlice";

import type {
  SetWholesalerCommissionPayload,
  WholesalerCommissionListMeta,
  WholesalerCommissionListQuery,
  WholesalerCommissionListResult,
  WholesalerCommissionRow,
  WholesalerCommissionStatsData,
} from "@/components/modules/wholesaler-commission";

// Each wholesaler's own commission rate, at `/admin/wholesaler-commissions`.
// Every response is wrapped in the standard envelope — `{ status, statusCode,
// message, meta, data }` — so each endpoint unwraps it.

const EMPTY_META: WholesalerCommissionListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 1,
};

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: WholesalerCommissionListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&ownerId=`. */
function buildQueryString(params: WholesalerCommissionListQuery = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const wholesalerCommissionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET : every wholesaler shop with the rate it is on. Search, filters and
    // paging are all server-side.
    getWholesalerCommissions: builder.query({
      query: (params: WholesalerCommissionListQuery = {}) => ({
        url: `/admin/wholesaler-commissions${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<WholesalerCommissionRow[]>,
      ): WholesalerCommissionListResult => ({
        rows: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["wholesaler-commissions"],
    }),

    // GET : headline counts — every wholesaler, not just this page.
    getWholesalerCommissionStats: builder.query({
      query: () => ({ url: "/admin/wholesaler-commissions/stats" }),
      transformResponse: (response: Envelope<WholesalerCommissionStatsData>) =>
        response?.data,
      providesTags: ["wholesaler-commissions"],
    }),

    // PUT : give a shop its own rate, or change it.
    setWholesalerCommission: builder.mutation({
      query: ({
        shopId,
        data,
      }: {
        shopId: string;
        data: SetWholesalerCommissionPayload;
      }) => ({
        url: `/admin/wholesaler-commissions/${shopId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["wholesaler-commissions", "commissions"],
    }),

    // DELETE : back to the global rate.
    removeWholesalerCommission: builder.mutation({
      query: (shopId: string) => ({
        url: `/admin/wholesaler-commissions/${shopId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["wholesaler-commissions", "commissions"],
    }),
  }),
});

export const {
  useGetWholesalerCommissionsQuery,
  useGetWholesalerCommissionStatsQuery,
  useSetWholesalerCommissionMutation,
  useRemoveWholesalerCommissionMutation,
} = wholesalerCommissionApiSlice;
