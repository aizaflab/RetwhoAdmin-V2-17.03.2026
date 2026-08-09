import { apiSlice } from "../api/apiSlice";

// Note: login is NOT here. It goes through next-auth's credentials provider
// (app/api/auth/[...nextauth]/route.js), which calls /auth/login server-side
// and sets the session cookie. Calling /auth/login directly would return
// tokens with no session attached.
const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST : Forgot Password
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password-request`,
        method: "POST",
        body: data,
      }),
    }),

    // POST : Reset Password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password-confirm`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useForgotPasswordMutation, useResetPasswordMutation } =
  authApiSlice;
