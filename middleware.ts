// middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Protect Admin Routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // 2. Protect Teacher Routes
    if (path.startsWith("/teacher") && token?.role !== "TEACHER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // 3. Protect Student Routes
    // Notice: We allow CRs to access student routes since CRs are technically students
    if (path.startsWith("/student") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
  },
  {
    callbacks: {
      // This ensures the middleware only runs if the user actually has a token.
      // If they don't have a token, it automatically redirects them to the signIn page.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Define which routes this middleware should protect
export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};