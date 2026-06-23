import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// PROTECTED ROUTE PATTERNS
const userRoutes = [
  "/profile",
  "/orders",
  "/wishlist",
  "/sessions",
  "/checkout",
];
const sellerRoutes = ["/seller"];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // GET TOKEN FROM COOKIE
  const token = request.cookies.get("accessToken")?.value;

  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));
  const isSellerRoute = sellerRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // NOT LOGGED IN — redirect to login
  if ((isUserRoute || isSellerRoute || isAdminRoute) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // DECODE TOKEN — check role
  if (token && (isSellerRoute || isAdminRoute)) {
    try {
      // Decode JWT payload (no verification — just read role)
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );

      const role = payload?.role;

      // NON-ADMIN trying to access admin routes
      if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // NON-SELLER trying to access seller routes
      if (isSellerRoute && role !== "seller" && role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Invalid token — redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// MATCHER — which routes middleware runs on
export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/sessions/:path*",
    "/checkout/:path*",
    "/seller/:path*",
    "/admin/:path*",
  ],
};
