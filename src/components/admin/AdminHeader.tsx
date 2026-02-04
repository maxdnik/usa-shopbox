"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminHeader() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Inventario", href: "/admin/products" },
    { name: "Órdenes", href: "/admin/orders" },
    { name: "Pricing", href: "/admin/pricing" },
  ];

  return (
    <nav className="bg-[#0A2647] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-8">
        {/* LOGO BOX */}
        <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-white text-[#0A2647] font-black p-2 rounded-lg text-xl leading-none">USA</div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter uppercase leading-none">USAShopBox</span>
            <span className="text-[8px] font-black tracking-[0.3em] uppercase text-white/50">Panel de Control</span>
          </div>
        </Link>

        {/* LINKS DE NAVEGACIÓN UNIFICADOS */}
        <div className="hidden md:flex items-center bg-white/5 p-1 rounded-xl border border-white/10 ml-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? "bg-white text-[#0A2647] shadow-md" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-[#ff3347] text-[9px] px-2 py-1 rounded-md font-black tracking-widest animate-pulse">ADMIN</div>
        <button 
          onClick={() => signOut({ callbackUrl: "/" })} 
          className="border border-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}