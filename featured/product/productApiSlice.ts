import { apiSlice } from "../api/apiSlice";

import { buildMediaFormData } from "@/lib/formData";

import type {
  BulkUploadAccepted,
  BulkUploadErrorLog,
  BulkUploadErrorQuery,
  BulkUploadErrorResult,
  BulkUploadJob,
  BulkUploadJobMeta,
  BulkUploadJobResult,
  BulkUploadProgress,
  GlobalProduct,
  ProductListMeta,
  ProductListQuery,
  ProductListResult,
  ProductPayload,
} from "@/components/modules/product";

const EMPTY_META: ProductListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 1,
};

const EMPTY_JOB_META: BulkUploadJobMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 1,
};

// Global products live at `/admin/products` (under the
// NEXT_PUBLIC_BACKEND_URL `/api/v1` base). Responses come back in the standard
// envelope — `{ status, statusCode, message, data }` — and the bearer token is
// attached by the base query, so nothing here sets a header.

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: ProductListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&filters=`. */
function buildQueryString(params: ProductListQuery = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params: ProductListQuery = {}) => ({
        url: `/admin/products${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<GlobalProduct[]>,
      ): ProductListResult => ({
        products: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["products"],
    }),

    /** One product by id — what the row's view action opens. */
    getProduct: builder.query({
      query: (productId: string) => ({
        url: `/admin/products/${productId}`,
      }),
      transformResponse: (response: Envelope<GlobalProduct>) => response?.data,
      providesTags: ["products"],
    }),

    createProduct: builder.mutation({
      // Plain JSON: this endpoint takes no upload, unlike blogs/promotions.
      query: (payload: ProductPayload) => ({
        url: "/admin/products/create",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: Envelope<GlobalProduct>) => response?.data,
      invalidatesTags: ["products"],
    }),

    /**
     * Update goes out as multipart even with no file: the route runs the
     * upload middleware unconditionally and reads the JSON body from a single
     * stringified `data` field, so plain JSON would leave it unparsed.
     */
    updateProduct: builder.mutation({
      query: ({
        id,
        payload,
        imageFile,
      }: {
        id: string;
        payload: Partial<ProductPayload>;
        imageFile?: File | null;
      }) => ({
        url: `/admin/products/${id}`,
        method: "PATCH",
        body: buildMediaFormData(payload, { image: imageFile }),
      }),
      transformResponse: (response: Envelope<GlobalProduct>) => response?.data,
      invalidatesTags: ["products"],
    }),

    /**
     * Bulk CSV upload. Answers 202 with a job handle, not the products — the
     * rows are inserted by a background worker, so the caller has to watch
     * `getBulkUploadJobs` / `getBulkUploadStatus` for the outcome.
     *
     * The body is bare multipart with nothing but the file under `file` — no
     * stringified `data` field (unlike the media routes, so `buildMediaFormData`
     * does not apply here) and no extra headers: the server mints the job's
     * idempotency key itself and hands it back on the 202.
     */
    uploadBulkProducts: builder.mutation({
      query: (file: File) => {
        const body = new FormData();
        body.append("file", file);

        return {
          url: "/admin/products/bulk-upload",
          method: "POST",
          // No Content-Type here — the browser has to set the multipart
          // boundary itself.
          body,
        };
      },
      transformResponse: (response: Envelope<BulkUploadAccepted>) =>
        response?.data,
      // The job list gains a row right away; the products themselves only
      // appear once the worker has run, which the polling picks up.
      invalidatesTags: ["bulk-uploads"],
    }),

    /** Every recent job, newest first — the upload page's history list. */
    getBulkUploadJobs: builder.query({
      query: () => ({ url: "/admin/products/bulk-upload/job" }),
      transformResponse: (
        response: Envelope<BulkUploadJob[]>,
      ): BulkUploadJobResult => ({
        jobs: response?.data ?? [],
        meta: response?.meta ?? EMPTY_JOB_META,
      }),
      providesTags: ["bulk-uploads"],
    }),

    /**
     * One job's live progress, keyed by the idempotency key it was queued
     * with. Carries `percentage` and `estimatedRemainingSeconds`, which the
     * list endpoint does not — so this is what an in-flight row polls.
     */
    getBulkUploadStatus: builder.query({
      query: (idempotencyKey: string) => ({
        url: `/admin/products/bulk-upload/status/${idempotencyKey}`,
      }),
      transformResponse: (response: Envelope<BulkUploadProgress>) =>
        response?.data,
      providesTags: ["bulk-uploads"],
    }),

    /**
     * The rows a job refused, keyed by the same idempotency key. This is the
     * detail behind the duplicate/failed counters — one entry per dropped row
     * with the parsed product and the reason — and it is paged and searched
     * server side, so the dialog sends `page`/`limit`/`searchTerm` straight
     * through rather than filtering a full list in the browser.
     */
    getBulkUploadErrors: builder.query({
      query: ({ idempotencyKey, ...params }: BulkUploadErrorQuery) => ({
        url: `/admin/products/bulk-upload/error/${idempotencyKey}${buildQueryString(
          params as ProductListQuery,
        )}`,
      }),
      transformResponse: (
        response: Envelope<BulkUploadErrorLog[]>,
      ): BulkUploadErrorResult => ({
        rows: response?.data ?? [],
        meta: response?.meta ?? EMPTY_JOB_META,
      }),
      providesTags: ["bulk-uploads"],
    }),

    // The template CSV (`/admin/products/bulk-upload/demo-csv`) has no endpoint
    // here on purpose: it answers with a file, and a query result is cached in
    // the store, where a Blob is neither serializable nor worth keeping. It is
    // fetched by `downloadAuthedFile` instead.

    // DELETE : soft. The API flips the deleted flag and drops the row from the
    // list, so invalidating `products` is enough to bring the table back in sync.
    deleteProduct: builder.mutation({
      query: (productId: string) => ({
        url: `/admin/products/${productId}`,
        method: "DELETE",
      }),
      transformResponse: (response: Envelope<GlobalProduct>) => response?.data,
      invalidatesTags: ["products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadBulkProductsMutation,
  useGetBulkUploadJobsQuery,
  useGetBulkUploadStatusQuery,
  useGetBulkUploadErrorsQuery,
} = productApiSlice;
