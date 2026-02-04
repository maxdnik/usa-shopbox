"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import HeaderEcom from "@/components/home/HeaderEcom";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  // Si ya está logueado, afuera al dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // form email/pass
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------
  // Login Email/Pass (tu API)
  // ---------------------------
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (!res?.ok) {
          setError("Usuario o contraseña inválidos");
          return;
        }

        router.push("/dashboard");
      } catch {
        setError("No se pudo ingresar");
      } finally {
        setLoading(false);
      }
    };


  // ---------------------------
  // Login Google (NextAuth)
  // ---------------------------
  const handleGoogle = async () => {
    setError(null);
    setLoading(true);

    // NextAuth maneja todo el OAuth
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  // mientras NextAuth carga estado
  if (status === "loading") return null;

  return (
    <>
      {/* NAVBAR */}
      <HeaderEcom />

      {/* LOGIN CARD */}
      <main className="min-h-[calc(100vh-64px)] bg-[#0A2647] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Ingresar</h1>
          <p className="text-sm text-slate-600 mt-1">
            Accedé a tu panel de envíos.
          </p>

          {/* GOOGLE */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold py-2.5 rounded-md text-sm transition flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path
                  fill="#FFC107"
                  d="M43.6 20.4H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.64-.4-3.6z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.9C14.7 15.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.9 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.3 39.7 16.1 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.4H42V20H24v8h11.3c-1.1 3-3.4 5.4-6.3 6.8l6.3 5.2C39.2 36.4 44 30.7 44 24c0-1.34-.14-2.64-.4-3.6z"
                />
              </svg>
              Continuar con Google
            </button>
          </div>

          {/* divisor */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs text-slate-500">o con email</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* EMAIL/PASS */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              disabled={loading}
              className="w-full bg-[#D72638] hover:bg-[#E84A5F] text-white font-semibold py-2.5 rounded-md text-sm transition"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-sm text-slate-600 mt-4">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-[#D72638] font-semibold">
              Crear cuenta
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
