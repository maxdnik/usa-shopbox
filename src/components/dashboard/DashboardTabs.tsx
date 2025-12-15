// src/components/dashboard/DashboardTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardTabs() {
  const pathname = usePathname();

  const isProfile = pathname.startsWith("/dashboard/account");
  const isOrders = pathname.startsWith("/dashboard/orders");

  return (
    <div className="flex items-center gap-8 border-b border-white/10 pb-3 mb-8">
      <Link
        href="/dashboard/account"
        className={`text-lg font-semibold pb-2 border-b-2 transition ${
          isProfile
            ? "border-red-500 text-red-400"
            : "border-transparent text-white/80 hover:text-white hover:border-white/20"
        }`}
      >
        Mi Perfil
      </Link>

      <Link
        href="/dashboard/orders"
        className={`text-lg font-semibold pb-2 border-b-2 transition ${
          isOrders
            ? "border-red-500 text-red-400"
            : "border-transparent text-white/80 hover:text-white hover:border-white/20"
        }`}
      >
        Mis pedidos
      </Link>
    </div>
  );
}
