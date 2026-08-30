import { apiSlice } from "../api/apiSlice";

import { buildMediaFormData } from "@/lib/formData";

import type {
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
} = productApiSlice;
