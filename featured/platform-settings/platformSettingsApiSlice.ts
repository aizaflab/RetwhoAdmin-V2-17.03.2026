import { apiSlice } from "../api/apiSlice";

import type {
  PlatformSettings,
  PlatformSettingsPayload,
} from "@/components/modules/platform-settings";

// The platform's commission and online payment fees, at `/admin/settings`.

interface Envelope<T> {
  status?: boolean;
  message?: string;
  data?: T;
}

const platformSettingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformSettings: builder.query<PlatformSettings | undefined, void>({
      query: () => "/admin/settings",
      transformResponse: (res: Envelope<PlatformSettings>) => res?.data,
      providesTags: ["platform-settings"],
    }),

    updatePlatformSettings: builder.mutation<
      PlatformSettings | undefined,
      PlatformSettingsPayload
    >({
      query: (body) => ({ url: "/admin/settings", method: "PATCH", body }),
      transformResponse: (res: Envelope<PlatformSettings>) => res?.data,
      invalidatesTags: ["platform-settings"],
    }),
  }),
});

export const {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} = platformSettingsApiSlice;
