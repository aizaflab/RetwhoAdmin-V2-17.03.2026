import { apiSlice } from "../api/apiSlice";

import type {
  SupportArticleItem,
  SupportArticleListQuery,
  SupportArticleListResult,
  SupportArticlePayload,
  SupportChatbotItem,
  SupportChatbotListQuery,
  SupportChatbotListResult,
  SupportChatbotPayload,
  SupportListMeta,
  SupportResourceOption,
  SupportVideoItem,
  SupportVideoListQuery,
  SupportVideoListResult,
  SupportVideoPayload,
  SupportResourceItem,
  SupportResourceListQuery,
  SupportResourceListResult,
  SupportResourcePayload,
} from "@/components/modules/support/_types/support.types";

// Support content lives at `/support/*` (under the NEXT_PUBLIC_BACKEND_URL
// `/api/v1` base). Every response is wrapped in the standard envelope —
// `{ status, statusCode, message, meta, data }`.

const EMPTY_META: SupportListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPage: 1,
};

interface Envelope<T> {
  status?: boolean;
  statusCode?: number;
  message?: string;
  meta?: SupportListMeta;
  data?: T;
}

/** Drops empty values so the URL never carries `?searchTerm=&status=`. */
function buildQueryString(params: object = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const supportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Resources ──────────────────────────────────────────────────────
    getSupportResources: builder.query({
      query: (params: SupportResourceListQuery = {}) => ({
        url: `/support/resources${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<SupportResourceItem[]>,
      ): SupportResourceListResult => ({
        resources: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["support-resources"],
    }),

    getSupportResource: builder.query({
      query: (id: string) => ({ url: `/support/resources/${id}` }),
      transformResponse: (response: Envelope<SupportResourceItem>) =>
        response?.data,
      providesTags: (result, error, id) => [
        { type: "support-resource" as const, id },
      ],
    }),

    // Published resources as { label, value } — for the article, chatbot and
    // learning-video forms.
    getSupportResourceOptions: builder.query({
      query: () => ({ url: "/support/resources/options" }),
      transformResponse: (response: Envelope<SupportResourceOption[]>) =>
        response?.data ?? [],
      providesTags: ["support-resources"],
    }),

    createSupportResource: builder.mutation({
      query: (data: SupportResourcePayload) => ({
        url: "/support/resources/create-resource",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["support-resources"],
    }),

    updateSupportResource: builder.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<SupportResourcePayload>;
      }) => ({
        url: `/support/resources/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "support-resources",
        { type: "support-resource" as const, id },
      ],
    }),

    // DELETE : soft. The API refuses (409) while articles, chatbot answers or
    // learning videos are still filed under the resource.
    deleteSupportResource: builder.mutation({
      query: (id: string) => ({
        url: `/support/resources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["support-resources"],
    }),

    // ─── Articles ───────────────────────────────────────────────────────
    getSupportArticles: builder.query({
      query: (params: SupportArticleListQuery = {}) => ({
        url: `/support/articles${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<SupportArticleItem[]>,
      ): SupportArticleListResult => ({
        articles: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["support-articles"],
    }),

    getSupportArticle: builder.query({
      query: (id: string) => ({ url: `/support/articles/${id}` }),
      transformResponse: (response: Envelope<SupportArticleItem>) =>
        response?.data,
      providesTags: (result, error, id) => [
        { type: "support-article" as const, id },
      ],
    }),

    // The API refuses an article whose resource is not published — the
    // resource options endpoint only lists published ones for that reason.
    createSupportArticle: builder.mutation({
      query: (data: SupportArticlePayload) => ({
        url: "/support/articles/create-article",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["support-articles"],
    }),

    // Partial on purpose: a status flip from the list sends only `status`,
    // while the form sends the whole body.
    updateSupportArticle: builder.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<SupportArticlePayload>;
      }) => ({
        url: `/support/articles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "support-articles",
        { type: "support-article" as const, id },
      ],
    }),

    // DELETE : soft. The API flips `isDeleted` and hides the row.
    deleteSupportArticle: builder.mutation({
      query: (id: string) => ({
        url: `/support/articles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["support-articles"],
    }),

    // ─── Chatbots ───────────────────────────────────────────────────────
    getSupportChatbots: builder.query({
      query: (params: SupportChatbotListQuery = {}) => ({
        url: `/support/chatbots${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<SupportChatbotItem[]>,
      ): SupportChatbotListResult => ({
        chatbots: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["support-chatbots"],
    }),

    getSupportChatbot: builder.query({
      query: (id: string) => ({ url: `/support/chatbots/${id}` }),
      transformResponse: (response: Envelope<SupportChatbotItem>) =>
        response?.data,
      providesTags: (result, error, id) => [
        { type: "support-chatbot" as const, id },
      ],
    }),

    // Like articles, the API refuses an answer whose resource is unpublished.
    createSupportChatbot: builder.mutation({
      query: (data: SupportChatbotPayload) => ({
        url: "/support/chatbots/create-chatbot",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["support-chatbots"],
    }),

    // Partial on purpose: a status flip from the list sends only `status`,
    // while the modal sends the whole body.
    updateSupportChatbot: builder.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<SupportChatbotPayload>;
      }) => ({
        url: `/support/chatbots/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "support-chatbots",
        { type: "support-chatbot" as const, id },
      ],
    }),

    // DELETE : soft. The API flips `isDeleted` and hides the row.
    deleteSupportChatbot: builder.mutation({
      query: (id: string) => ({
        url: `/support/chatbots/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["support-chatbots"],
    }),

    // ─── Learning videos ────────────────────────────────────────────────
    getSupportVideos: builder.query({
      query: (params: SupportVideoListQuery = {}) => ({
        url: `/support/videos${buildQueryString(params)}`,
      }),
      transformResponse: (
        response: Envelope<SupportVideoItem[]>,
      ): SupportVideoListResult => ({
        videos: response?.data ?? [],
        meta: response?.meta ?? EMPTY_META,
      }),
      providesTags: ["support-videos"],
    }),

    getSupportVideo: builder.query({
      query: (id: string) => ({ url: `/support/videos/${id}` }),
      transformResponse: (response: Envelope<SupportVideoItem>) =>
        response?.data,
      providesTags: (result, error, id) => [
        { type: "support-video" as const, id },
      ],
    }),

    // Like articles, the API refuses a video whose resource is unpublished.
    createSupportVideo: builder.mutation({
      query: (data: SupportVideoPayload) => ({
        url: "/support/videos/create-video",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["support-videos"],
    }),

    // Partial on purpose: a status flip from the list sends only `status`,
    // while the modal sends the whole body.
    updateSupportVideo: builder.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<SupportVideoPayload>;
      }) => ({
        url: `/support/videos/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "support-videos",
        { type: "support-video" as const, id },
      ],
    }),

    // DELETE : soft. The API flips `isDeleted` and hides the row.
    deleteSupportVideo: builder.mutation({
      query: (id: string) => ({
        url: `/support/videos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["support-videos"],
    }),
  }),
});

export const {
  useGetSupportResourcesQuery,
  useGetSupportResourceQuery,
  useGetSupportResourceOptionsQuery,
  useCreateSupportResourceMutation,
  useUpdateSupportResourceMutation,
  useDeleteSupportResourceMutation,
  useGetSupportArticlesQuery,
  useGetSupportArticleQuery,
  useCreateSupportArticleMutation,
  useUpdateSupportArticleMutation,
  useDeleteSupportArticleMutation,
  useGetSupportChatbotsQuery,
  useGetSupportChatbotQuery,
  useCreateSupportChatbotMutation,
  useUpdateSupportChatbotMutation,
  useDeleteSupportChatbotMutation,
  useGetSupportVideosQuery,
  useGetSupportVideoQuery,
  useCreateSupportVideoMutation,
  useUpdateSupportVideoMutation,
  useDeleteSupportVideoMutation,
} = supportApiSlice;
