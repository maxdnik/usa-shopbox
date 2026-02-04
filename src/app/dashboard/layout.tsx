// src/app/dashboard/layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardTabs from "./DashboardTabs";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const name =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Usuario";

  return (
    <div className="min-h-screen bg-[#061f3a] text-white">
      {/* ===== NAVBAR PRINCIPAL (igual Home) ===== */}
      <header className="w-full bg-[#0a2a4d] shadow">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-[#0a2a4d] text-xs font-extrabold">
              USA
            </span>
            <span>USAShopBox</span>
          </Link>

          {/* Buscador */}
          <form action="/buscar" className="flex-1 hidden md:flex items-center">
            <input
              name="q"
              placeholder="Buscá productos, marcas o tiendas en USA"
              className="w-full rounded-l-md border border-white/20 bg-white text-[#0a2a4d] px-3 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-r-md bg-[#e53950] px-4 py-2 text-sm font-semibold"
            >
              Buscar
            </button>
          </form>

          {/* Links derecha */}
          <nav className="ml-auto flex items-center gap-5 text-sm">
            <span className="hidden sm:block">Hola, {name}</span>

            <Link href="/dashboard/account" className="hover:underline">
              Mi cuenta
            </Link>

            <Link href="/api/auth/signout" className="hover:underline">
              Cerrar sesión
            </Link>

            <Link
              href="/carrito"
              className="flex items-center gap-1 hover:underline"
            >
              <span>Carrito</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== TABS INTERNOS (Mi Perfil / Mis pedidos) ===== */}
      <DashboardTabs />

      {/* ===== CONTENIDO ===== */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
