"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [totalUSD, setTotalUSD] = useState(0);
  const [creating, setCreating] = useState(false);

  // cargar carrito local
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(cart);

    const total = cart.reduce((a, b) => a + b.priceUSD * b.qty, 0);
    setTotalUSD(total);

    // cargar dirección desde /api/account
    (async () => {
      const res = await fetch("/api/account");
      const json = await res.json();
      setAddress(json.address);
    })();
  }, []);

  const createOrder = async () => {
    setCreating(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, totalUSD }),
    });

    const json = await res.json();

    if (res.ok) {
      localStorage.removeItem("cart");
      window.location.href = `/checkout/success/${json._id}`;
    } else {
      alert("Error creando orden");
    }

    setCreating(false);
  };

  if (!items.length) {
    return (
      <div className="p-6 text-white">
        Carrito vacío. <Link href="/carrito">Volver</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061a33] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Items */}
        <section className="bg-white text-black p-5 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>

          {items.map((item: any, i) => (
            <div key={i} className="flex justify-between py-2 border-b">
              <span>{item.title} x {item.qty}</span>
              <span>USD {item.priceUSD * item.qty}</span>
            </div>
          ))}

          <div className="flex justify-between font-bold pt-4">
            <span>Total</span>
            <span>USD {totalUSD}</span>
          </div>
        </section>

        {/* Dirección */}
        <section className="bg-white text-black p-5 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4">Dirección</h2>

          {address ? (
            <p>
              {address.streetName} {address.streetNumber}
              {address.floor ? `, Piso ${address.floor}` : ""}
              {address.apartment ? `, Depto ${address.apartment}` : ""}<br />
              {address.city}, {address.province} ({address.postalCode})
            </p>
          ) : (
            <p>Cargando...</p>
          )}

          <Link
            href="/dashboard/account"
            className="text-blue-600 underline block mt-3"
          >
            Editar dirección
          </Link>
        </section>

        <button
          onClick={createOrder}
          disabled={creating}
          className="w-full bg-[#D72638] p-3 rounded-lg text-lg font-semibold disabled:opacity-50"
        >
          {creating ? "Procesando..." : "Confirmar compra"}
        </button>
      </div>
    </div>
  );
}
