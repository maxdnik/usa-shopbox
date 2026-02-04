import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const email = token?.email;
    const path = req.nextUrl.pathname;

    // --- 1. ZONA ADMINISTRATIVA (Caminos Paralelos) ---
    // Atrapamos todo lo que sea /admin o /api/admin
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      
      const isLogin = path === "/admin/login";

      // A) SI YA SOS EL ADMIN (maxidimnik@gmail.com)
      if (email === "maxidimnik@gmail.com") {
        // Si intentas ir al login, te mando al dashboard (ya estás dentro)
        if (isLogin) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        // Si vas a cualquier otra parte de admin, PASÁ, JEFE.
        return NextResponse.next();
      }

      // B) SI NO SOS EL ADMIN (Sos anónimo, o sos un cliente logueado)
      if (!isLogin) {
        // 🔥 AQUÍ ESTABA EL PROBLEMA: Antes te mandaba a "/", ahora te manda al Login de Admin
        const url = new URL("/admin/login", req.url);
        // Guardamos a dónde querías ir para volverte ahí después de loguearte
        url.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(url);
      }

      // C) Si estás en /admin/login y no sos admin
      // Dejamos pasar para que veas el formulario y pongas la contraseña
      return NextResponse.next();
    }

    // --- 2. ZONA CLIENTES (/dashboard) ---
    // Esta lógica sigue igual: si no hay usuario, va al login de clientes
    if (path.startsWith("/dashboard")) {
      if (!token) {
        const url = new URL("/login", req.url);
        url.searchParams.set("redirectTo", path);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        // 🔥 IMPORTANTE: Le decimos a NextAuth "Si es ruta de admin, dejame a mí"
        // Devolvemos TRUE para evitar que NextAuth te mande al login general automáticamente.
        // Así nuestra función de arriba toma el control.
        if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
          return true;
        }

        // Para el resto (dashboard), seguridad normal (requiere token)
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*"
  ],
};