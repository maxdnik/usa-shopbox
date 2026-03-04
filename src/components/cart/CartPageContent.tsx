"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import { calculateCartPricing } from "@/lib/pricing-engine";

export default function CartPageContent() {
  const { cart, removeFromCart, clearCart } = useCart();

  const config = usePricing();

  const pricing = useMemo(() => {
    return calculateCartPricing(cart, config);
  }, [cart, config]);

  return (
    <>
      <main className="bg-[#f5f5f5] min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
            Tu Carrito
          </h1>

          {cart.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border border-slate-200 shadow-sm">
              <div className="text-6xl mb-6">🛒</div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-8">
                Tu carrito está vacío
              </p>
              <Link
                href="/"
                className="inline-block bg-[#0A2647] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#1E3A8A] transition-colors"
              >
                Empezar a comprar
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* === LISTADO DE PRODUCTOS (IZQUIERDA) === */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
                  {cart.map((item) => {
                    const billingWeight =
                      item.chargeableWeight ??
                      item.logisticProfile?.billingWeightKg ??
                      item.weight ??
                      0;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-6 items-start py-6 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0"
                      >
                        {/* Imagen */}
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative shrink-0">
                          <Image
                            src={item.image || item.imageUrl || "/placeholder.png"}
                            alt={item.title}
                            fill
                            className="w-full h-full object-contain p-2"
                            unoptimized
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-black text-sm text-[#0A2647] uppercase tracking-tight leading-snug line-clamp-2">
                                {item.title}
                              </p>

                              {/* Variaciones */}
                              {item.selections && Object.keys(item.selections).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {Object.entries(item.selections).map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider"
                                    >
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Precio USA visual */}
                            <div className="text-right">
                              <p className="font-black text-lg text-[#0A2647]">
                                USD{" "}
                                {(
                                  Number(item.priceUSD ?? 0) * Number(item.quantity ?? 1)
                                ).toLocaleString()}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                Precio USA
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                                Cant: {item.quantity ?? 1}
                              </span>

                              {/* ✅ Peso cobrable (metodología nueva) */}
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Peso (cobrable): {Number(billingWeight).toFixed(2)} kg
                              </span>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-700 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <button
                      onClick={clearCart}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition flex items-center gap-2"
                    >
                      <span>🗑️</span> Vaciar carrito completo
                    </button>
                  </div>
                </div>
              </div>

              {/* === RESUMEN DE PAGO (DERECHA) === */}
              <div className="lg:col-span-1">
                <div className="bg-[#0A2647] rounded-[32px] p-8 text-white sticky top-24 shadow-xl border border-white/10">
                  <h2 className="text-xl font-black uppercase tracking-tighter mb-6 border-b border-white/10 pb-4">
                    Resumen de Cuenta
                  </h2>

                  {!pricing.checkoutEnabled && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-center">
                      <p className="text-red-200 text-xs font-bold uppercase tracking-widest">
                        {pricing.reason}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    {pricing.breakdown.map((line, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="uppercase tracking-widest font-bold text-slate-400">
                          {line.label}
                        </span>
                        <span className="font-mono text-slate-300">
                          USD{" "}
                          {Number(line.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/10 rounded-2xl p-6 mb-8 text-center border border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      Total Final All-in
                    </p>
                    <p className="text-4xl font-black tracking-tighter text-white">
                      USD{" "}
                      {pricing.totalFinal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-2">
                      Aduana y Envíos Incluidos
                    </p>
                  </div>

                  <Link
                    href="/checkout"
                    className={`block w-full py-4 rounded-xl text-center text-sm font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 ${
                      pricing.checkoutEnabled
                        ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg hover:shadow-emerald-500/25"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    }`}
                    onClick={(e) => !pricing.checkoutEnabled && e.preventDefault()}
                  >
                    {pricing.checkoutEnabled ? "Ir a Pagar" : "Revisar Carrito"}
                  </Link>

                  <div className="mt-6 flex flex-col items-center gap-2 opacity-30">
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-white rounded"></div>
                      <div className="w-8 h-5 bg-white rounded"></div>
                      <div className="w-8 h-5 bg-white rounded"></div>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest">
                      Pagos Procesados en USA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}