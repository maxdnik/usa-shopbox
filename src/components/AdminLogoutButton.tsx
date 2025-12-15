// src/components/AdminLogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    // Forzamos ir al login
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-800"
    >
      Cerrar sesión
    </button>
  );
}
