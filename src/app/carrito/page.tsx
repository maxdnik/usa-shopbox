"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import Link from "next/link";
import HeaderEcom from "@/components/home/HeaderEcom"; 
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
// 🛡️ IMPORTANTE: Traemos calculateCartPricing para detectar pesos imputados
import { calculateCartPricing, PRICING_CONFIG_DEFAULT as PRICING_CONFIG } from "@/lib/pricing-engine";

// === Google Icon SVG ===
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
  const [exchangeRate, setExchangeRate] = useState<number>(0);

  /**
   * 📘 CÁLCULO INTELIGENTE (CON DETECCIÓN DE PESO)
   * Usamos el motor para que nos diga si hay algún peso imputado (isWeightImputed).
   */
  const pricing = useMemo(() => {
    return calculateCartPricing(cart);
  }, [cart]);

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/exchange")
      .then(res => res.json())
      .then(data => setExchangeRate(data.rate))
      .catch(() => setExchangeRate(1450)); 

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
        ].filter(Boolean).join(" ").trim();

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
        console.error("Error perfil:", e);
      } finally {
        setProfileLoaded(true);
      }
    })();
  }, [isLoggedIn, session]);

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const isProfileComplete = 
    form.fullName && form.email && form.phone && form.dni && 
    form.province && form.city && form.address && form.postalCode;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pricing.checkoutEnabled) {
      setError(pricing.reason);
      return;
    }

    if (!isProfileComplete || cart.length === 0) {
      setError("Completá tus datos de envío para continuar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          buyer: form, 
          items: cart, 
          totalUSD: pricing.totalFinal,
          exchangeRateUsed: exchangeRate
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Error al procesar el pedido.");
        setLoading(false);
        return;
      }

      try {
        const mpRes = await fetch("/api/checkout/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: json.mongoId }),
        });
        const mpData = await mpRes.json();

        if (mpData.ok && mpData.init_point) {
          clearCart();
          window.location.href = mpData.init_point;
          return;
        }
      } catch (mpErr) {
        console.error("❌ Error redirigiendo a Mercado Pago:", mpErr);
      }

      clearCart();
      window.location.href = `/checkout/success?orderId=${json.mongoId}&orderNumber=${json.orderNumber}&totalUSD=${pricing.totalFinal}`;
      
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderEcom />
      <main className="bg-[#f5f5f5] min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-[#0A2647] tracking-tighter ">Checkout</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
              {exchangeRate > 0 ? `Cotización Dólar Tarjeta: $${exchangeRate} ARS` : "Estados Unidos, a un click de tu casa."}
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-[32px] p-24 text-center border shadow-sm">
               <div className="text-5xl mb-6">🛒</div>
               <p className="text-slate-300 font-black uppercase tracking-widest">No hay productos seleccionados.</p>
               <Link href="/" className="inline-block mt-10 bg-[#0A2647] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition">Empezar a comprar</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <div className="lg:col-span-7 space-y-10">
                
                <div className="bg-white rounded-[32px] p-8 border shadow-sm">
                  <h3 className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-[0.2em] mb-8 border-b pb-4">Productos en este envío</h3>
                  <div className="space-y-8">
                    {cart.map((item) => {
                      // 🔥 AJUSTE CRÍTICO DE PRECIO 🔥
                      // Si hay un solo producto, usamos el Total Final del Engine para evitar discrepancias.
                      const finalPriceToShow = (cart.length === 1) ? pricing.totalFinal : (item.estimatedUSD || 0);

                      return (
                        <div key={item.id} className="flex gap-6 items-center border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                          <div className="w-24 h-24 bg-slate-50 rounded-2xl p-3 relative shrink-0 border border-slate-100">
                            <Image src={item.image || ""} alt={item.title} fill className="object-contain" unoptimized />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-sm font-black text-[#0A2647] uppercase leading-tight line-clamp-2 mb-2">{item.title}</h2>
                            
                            {item.selections && Object.keys(item.selections).length > 0 && (
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                {Object.entries(item.selections).map(([key, val]) => (
                                  <span key={key} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {key}: <span className="text-[#0A2647]">{val}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Cant: {item.quantity}</span>
                              <span className="text-[10px] font-bold text-slate-300 uppercase ml-2">Peso: {item.weight || 0} Kg</span>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-[9px] font-black text-red-600 uppercase hover:underline ml-4">Eliminar</button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-emerald-500 uppercase mb-1">Final All-in</p>
                            
                            {/* USAMOS EL PRECIO VINCULADO AL SUMMARY */}
                            <p className="text-xl font-black text-[#0A2647]">USD {finalPriceToShow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            
                            <div className="mt-2 pt-2 border-t border-slate-50 space-y-0.5">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                Precio USA (Inc. Gestión): USD {((item.priceUSD || 0) * (1 + PRICING_CONFIG.BASE_FEE_PERCENT)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              {exchangeRate > 0 && (
                                 <p className="text-[10px] font-black text-[#0A2647] opacity-40">≈ AR$ {(finalPriceToShow * exchangeRate).toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border shadow-sm">
                  <h3 className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-[0.2em] mb-8 border-b pb-4">Información de Destino Argentina</h3>
                  
                  {!isLoggedIn && (
                    <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-dashed flex justify-between items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">¿Ya sos cliente? Ingresá para ahorrar tiempo</p>
                      <Link href="/login" className="bg-white border px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition">Login</Link>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { f: "fullName", l: "Nombre Completo", t: "text" },
                      { f: "email", l: "Correo Electrónico", t: "email" },
                      { f: "dni", l: "DNI / CUIT (Aduana)", t: "text" },
                      { f: "phone", l: "Teléfono de Contacto", t: "text" },
                      { f: "province", l: "Provincia", t: "text" },
                      { f: "city", l: "Ciudad / Localidad", t: "text" },
                      { f: "address", l: "Dirección, Altura y Depto", t: "text", full: true },
                      { f: "postalCode", l: "C.P.", t: "text" }
                    ].map((inp) => (
                      <div key={inp.f} className={inp.full ? "md:col-span-2" : ""}>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">{inp.l}</label>
                        <input 
                          type={inp.t} 
                          className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4 bg-slate-50/50 outline-none focus:border-[#1E3A8A] focus:bg-white transition-all font-bold text-sm text-[#0A2647]" 
                          value={form[inp.f as keyof CheckoutForm]} 
                          onChange={(e) => handleChange(inp.f as keyof CheckoutForm, e.target.value)} 
                          placeholder="..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-[#0A2647] rounded-[40px] p-10 text-white sticky top-24 shadow-2xl border border-white/5">
                  
                  <div className="text-center mb-10 pb-6 border-b border-white/10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Detalle de tu compra</h2>
                  </div>

                  {!pricing.checkoutEnabled && (
                    <div className="bg-red-500/20 border border-red-500/30 p-6 rounded-[28px] mb-8 animate-pulse text-sm font-bold text-white text-center uppercase">
                      {pricing.reason}
                    </div>
                  )}

                  {/* 📊 DESGLOSE DE 6 LÍNEAS */}
                  <div className="space-y-5 mb-10">
                    {pricing.breakdown.map((line, idx) => (
                      <div key={idx} className={`flex justify-between items-center text-xs uppercase tracking-[0.1em] ${line.label === "Aduana y Tasas" ? "font-black text-emerald-400" : "font-bold opacity-60"}`}>
                        <span>{line.label}</span>
                        <span>USD {line.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center space-y-8">
                    <div className="bg-white/5 py-8 rounded-[32px] border border-white/10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Total Final Puesto en Casa</p>
                      
                      {exchangeRate > 0 && (
                        <p className="text-5xl font-black tracking-tighter text-green-400 mb-2">
                          AR$ {(pricing.totalFinal * exchangeRate).toLocaleString()}
                        </p>
                      )}
                      <p className={exchangeRate > 0 ? "text-lg font-black opacity-60" : "text-6xl font-black tracking-tighter"}>
                        USD {pricing.totalFinal.toLocaleString()}
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        {error}
                      </div>
                    )}
                    

                    <button 
                      type="submit" 
                      disabled={loading || !pricing.checkoutEnabled}
                      className={`w-full py-8 rounded-[28px] font-black uppercase text-sm tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
                        pricing.checkoutEnabled 
                          ? "bg-[#D72638] hover:bg-red-600 text-white hover:scale-[1.02]" 
                          : "bg-white/10 text-white/20 cursor-not-allowed border-2 border-dashed border-white/10"
                      }`}
                    >
                      {loading ? "PROCESANDO PAGO..." : pricing.checkoutEnabled ? "PAGAR CON MERCADO PAGO" : "CARRITO NO VÁLIDO"}
                    </button>
                    
                    <div className="pt-4 flex flex-col items-center gap-4 opacity-40">
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-widest">Seguro ARS</span>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">PAGO PROTEGIDO</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>
      </main>

      <footer className="bg-[#0A2647] py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
           <div>USAShopBox S.A. — Soluciones de importación puerta a puerta.</div>
           <div className="text-right">© {new Date().getFullYear()} USAShopBox — Buenos Aires, Argentina.</div>
        </div>
      </footer>
    </>
  );
}