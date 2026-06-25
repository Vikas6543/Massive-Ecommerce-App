const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const APP_NAME = "Massive E-commerce";

const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PRODUCTS: "/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  SEARCH: "/search",
  PROFILE: "/profile",
  ORDERS: "/orders",
  WISHLIST: "/wishlist",
  SESSIONS: "/sessions",
  SELLER_DASHBOARD: "/seller/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
} as const;

const TOKEN_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
} as const;

// BRAND COLORS
const BRAND = {
  primary: "#4F46E5", // indigo-600
  primaryHover: "#4338CA", // indigo-700
  primaryLight: "#EEF2FF", // indigo-50
  primaryText: "#4F46E5", // indigo-600
} as const;

export { API_BASE_URL, SOCKET_URL, APP_NAME, ROUTES, TOKEN_KEYS, BRAND };
