// src/app/admin/login/page.tsx
import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";

export const dynamic = "force-dynamic"; 
// opcional pero recomendado: evita que Next intente prerenderizar estático

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Cargando...</div>}>
      <AdminLoginClient />
    </Suspense>
  );
}
