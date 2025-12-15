// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  const isDashboard =
    req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
