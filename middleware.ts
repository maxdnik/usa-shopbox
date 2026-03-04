// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const email = (token as any)?.email;

  // =========================
  // 1) ZONA ADMIN
  // =========================
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isAdminLogin = pathname === "/admin/login";

    // Si sos Maxi => pasás
    if (email === "maxidimnik@gmail.com") {
      // si intentás entrar al login admin estando logueado => te mando a /admin
      if (isAdminLogin) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    // si NO sos Maxi:
    // - dejá entrar SOLO a /admin/login
    if (!isAdminLogin) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // =========================
  // 2) ZONA CLIENTES (/dashboard)
  // =========================
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/login", req.url);

      // estándar next-auth: callbackUrl (NO inventes redirectTo)
      url.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
};