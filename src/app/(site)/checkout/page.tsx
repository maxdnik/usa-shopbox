"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext"; // 🛠️ Sincronización con el contexto global
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { data: session } = useSession();
  
  const [address, setAddress] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  // Calculamos el total usando los precios de USA ( priceUSD )
  const totalUSD = cart.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);

  useEffect(() => {
    // Cargar datos del perfil/cuenta para el envío
    (async () => {
      try {
        const res = await fetch("/api/account");
        const json = await res.json();
        setAddress(json.address);
      } catch (err) {
        console.error("Error cargando dirección:", err);
      }
    })();
  }, []);

  const createOrder = async () => {
    if (cart.length === 0) return;
    setCreating(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        items: cart, 
        totalUSD,
        buyer: {
            fullName: session?.user?.name || address?.fullName,
            email: session?.user?.email,
            phone: address?.phone,
            dni: address?.dni,
            address: `${address?.streetName} ${address?.streetNumber}`,
            city: address?.city,
            province: address?.province,
            postalCode: address?.postalCode
        }
      }),
    });

    const json = await res.json();

    if (res.ok) {
      clearCart(); // Limpiamos el carrito global
      window.location.href = `/checkout/success/${json._id}`;
    } else {
      alert("Error al procesar la orden");
    }
    setCreating(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#0A2647] font-black uppercase tracking-widest mb-4">Tu carrito está vacío</p>
          <Link href="/" className="bg-[#D72638] text-white px-8 py-3 rounded-xl font-bold uppercase text-xs">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-[#0A2647] tracking-tighter mb-10">Checkoutt</h1>

        {/* 🛠️ LISTADO DE PRODUCTOS (Estilo image_b931da.png) */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-8">
          <div className="space-y-8">
            {cart.map((item) => (
              <div key={item.id + JSON.stringify(item.selections)} className="flex gap-6 border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100">
                  <img src={item.image} alt={item.title} className="max-h-full object-contain" />
                </div>
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-[#0A2647] uppercase tracking-tighter leading-none mb-3">
                      {item.title}
                    </h2>
                    {/* Atributos dinámicos */}
                    <div className="space-y-1">
                        {Object.entries(item.selections ?? {}).map(([key, val]) => (
                        <p key={key} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {key}: <span className="text-[#0A2647]">{val}</span>
                        </p>
                      ))}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Cantidad: <span className="text-[#0A2647]">{item.quantity}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="mt-4 text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">USD</p>
                    <p className="text-3xl font-black text-[#0A2647] tracking-tighter">
                      {item.priceUSD.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🛠️ DATOS DEL COMPRADOR (Estilo image_b931da.png) */}
        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b pb-4">
            Datos del comprador e información de envío
          </p>
          
          <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
            {[
              { label: "Nombre", value: session?.user?.name || address?.fullName || "Max" },
              { label: "Email", value: session?.user?.email || "maxidimnik@gmail.com" },
              { label: "Teléfono", value: address?.phone || "5491139017722" },
              { label: "DNI/CUIT", value: address?.dni || "33034139" },
              { label: "Dirección", value: address ? `${address.streetName} ${address.streetNumber} ${address.floor || ""} ${address.apartment || ""}` : "Pueyrredon 2466 Piso 7 Dpto D" },
              { label: "Ciudad", value: address?.city || "Recoleta" },
              { label: "Provincia", value: address?.province || "Buenos Aires" },
              { label: "Código Postal", value: address?.postalCode || "1119" }
            ].map((info) => (
              <div key={info.label} className="flex items-baseline gap-4">
                <span className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest w-24 shrink-0">{info.label}:</span>
                <span className="text-sm font-bold text-slate-700 uppercase">{info.value || "---"}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Total del pedido</p>
                <p className="text-4xl font-black text-[#0A2647] tracking-tighter">USD {totalUSD.toLocaleString()}</p>
            </div>
            <button
              onClick={createOrder}
              disabled={creating}
              className="w-full md:w-auto bg-[#D72638] text-white px-12 py-5 rounded-[24px] text-lg font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition disabled:opacity-50"
            >
              {creating ? "Procesando..." : "Confirmar compra"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}