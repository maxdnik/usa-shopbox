// src/app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// Ya no necesitamos redirect aquí porque el Middleware se encarga de la seguridad
// import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Eliminamos la validación de sesión AQUÍ para evitar conflictos con el login de admin.
  // El archivo src/middleware.ts ya está protegiendo las rutas y redirigiendo 
  // correctamente a /admin/login si no hay acceso.
  
  return <>{children}</>;
}