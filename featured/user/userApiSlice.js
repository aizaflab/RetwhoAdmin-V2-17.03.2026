import { apiSlice } from "../api/apiSlice";

const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user list (GET)
    getUserList: builder.query({
      query: (paramsQuery) => ({
        url: `/user${paramsQuery}`,
      }),
      providesTags: ["users"],
    }),

    // Get user profile (GET)
    getProfile: builder.query({
      query: () => ({
        url: "/user/profile",
      }),
      providesTags: ["user"],
    }),

    // Create user (POST)
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["users", "user"],
    }),

    // Update user (PATCH)
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["users", "user"],
    }),

    // Delete user (DELETE)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

// Export hooks for using the defined API endpoints
export const {
  useCreateUserMutation,
  useGetUserListQuery,
  useGetProfileQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
