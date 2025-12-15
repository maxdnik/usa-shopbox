"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function HeaderEcom() {
  const { cart } = useCart();
  const totalItems = cart.length;

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Nombre del usuario (Google o registro manual)
  const userName = session?.user?.name?.split(" ")[0] || ""; // solo primer nombre

  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/buscar?query=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="bg-[#0A2647] text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-xs font-bold text-[#0A2647]">
            USA
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            USAShopBox
          </span>
        </Link>

        {/* Buscador */}
        <div className="flex-1">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center rounded-md overflow-hidden bg-white"
          >
            <input
              type="text"
              placeholder="Buscá productos, marcas o tiendas en USA"
              className="flex-1 px-3 py-2 text-sm text-slate-800 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-[#D72638] hover:bg-[#b81e2d] transition"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Acciones derecha */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {!isLoggedIn ? (
            // ---------------------
            // SI NO ESTÁ LOGUEADO
            // ---------------------
            <>
              <Link href="/login" className="hover:underline">
                Ingresar
              </Link>

              <Link
                href="/register"
                className="border border-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-white hover:text-[#0A2647] transition"
              >
                Crear cuenta
              </Link>
            </>
          ) : (
            // ---------------------
            // SI ESTÁ LOGUEADO
            // ---------------------
            <div className="flex flex-col items-start text-xs">
              <span className="opacity-80 text-[11px]">Hola, {userName}</span>

              <div className="flex gap-3 mt-1">
                <Link href="/dashboard/account" className="hover:underline">
                  Mi cuenta
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:underline text-white/90"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {/* Carrito */}
          <Link
            href="/carrito"
            className="relative flex items-center gap-1 text-xs font-semibold"
          >
            <span className="text-lg">🛒</span>
            <span>Carrito</span>

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D72638] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
