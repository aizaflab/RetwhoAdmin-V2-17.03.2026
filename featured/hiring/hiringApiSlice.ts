import { apiSlice } from "../api/apiSlice";

import { buildMediaFormData } from "@/lib/formData";
import type {
  ApplicationListQuery,
  ApplicationListResult,
  ApplicationStatusPayload,
  HiringCategory,
  HiringCategoryListQuery,
  HiringCategoryListResult,
  HiringCategoryPayload,
  HiringListMeta,
  HiringListQuery,
  HiringListResult,
  HiringOverview,
  HiringPost,
  HiringPostPayload,
  JobApplication,
} from "@/components/modules/hiring";

// Hiring lives at `/hiring`, with `/hiring/categories` and
// `/hiring/applications` beneath it (all under the NEXT_PUBLIC_BACKEND_URL
// `/api/v1` base). Every response is wrapped in the standard envelope.

const EMPTY_META: HiringListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 1,
};

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: HiringListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&status=`. */
function buildQueryString(
  params: HiringListQuery | HiringCategoryListQuery | ApplicationListQuery = {},
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
 * Post create/update always goes out as multipart, whether or not new files
 * were picked: the endpoint runs the upload middleware unconditionally, and
 * sending JSON there would leave `req.body.data` unparsed.
 */
type HiringPostBody = {
  payload: HiringPostPayload;
  companyLogoFile?: File | null;
  bannerImageFile?: File | null;
};

const hiringApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Postings ───────────────────────────────────────────────────────
    getHiringPosts: builder.query({
      query: (params: HiringListQuery = {}) => ({
        url: `/hiring${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<HiringPost[]>,
      ): HiringListResult => ({
        posts: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["hirings"],
    }),

    // Status tallies for both postings and applications, in one call.
    getHiringOverview: builder.query({
      query: () => ({ url: "/hiring/overview" }),
      transformResponse: (response: Envelope<HiringOverview>) => response?.data,
      providesTags: ["hirings", "hiring-applications"],
    }),

    getHiringPost: builder.query({
      query: (id: string) => ({ url: `/hiring/${id}` }),
      transformResponse: (response: Envelope<HiringPost>) => response?.data,
      providesTags: (result, error, id) => [{ type: "hiring" as const, id }],
    }),

    createHiringPost: builder.mutation({
      query: ({
        payload,
        companyLogoFile,
        bannerImageFile,
      }: HiringPostBody) => ({
        url: "/hiring",
        method: "POST",
        body: buildMediaFormData(payload, {
          companyLogo: companyLogoFile,
          bannerImage: bannerImageFile,
        }),
      }),
      invalidatesTags: ["hirings", "hiring-categories"],
    }),

    // Partial on purpose: a status flip from the list sends only `status`,
    // while the form sends the whole body. The API's update schema makes every
    // field optional, so both are valid.
    updateHiringPost: builder.mutation({
      query: ({
        id,
        payload,
        companyLogoFile,
        bannerImageFile,
      }: {
        id: string;
        payload: Partial<HiringPostPayload>;
        companyLogoFile?: File | null;
        bannerImageFile?: File | null;
      }) => ({
        url: `/hiring/${id}`,
        method: "PATCH",
        body: buildMediaFormData(payload, {
          companyLogo: companyLogoFile,
          bannerImage: bannerImageFile,
        }),
      }),
      invalidatesTags: (result, error, { id }) => [
        "hirings",
        "hiring-categories",
        { type: "hiring" as const, id },
      ],
    }),

    // DELETE : soft. The API flips `isDeleted` and hides the row; the posting,
    // its images and its applications all survive, ready for a v2 restore.
    deleteHiringPost: builder.mutation({
      query: (id: string) => ({ url: `/hiring/${id}`, method: "DELETE" }),
      invalidatesTags: ["hirings", "hiring-categories"],
    }),

    // ─── Categories ─────────────────────────────────────────────────────
    getHiringCategories: builder.query({
      query: (params: HiringCategoryListQuery = {}) => ({
        url: `/hiring/categories${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<HiringCategory[]>,
      ): HiringCategoryListResult => ({
        categories: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["hiring-categories"],
    }),

    getHiringCategoryOptions: builder.query({
      query: () => ({ url: "/hiring/categories/options" }),
      transformResponse: (
        response: Envelope<{ label: string; value: string }[]>,
      ) => response?.data ?? [],
      providesTags: ["hiring-categories"],
    }),

    createHiringCategory: builder.mutation({
      query: (data: HiringCategoryPayload) => ({
        url: "/hiring/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["hiring-categories"],
    }),

    updateHiringCategory: builder.mutation({
      query: ({ id, data }: { id: string; data: HiringCategoryPayload }) => ({
        url: `/hiring/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      // Renaming a category changes what every posting row displays.
      invalidatesTags: ["hiring-categories", "hirings"],
    }),

    deleteHiringCategory: builder.mutation({
      query: (id: string) => ({
        url: `/hiring/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hiring-categories", "hirings"],
    }),

    // ─── Applications ───────────────────────────────────────────────────
    getHiringApplications: builder.query({
      query: (params: ApplicationListQuery = {}) => ({
        url: `/hiring/applications${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<JobApplication[]>,
      ): ApplicationListResult => ({
        applications: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["hiring-applications"],
    }),

    getHiringApplication: builder.query({
      query: (id: string) => ({ url: `/hiring/applications/${id}` }),
      transformResponse: (response: Envelope<JobApplication>) => response?.data,
      providesTags: (result, error, id) => [
        { type: "hiring-applications" as const, id },
      ],
    }),

    // The only mutation an admin has on an application: move it along the
    // pipeline, optionally leaving a note.
    updateApplicationStatus: builder.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: ApplicationStatusPayload;
      }) => ({
        url: `/hiring/applications/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["hiring-applications"],
    }),

    deleteHiringApplication: builder.mutation({
      query: (id: string) => ({
        url: `/hiring/applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["hiring-applications"],
    }),
  }),
});

export const {
  useGetHiringPostsQuery,
  useGetHiringOverviewQuery,
  useGetHiringPostQuery,
  useCreateHiringPostMutation,
  useUpdateHiringPostMutation,
  useDeleteHiringPostMutation,
  useGetHiringCategoriesQuery,
  useGetHiringCategoryOptionsQuery,
  useCreateHiringCategoryMutation,
  useUpdateHiringCategoryMutation,
  useDeleteHiringCategoryMutation,
  useGetHiringApplicationsQuery,
  useGetHiringApplicationQuery,
  useUpdateApplicationStatusMutation,
  useDeleteHiringApplicationMutation,
} = hiringApiSlice;
