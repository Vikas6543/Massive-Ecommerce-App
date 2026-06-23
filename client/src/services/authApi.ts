import { api } from "./api";
import { TOKEN_KEYS } from "@/config/constants";
import {
  AuthResponse,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
} from "@/types/auth.types";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // REGISTER
    register: builder.mutation<MessageResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    // VERIFY OTP
    verifyEmail: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.accessToken) {
            localStorage.setItem(TOKEN_KEYS.ACCESS, data.data.accessToken);
          }
        } catch {}
      },
    }),

    // LOGIN
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.accessToken) {
            localStorage.setItem(TOKEN_KEYS.ACCESS, data.data.accessToken);
          }
        } catch {}
      },
    }),

    // LOGOUT
    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          localStorage.removeItem(TOKEN_KEYS.ACCESS);
          dispatch(api.util.resetApiState());
        }
      },
    }),

    // GET CURRENT USER
    getMe: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    // FORGOT PASSWORD
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // RESET PASSWORD
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // RESEND OTP
    resendOtp: builder.mutation<MessageResponse, { email: string }>({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
} = authApi;
