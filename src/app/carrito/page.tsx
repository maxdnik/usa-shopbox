"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import HeaderEcom from "@/components/home/HeaderEcom";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

// === Google Icon SVG Component ===
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.1 17.74 9.5 24 9.5z" />
    <path fill="#34A853" d="M46.1 24.55c0-1.57-.14-3.09-.39-4.55H24v9.02h12.55c-.56 2.95-2.24 5.45-4.75 7.13l7.33 5.69C43.42 37.43 46.1 31.39 46.1 24.55z" />
    <path fill="#4A90E2" d="M9.53 28.41C8.55 26.15 8 23.59 8 21c0-2.59.55-5.15 1.53-7.41l-7.98-6.19C.92 11.05 0 14.45 0 18c0 3.55.92 6.95 2.55 10.09l6.98-5.68z" />
    <path fill="#FBBC05" d="M24 46c6.48 0 11.91-2.38 15.97-6.47l-7.33-5.69C30.29 35.89 27.24 37 24 37c-6.26 0-11.57-3.6-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  dni: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
};

export default function CartPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const { cart, removeFromCart, clearCart } = useCart();

  const liveTotal = cart.reduce(
    (acc, item) => acc + item.estimatedUSD * (item.quantity ?? 1),
    0
  );

  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const total = finalTotal ?? liveTotal;

  const [form, setForm] = useState<CheckoutForm>({
    fullName: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: "",
    dni: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ 1) Si está logueado, traer datos del perfil y autocompletar
  useEffect(() => {
    if (!isLoggedIn) {
      setProfileLoaded(true);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/account", { cache: "no-store" });
        const acc = await res.json();

        const addr = acc.address || {};

        const fullAddress = [
          addr.streetName,
          addr.streetNumber,
          addr.floor ? `Piso ${addr.floor}` : "",
          addr.apartment ? `Dpto ${addr.apartment}` : "",
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

        setForm((prev) => ({
          ...prev,
          fullName: acc.name || session?.user?.name || prev.fullName,
          email: acc.email || session?.user?.email || prev.email,
          phone: acc.phone || prev.phone,
          dni: acc.dni || prev.dni,
          province: addr.province || prev.province,
          city: addr.city || prev.city,
          address: fullAddress || prev.address,
          postalCode: addr.postalCode || prev.postalCode,
        }));
      } catch (e) {
        console.error("Error cargando perfil en carrito:", e);
      } finally {
        setProfileLoaded(true);
      }
    })();
  }, [isLoggedIn, session]);

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // ✅ 2) Chequear si el perfil ya está completo
  const isProfileComplete =
    form.fullName &&
    form.email &&
    form.phone &&
    form.dni &&
    form.province &&
    form.city &&
    form.address &&
    form.postalCode;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isProfileComplete) {
      setError("Por favor completá todos los campos obligatorios.");
      return;
    }

    if (cart.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    const buyer = { ...form };

    const items = cart.map((item) => ({
      productId: item.id,
      title: item.title,
      store: item.store,
      imageUrl: item.imageUrl,
      quantity: item.quantity ?? 1,
      estimatedUSD: item.estimatedUSD,
    }));

    const totalUSD = items.reduce(
      (acc, it) => acc + it.estimatedUSD * it.quantity,
      0
    );

    try {
      setLoading(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer, items, totalUSD }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Hubo un problema al crear tu orden.");
        setLoading(false);
        return;
      }

      // json viene del POST /api/orders
      // tu API devuelve { ok, orderNumber, mongoId, ... }

      const orderId = json.mongoId || json.order?._id || json._id;
      const orderNumber = json.orderNumber;

      clearCart();

      // ✅ redirigimos a éxito con params
      window.location.href = `/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}&totalUSD=${totalUSD}`;
      return;

      setLoading(false);
    } catch (err) {
      setError("Error de conexión al crear la orden.");
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderEcom />

      <main className="bg-[#f5f5f5] min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              Checkout
            </h1>

            {orderConfirmed ? (
              <div>Compra confirmada...</div>
            ) : cart.length === 0 ? (
              <p className="text-gray-700">Tu carrito está vacío.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Productos */}
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between border-b pb-6">
                      <div className="flex items-center gap-5">
                        <img
                          src={item.imageUrl || "/placeholder.png"}
                          className="w-24 h-24 bg-gray-100 rounded-lg border object-contain"
                        />

                        <div>
                          <p className="font-semibold text-lg">
                            {item.title}
                          </p>
                          <p className="text-sm">Cantidad: {item.quantity}</p>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 text-sm mt-2"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>

                      <p className="font-semibold text-xl">USD {item.estimatedUSD}</p>
                    </div>
                  ))}
                </div>

                {/* Login solo si NO hay sesión */}
                {!isLoggedIn && (
                  <div className="bg-white py-4 px-8 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-center text-lg font-semibold mb-2">
                      ¿Ya tenés cuenta?
                    </p>

                    <div className="flex justify-center gap-4 flex-wrap mb-2">
                      <button className="px-4 py-2 border rounded-md flex gap-2 bg-white hover:bg-gray-100 shadow-sm">
                        <GoogleIcon />
                        Ingresar con Google
                      </button>

                      <Link
                        href="/login"
                        className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100 shadow-sm"
                      >
                        Ingresar con email
                      </Link>
                    </div>
                  </div>
                )}

                {/* ✅ Si está logueado y perfil completo: mostrar resumen, NO inputs */}
                {profileLoaded && isLoggedIn && isProfileComplete ? (
                  <div className="pt-2 bg-gray-50 border rounded-xl p-5">
                    <h2 className="text-xl font-semibold mb-3">
                      Datos del comprador y envío
                    </h2>

                    <div className="text-sm text-gray-800 space-y-1">
                      <p><b>Nombre:</b> {form.fullName}</p>
                      <p><b>Email:</b> {form.email}</p>
                      <p><b>Teléfono:</b> {form.phone}</p>
                      <p><b>DNI/CUIT:</b> {form.dni}</p>
                      <p><b>Dirección:</b> {form.address}</p>
                      <p><b>Ciudad:</b> {form.city}</p>
                      <p><b>Provincia:</b> {form.province}</p>
                      <p><b>Código postal:</b> {form.postalCode}</p>
                    </div>

                    <Link
                      href="/dashboard/account"
                      className="text-blue-600 underline text-sm block mt-3"
                    >
                      Editar datos en Mi Perfil
                    </Link>
                  </div>
                ) : (
                  /* ✅ Si falta algo (o no está logueado): mostrar inputs */
                  <div className="pt-2">
                    <h2 className="text-xl font-semibold mb-4">
                      Datos del comprador y envío
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                      <div>
                        <label>Nombre y apellido *</label>
                        <input
                          className="border rounded-md px-3 py-2"
                          value={form.fullName}
                          onChange={(e) => handleChange("fullName", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Email *</label>
                        <input
                          type="email"
                          className="border rounded-md px-3 py-2"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Teléfono (WhatsApp) *</label>
                        <input
                          className="border rounded-md px-3 py-2"
                          value={form.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>DNI / CUIT *</label>
                        <input
                          className="border rounded-md px-3 py-2"
                          value={form.dni}
                          onChange={(e) => handleChange("dni", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Provincia *</label>
                        <input
                          className="border rounded-md px-3 py-2"
                          value={form.province}
                          onChange={(e) => handleChange("province", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Ciudad *</label>
                        <input
                          className="border rounded-md px-3 py-2"
                          value={form.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label>Dirección (calle, número, piso, depto) *</label>
                        <input
                          className="border rounded-md px-3 py-2"
                          value={form.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Código postal *</label>
                        <input
                          className="border rounded-md px-3 py-2"
                          value={form.postalCode}
                          onChange={(e) => handleChange("postalCode", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumen */}
                <div className="pt-2">
                  <h2 className="text-xl font-semibold mb-2">Resumen de compra</h2>

                  <div className="flex justify-between text-lg font-semibold text-green-700">
                    <span>Total estimado (USD)</span>
                    <span>USD {total.toFixed(2)}</span>
                  </div>

                  {error && <p className="text-red-600 mt-2">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-4 rounded-lg mt-6 text-lg font-semibold hover:bg-red-700 transition"
                  >
                    {loading ? "Procesando..." : "Ir al pago (simulado)"}
                  </button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full py-3 rounded-lg mt-3 bg-gray-200 hover:bg-gray-300"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
