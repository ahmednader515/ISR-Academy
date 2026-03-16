import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    // مسارات الإدارة (طلاب، إنشاء دورة) للأدمن ومساعد الأدمن فقط
    if (path.startsWith("/dashboard/students") || path.startsWith("/dashboard/courses/new")) {
      if (role === "ADMIN" || role === "ASSISTANT_ADMIN") {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
