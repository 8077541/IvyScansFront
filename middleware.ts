import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USE_MOCK_API } from "./lib/config";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // If using mock API, bypass authentication checks
  if (USE_MOCK_API) {
    console.log("[Middleware] Using mock API, bypassing auth checks");
    return NextResponse.next();
  }

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Check for token in cookies and headers
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("next-auth.session-token")?.value;

  const isAuthPage = pathname.startsWith("/auth");
  const isAccountPage = pathname.startsWith("/account");

  console.log("[Middleware] Check:", {
    path: pathname,
    hasToken: !!token,
    isAuthPage,
    isAccountPage,
  });

  // For account pages, check if token exists
  if (isAccountPage && !token) {
    console.log(
      "[Middleware] Redirecting to auth page - no token for account page"
    );

    // Store the original URL to redirect back after login
    const url = new URL("/auth", request.url);
    url.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(url);
  }

  // If trying to access auth pages while logged in
  if (isAuthPage && token) {
    console.log("[Middleware] Redirecting to home - already logged in");

    // Check if there's a callback URL to redirect to
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/account/:path*", "/auth/:path*"],
};
