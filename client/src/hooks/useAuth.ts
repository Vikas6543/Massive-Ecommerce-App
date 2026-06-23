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
} from "@/services/authApi";
import { LoginRequest, RegisterRequest } from "@/types/auth.types";
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
      toast.success(result.message || "Registration successful!");
      // Redirect to verify email with email in query param
      router.push(
        `${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(data.email)}`,
      );
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

    // LOADING STATES
    isLoginLoading,
    isRegisterLoading,
    isLogoutLoading,
  };
}
