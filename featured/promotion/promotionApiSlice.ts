import { apiSlice } from "../api/apiSlice";

import { buildMediaFormData } from "@/lib/formData";
import type {
  Promotion,
  PromotionListMeta,
  PromotionListQuery,
  PromotionListResult,
  PromotionOverview,
  PromotionPayload,
} from "@/components/modules/promotion";

// Promotions live at `/promotions` (under the NEXT_PUBLIC_BACKEND_URL
// `/api/v1` base). Every response is wrapped in the standard envelope —
// `{ status, statusCode, message, meta, data }`.

const EMPTY_META: PromotionListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 1,
};

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: PromotionListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&status=`. */
function buildQueryString(params: PromotionListQuery = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * Create/update always goes out as multipart, whether or not a new file was
 * picked: the endpoint runs the upload middleware unconditionally, and sending
 * JSON there would leave `req.body.data` unparsed.
 */
type PromotionBody = {
  payload: Partial<PromotionPayload>;
  bannerImageFile?: File | null;
};

const promotionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query({
      query: (params: PromotionListQuery = {}) => ({
        url: `/promotions${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<Promotion[]>,
      ): PromotionListResult => ({
        promotions: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["promotions"],
    }),

    // Approval states plus the derived live/scheduled/expired buckets.
    getPromotionOverview: builder.query({
      query: () => ({ url: "/promotions/overview" }),
      transformResponse: (response: Envelope<PromotionOverview>) =>
        response?.data,
      providesTags: ["promotions"],
    }),

    getPromotion: builder.query({
      query: (id: string) => ({ url: `/promotions/${id}` }),
      transformResponse: (response: Envelope<Promotion>) => response?.data,
      providesTags: (result, error, id) => [{ type: "promotion" as const, id }],
    }),

    createPromotion: builder.mutation({
      query: ({ payload, bannerImageFile }: PromotionBody) => ({
        url: "/promotions",
        method: "POST",
        body: buildMediaFormData(payload, { bannerImage: bannerImageFile }),
      }),
      invalidatesTags: ["promotions"],
    }),

    // Partial on purpose: a status flip from the list sends only `status`,
    // while the form sends the whole body.
    updatePromotion: builder.mutation({
      query: ({
        id,
        payload,
        bannerImageFile,
      }: PromotionBody & { id: string }) => ({
        url: `/promotions/${id}`,
        method: "PATCH",
        body: buildMediaFormData(payload, { bannerImage: bannerImageFile }),
      }),
      invalidatesTags: (result, error, { id }) => [
        "promotions",
        { type: "promotion" as const, id },
      ],
    }),

    // DELETE : soft. The API flips `isDeleted` and hides the row; the
    // promotion and its banner both survive, ready for a v2 restore.
    deletePromotion: builder.mutation({
      query: (id: string) => ({ url: `/promotions/${id}`, method: "DELETE" }),
      invalidatesTags: ["promotions"],
    }),
  }),
});

export const {
  useGetPromotionsQuery,
  useGetPromotionOverviewQuery,
  useGetPromotionQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionApiSlice;
