// src/app/dashboard/DashboardTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardTabs() {
  const pathname = usePathname();
  const isAccount = pathname.startsWith("/dashboard/account");
  const isOrders = pathname.startsWith("/dashboard/orders");

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="flex gap-10 pt-6 pb-3 border-b border-white/10 text-base font-semibold">
        <Link
          href="/dashboard/account"
          className={[
            "pb-2 border-b-2 transition",
            isAccount
              ? "border-[#ff4d63] text-[#ff4d63]"
              : "border-transparent text-white/90 hover:border-[#ff4d63] hover:text-[#ff4d63]",
          ].join(" ")}
        >
          Mi Perfil
        </Link>

        <Link
          href="/dashboard/orders"
          className={[
            "pb-2 border-b-2 transition",
            isOrders
              ? "border-[#ff4d63] text-[#ff4d63]"
              : "border-transparent text-white/90 hover:border-[#ff4d63] hover:text-[#ff4d63]",
          ].join(" ")}
        >
          Mis pedidos
        </Link>
      </div>
    </div>
  );
}
