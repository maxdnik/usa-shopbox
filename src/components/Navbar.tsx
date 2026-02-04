"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="w-full bg-[#062b4c] text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white text-[#062b4c] px-2 py-1 rounded font-bold">USA</div>
          <span className="font-bold text-lg">USAShopBox</span>
        </Link>

        {/* BUSCADOR */}
        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="Buscá productos, marcas o tiendas en USA"
            className="w-full px-4 py-2 rounded border text-black"
          />
        </div>

        {/* LINKS DERECHA */}
        <div className="flex items-center gap-6">

          {!session ? (
            <Link href="/login" className="hover:underline">
              Iniciar sesión
            </Link>
          ) : (
            <>
              <span>Hola, {session.user?.name?.split(" ")[0]}</span>

              <Link
                href="/dashboard/profile"
                className="hover:underline"
              >
                Mi cuenta
              </Link>

              {/* 👉 AGREGADO NUEVO */}
              <Link
                href="/dashboard/orders"
                className="hover:underline"
              >
                Mis pedidos
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:underline"
              >
                Cerrar sesión
              </button>
            </>
          )}

          <Link href="/carrito" className="flex items-center gap-1">
            🛒 <span>Carrito</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
