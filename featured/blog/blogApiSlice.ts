import { apiSlice } from "../api/apiSlice";

import { buildMediaFormData } from "@/lib/formData";
import type {
  BlogCategory,
  BlogCategoryListQuery,
  BlogCategoryListResult,
  BlogCategoryPayload,
  BlogListMeta,
  BlogListQuery,
  BlogListResult,
  BlogPost,
  BlogPostPayload,
  BlogStatsData,
} from "@/components/modules/blog";

// Blogs live at `/blogs` and their categories at `/blogs/categories` (both
// under the NEXT_PUBLIC_BACKEND_URL `/api/v1` base). Every response is wrapped
// in the standard envelope — `{ status, statusCode, message, meta, data }`.

const EMPTY_META: BlogListMeta = { page: 1, limit: 10, total: 0, totalPage: 1 };

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: BlogListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&status=`. */
function buildQueryString(
  params: BlogListQuery | BlogCategoryListQuery = {},
): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * Post create/update always goes out as multipart, whether or not a new file
 * was picked: the endpoint runs the upload middleware unconditionally, and
 * sending JSON there would leave `req.body.data` unparsed.
 */
type BlogPostBody = { payload: BlogPostPayload; imageFile?: File | null };

const blogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Posts ──────────────────────────────────────────────────────────
    getBlogPosts: builder.query({
      query: (params: BlogListQuery = {}) => ({
        url: `/blogs${buildQueryString(params)}`,
      }),
      transformResponse: (response: Envelope<BlogPost[]>): BlogListResult => ({
        posts: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["blogs"],
    }),

    getBlogStats: builder.query({
      query: () => ({ url: "/blogs/stats" }),
      transformResponse: (response: Envelope<BlogStatsData>) => response?.data,
      providesTags: ["blogs"],
    }),

    getBlogPost: builder.query({
      query: (id: string) => ({ url: `/blogs/${id}` }),
      transformResponse: (response: Envelope<BlogPost>) => response?.data,
      providesTags: (result, error, id) => [{ type: "blog" as const, id }],
    }),

    createBlogPost: builder.mutation({
      query: ({ payload, imageFile }: BlogPostBody) => ({
        url: "/blogs",
        method: "POST",
        body: buildMediaFormData(payload, { image: imageFile }),
      }),
      // A new post changes its category's blogCount too.
      invalidatesTags: ["blogs", "blog-categories"],
    }),

    updateBlogPost: builder.mutation({
      query: ({ id, payload, imageFile }: BlogPostBody & { id: string }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        body: buildMediaFormData(payload, { image: imageFile }),
      }),
      invalidatesTags: (result, error, { id }) => [
        "blogs",
        "blog-categories",
        { type: "blog" as const, id },
      ],
    }),

    // DELETE : soft. The API flips `isDeleted` and hides the row; the post
    // and its uploaded image both survive, ready for a v2 restore.
    deleteBlogPost: builder.mutation({
      query: (id: string) => ({ url: `/blogs/${id}`, method: "DELETE" }),
      invalidatesTags: ["blogs", "blog-categories"],
    }),

    // ─── Categories ─────────────────────────────────────────────────────
    getBlogCategories: builder.query({
      query: (params: BlogCategoryListQuery = {}) => ({
        url: `/blogs/categories${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<BlogCategory[]>,
      ): BlogCategoryListResult => ({
        categories: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["blog-categories"],
    }),

    // Active categories as { label, value } — for the post form's select.
    getBlogCategoryOptions: builder.query({
      query: () => ({ url: "/blogs/categories/options" }),
      transformResponse: (
        response: Envelope<{ label: string; value: string }[]>,
      ) => response?.data ?? [],
      providesTags: ["blog-categories"],
    }),

    createBlogCategory: builder.mutation({
      query: (data: BlogCategoryPayload) => ({
        url: "/blogs/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["blog-categories"],
    }),

    updateBlogCategory: builder.mutation({
      query: ({ id, data }: { id: string; data: BlogCategoryPayload }) => ({
        url: `/blogs/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      // Renaming a category changes what every post row displays.
      invalidatesTags: ["blog-categories", "blogs"],
    }),

    // DELETE : soft, and refused with a 409 while any post is filed under
    // the category — the table disables the button for that case.
    deleteBlogCategory: builder.mutation({
      query: (id: string) => ({
        url: `/blogs/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["blog-categories", "blogs"],
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogStatsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetBlogCategoriesQuery,
  useGetBlogCategoryOptionsQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} = blogApiSlice;
