import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCredentials, logout, setLoading } from "@/store/slices/authSlice";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetMeQuery,
  // useVerifyEmailMutation,
  // useResendOtpMutation,
  useVerifyEmailTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/services/authApi";
import {
  LoginRequest,
  RegisterRequest,
  // VerifyOtpRequest,
} from "@/types/auth.types";
import { ROUTES } from "@/config/constants";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAppSelector((state) => state.auth);

  // RTK QUERY HOOKS
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] =
    useRegisterMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  // const [verifyEmailMutation, { isLoading: isVerifyLoading }] =
  //   useVerifyEmailMutation();
  // const [resendOtpMutation, { isLoading: isResendLoading }] =
  //   useResendOtpMutation();
  const [verifyEmailTokenMutation, { isLoading: isVerifyEmailTokenLoading }] =
    useVerifyEmailTokenMutation();
  const [forgotPasswordMutation, { isLoading: isForgotPasswordLoading }] =
    useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetPasswordLoading }] =
    useResetPasswordMutation();

  // FETCH CURRENT USER ON APP LOAD
  const { data: meData, isLoading: isMeLoading } = useGetMeQuery(undefined, {
    skip: !isLoggedIn,
  });

  useEffect(() => {
    if (meData?.data?.user) {
      dispatch(setCredentials(meData.data.user));
    }
  }, [meData, dispatch]);

  useEffect(() => {
    dispatch(setLoading(isMeLoading));
  }, [isMeLoading, dispatch]);

  // REGISTER
  const register = async (data: RegisterRequest) => {
    try {
      const result = await registerMutation(data).unwrap();
      toast.success(
        result.message || "Registration successful! Please verify your email.",
      );
      router.push(ROUTES.LOGIN);
    } catch (error: any) {
      toast.error(error?.data?.message || "Registration failed!");
    }
  };

  // LOGIN
  const login = async (data: LoginRequest) => {
    try {
      const result = await loginMutation(data).unwrap();
      dispatch(setCredentials(result.data.user));
      toast.success("Welcome back!");

      // ROLE BASED REDIRECT
      const role = result.data.user.role;
      if (role === "admin") {
        router.push(ROUTES.ADMIN_DASHBOARD);
      } else if (role === "seller") {
        router.push(ROUTES.SELLER_DASHBOARD);
      } else {
        router.push(ROUTES.HOME);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Login failed!");
    }
  };

  // VERIFY OTP
  // const verifyEmail = async (data: VerifyOtpRequest) => {
  //   try {
  //     const result = await verifyEmailMutation(data).unwrap();
  //     toast.success(result.message || "Email verified successfully!");
  //     router.push(ROUTES.LOGIN);
  //   } catch (error: any) {
  //     toast.error(error?.data?.message || "Invalid OTP!");
  //   }
  // };

  // RESEND OTP
  // const resendOtp = async (email: string) => {
  //   try {
  //     const result = await resendOtpMutation({ email }).unwrap();
  //     toast.success(result.message || "OTP sent successfully!");
  //     return true; // so component can reset timer
  //   } catch (error: any) {
  //     toast.error(error?.data?.message || "Failed to resend OTP!");
  //     return false;
  //   }
  // };

  const verifyEmailToken = async (token: string) => {
    try {
      const result = await verifyEmailTokenMutation(token).unwrap();
      toast.success(result.message || "Email verified successfully!");
      setTimeout(() => router.push(ROUTES.LOGIN), 2000);
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid or expired link.");
      setTimeout(() => router.push(ROUTES.REGISTER), 2000);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const result = await forgotPasswordMutation({ email }).unwrap();
      toast.success(result.message || "Reset link sent! Check your email.");
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong!");
      return false;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const result = await resetPasswordMutation({ token, password }).unwrap();
      toast.success(result.message || "Password reset successfully!");
      router.push(ROUTES.LOGIN);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reset password!");
    }
  };

  // LOGOUT
  const logoutUser = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      toast.success("Logged out successfully!");
      router.push(ROUTES.LOGIN);
    } catch {
      // Even if API fails — clear local state
      dispatch(logout());
      router.push(ROUTES.LOGIN);
    }
  };

  return {
    // STATE
    user,
    isLoggedIn,
    isLoading,

    // ACTIONS
    login,
    register,
    logoutUser,
    verifyEmailToken,
    forgotPassword,
    resetPassword,
    // verifyEmail,
    // resendOtp,

    // LOADING STATES
    isLoginLoading,
    isRegisterLoading,
    isLogoutLoading,
    isVerifyEmailTokenLoading,
    isForgotPasswordLoading,
    isResetPasswordLoading,
    // isResendLoading,
  };
}
