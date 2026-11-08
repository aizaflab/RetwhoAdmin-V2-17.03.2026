import { apiSlice } from "../api/apiSlice";

import type {
  CollectPayload,
  CommissionCollection,
  CommissionRequest,
  StatementResult,
  WholesalerCommission,
} from "@/components/modules/commission";

// Commission collection, at `/admin/commissions`.

interface Envelope<T> {
  status?: boolean;
  message?: string;
  meta?: StatementResult["meta"];
  data?: T;
}

const query = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

const commissionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Every wholesaler's commission for a month.
    getCommissionStatements: builder.query<
      StatementResult,
      { month?: string; searchTerm?: string; page?: number; limit?: number }
    >({
      query: (params) => `/admin/commissions/statements${query(params)}`,
      transformResponse: (
        res: Envelope<{
          rows: StatementResult["rows"];
          totals: StatementResult["totals"];
        }>,
      ) => ({
        rows: res?.data?.rows ?? [],
        totals: res?.data?.totals ?? null,
        meta: res?.meta ?? { page: 1, limit: 20, total: 0, totalPage: 1 },
      }),
      providesTags: ["commissions"],
    }),

    // One wholesaler's commission in full.
    getWholesalerCommission: builder.query<
      WholesalerCommission | undefined,
      { shopId: string; month?: string; page?: number; limit?: number }
    >({
      query: ({ shopId, ...params }) =>
        `/admin/commissions/wholesalers/${shopId}${query(params)}`,
      transformResponse: (res: Envelope<WholesalerCommission>) => res?.data,
      providesTags: (_r, _e, { shopId }) => [
        { type: "commission", id: shopId },
      ],
    }),

    // Ask the wholesaler to pay — for a month, or everything owed.
    requestCommission: builder.mutation<
      CommissionRequest | undefined,
      { shopId: string; period?: string; note?: string }
    >({
      query: ({ shopId, ...body }) => ({
        url: `/admin/commissions/wholesalers/${shopId}/requests`,
        method: "POST",
        body,
      }),
      transformResponse: (res: Envelope<CommissionRequest>) => res?.data,
      invalidatesTags: (_r, _e, { shopId }) => [
        "commissions",
        { type: "commission", id: shopId },
      ],
    }),

    // Collect — charge a saved method, record a payment, or waive.
    collectCommission: builder.mutation<
      CommissionCollection | undefined,
      { shopId: string } & CollectPayload
    >({
      query: ({ shopId, ...body }) => ({
        url: `/admin/commissions/wholesalers/${shopId}/collections`,
        method: "POST",
        body,
      }),
      transformResponse: (res: Envelope<CommissionCollection>) => res?.data,
      // A failed charge is recorded too, so refresh either way.
      invalidatesTags: (_r, _e, { shopId }) => [
        "commissions",
        { type: "commission", id: shopId },
      ],
    }),
  }),
});

export const {
  useGetCommissionStatementsQuery,
  useGetWholesalerCommissionQuery,
  useRequestCommissionMutation,
  useCollectCommissionMutation,
} = commissionApiSlice;
