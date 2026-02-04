"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AdminLoginClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: email,
      password: password,
      // 🚩 SEÑAL DE SEGURIDAD: Avisamos que este login viene del Panel Admin
      loginType: "admin"
    });

    if (result?.error) {
      setError("Acceso denegado o credenciales inválidas");
      setLoading(false);
    } else {
      router.refresh();
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm p-8 rounded-[32px] shadow-xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#0A2647] uppercase tracking-tighter">USA SHOP BOX</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Acceso Administrativo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuario / Email</label>
            <input
              type="text"
              className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-[#0A2647] focus:outline-none focus:border-[#0A2647] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-[#0A2647] focus:outline-none focus:border-[#0A2647] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A2647] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Verificando..." : "Entrar al Panel"}
          </button>
        </div>
      </form>
    </div>
  );
}