"use client";

import HeaderEcom from "@/components/home/HeaderEcom";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  // 1. Cálculo del total usando los campos disponibles del producto
 const total = cart.reduce((acc, item) => acc + ((item.priceUSD ?? item.estimatedUSD ?? 0) * (item.quantity ?? 1)), 0);

  return (
    <>
      <HeaderEcom />

      <main className="bg-[#f5f5f5] min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4">

          {/* CARD PRINCIPAL - ESTILO APPLE CONSISTENTE */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">

            {/* Si carrito vacío */}
            {cart.length === 0 ? (
              <p className="text-gray-400 font-bold uppercase tracking-widest text-center py-10">Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-8">
                <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Checkouttt</h1>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0"
                  >

                    <div className="flex items-center gap-5">
                      {/* 2. FIX DE IMAGEN: Usa 'item.image' que es lo que manda ProductView */}
                      <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border flex items-center justify-center relative shadow-sm">
                        <Image
                          src={item.image || item.imageUrl || "/placeholder.png"}
                          alt={item.title}
                          fill
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Info con el Azul #1E3A8A pedido */}
                      <div className="flex flex-col gap-1">
                        <p className="font-black text-xl text-[#1E3A8A] uppercase tracking-tighter leading-tight">
                          {item.title}
                        </p>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {item.store || "Apple Store"}
                        </p>

                        <p className="text-sm font-black text-[#1E3A8A]">
                          Cantidad: <span className="font-black">1</span>
                        </p>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 text-[10px] font-black uppercase tracking-widest mt-2 text-left hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>

                    {/* 3. FIX DE PRECIO: Muestra el valor en el azul institucional */}
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-[10px] font-black text-[#1E3A8A] opacity-40">USD</span>
                      <p className="font-black text-2xl text-[#1E3A8A] tracking-tighter">
                        {((item.priceUSD ?? item.estimatedUSD ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Resumen de compra consolidado */}
                <div className="pt-6">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resumen de compra</h2>

                  <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total estimado (USD)</span>
                    <span className="text-3xl font-black text-[#1E3A8A] tracking-tighter">
                      USD {total.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-4 italic px-2">
                    Total estimado puesto en Argentina. El valor final puede variar según impuestos aduaneros vigentes.
                  </p>

                  <button className="w-full bg-[#E02020] text-white py-4 rounded-xl mt-8 text-sm font-black uppercase tracking-widest shadow-xl hover:bg-red-700 transition active:scale-95">
                    Ir al pago seguro
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-3 rounded-xl mt-3 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition"
                  >
                    Vaciar mi carrito
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#0A2647] text-white mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 text-[10px] font-black uppercase tracking-widest flex flex-col gap-3 md:flex-row md:items-center md:justify-between opacity-30">
          <p>© {new Date().getFullYear()} USAShopBox Logistics. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#ayuda" className="hover:underline">Ayuda</a>
            <a href="#terminos" className="hover:underline">Términos</a>
            <a href="#contacto" className="hover:underline">Contacto</a>
          </div>
        </div>
      </footer>
    </>
  );
}