// src/app/admin/login/AdminLoginClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectTo = searchParams.get("redirectTo") || "/admin/orders";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // tu lógica actual de login admin:
    const ok = password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD; 
    // o pegale a tu endpoint /api/admin/login si ya lo tenés

    if (!ok) {
      setError("Contraseña incorrecta");
      return;
    }

    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm p-6 rounded-xl shadow-sm border"
      >
        <h1 className="text-xl font-semibold mb-4">Admin Login</h1>

        <label className="text-sm font-medium">Contraseña</label>
        <input
          type="password"
          className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}

        <button
          type="submit"
          className="mt-4 w-full bg-black text-white py-2 rounded-md text-sm font-semibold"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
