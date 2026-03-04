// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import HeaderEcom from "@/components/home/HeaderEcom";
import Footer from "@/components/home/Footer";
import DashboardTabs from "./DashboardTabs";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // ✅ Si NO hay sesión, afuera: login con callback
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#061f3a] text-white">
      <Suspense fallback={null}>
        <HeaderEcom />
      </Suspense>

      <DashboardTabs />

      <main className="flex-1 mx-auto max-w-6xl px-4 py-8">{children}</main>

      <Footer />
    </div>
  );
}