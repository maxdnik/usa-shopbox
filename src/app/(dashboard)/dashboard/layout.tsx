// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";

import HeaderEcom from "@/components/home/HeaderEcom";
import Footer from "@/components/home/Footer";
import DashboardTabs from "./DashboardTabs";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#061f3a] text-white">
      {/* ✅ MISMO HEADER GLOBAL que el resto del sitio */}
      {/* HeaderEcom usa useSearchParams -> lo envolvemos en Suspense */}
      <Suspense fallback={null}>
        <HeaderEcom />
      </Suspense>

      {/* ✅ Tabs internas del dashboard */}
      <DashboardTabs />

      {/* ✅ Contenido */}
      <main className="flex-1 mx-auto max-w-6xl px-4 py-8">{children}</main>

      {/* ✅ MISMO FOOTER GLOBAL */}
      <Footer />
    </div>
  );
}
