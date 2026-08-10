import { apiSlice } from "../api/apiSlice";

// Note: login is NOT here. It goes through next-auth's credentials provider
// (app/api/auth/[...nextauth]/route.js), which calls /auth/login server-side
// and sets the session cookie. Calling /auth/login directly would return
// tokens with no session attached.
const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST : Forgot Password — emails a reset link. Body: { email }
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `/admin/employees/auth/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),

    // POST : Reset Password — the token comes from the emailed link's ?token=
    // query param. Body: { token, newPassword, confirmPassword }
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/admin/employees/auth/reset-password`,
        method: "POST",
        body: data,
      }),
    }),

    // POST : Logout — revokes the refresh token on the server. The access
    // token is attached by prepareHeaders, so no body is needed.
    logout: builder.mutation({
      query: () => ({
        url: `/admin/employees/auth/logout`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApiSlice;
