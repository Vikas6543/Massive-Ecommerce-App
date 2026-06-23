import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store";
import { API_BASE_URL, TOKEN_KEYS } from "@/config/constants";
import { logout, setCredentials } from "@/store/slices/authSlice";

// BASE QUERY WITH AUTH
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token =
      (getState() as RootState).auth.user !== null
        ? localStorage.getItem(TOKEN_KEYS.ACCESS)
        : null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// BASE QUERY WITH TOKEN REFRESH
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // IF 401 — try refresh token
  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult?.data) {
      const data = refreshResult.data as any;
      const newAccessToken = data?.data?.accessToken;

      if (newAccessToken) {
        // Store new token
        localStorage.setItem(TOKEN_KEYS.ACCESS, newAccessToken);

        // Update user in Redux
        api.dispatch(setCredentials(data?.data?.user));

        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      }
    } else {
      // Refresh failed — logout
      api.dispatch(logout());
      localStorage.removeItem(TOKEN_KEYS.ACCESS);
    }
  }

  return result;
};

// BASE API
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Products",
    "Cart",
    "Orders",
    "Wishlist",
    "Notifications",
    "Reviews",
    "Categories",
    "Brands",
    "Users",
    "Coupons",
    "SellerProducts",
    "SellerOrders",
    "AdminUsers",
    "AdminOrders",
  ],
  endpoints: () => ({}),
});
