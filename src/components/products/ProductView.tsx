"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { useCart } from "@/context/CartContext"; 
// 🛡️ IMPORTACIÓN CORRECTA: Traemos el calculador de precio visual también
import { calculateCartPricing, getDisplayPriceUSA } from "@/lib/pricing-engine";

export default function ProductView({ product }: { product: any }) {
  const router = useRouter(); 
  const { addToCart } = useCart(); 

  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return [product.imageUrl || product.image].filter(Boolean);
  }, [product]);

  const [activeImg, setActiveImg] = useState(productImages[0] || "");

  const groups = useMemo(() => {
    return (product.variations || []).reduce((acc: any, v: any) => {
      acc[v.attribute] = acc[v.attribute] || [];
      if (!acc[v.attribute].includes(v.value)) acc[v.attribute].push(v.value);
      return acc;
    }, {});
  }, [product.variations]);

  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productImages.length > 0) {
      setActiveImg(productImages[0]);
    }
    const initialSelection: Record<string, string> = {};
    Object.keys(groups).forEach(attr => {
      initialSelection[attr] = groups[attr][0];
    });
    setSelected(initialSelection);
  }, [product.slug, product.id, productImages, groups]);

  const currentVariation = useMemo(() => {
    return (product.variations || []).find((v: any) => 
      selected[v.attribute] === v.value
    );
  }, [selected, product.variations]);

  const currentPrice = useMemo(() => {
    return currentVariation?.price || product.priceUSD || product.price || 0;
  }, [currentVariation, product.priceUSD, product.price]);

  const pricingResult = useMemo(() => {
    const tempItem = {
      priceUSD: currentPrice,
      weight: product.weight || 0,
      quantity: 1
    };

    const calc = calculateCartPricing([tempItem]);

    // 🔥 FIX CRÍTICO: Usamos el helper centralizado en lugar de multiplicar por 1.10 a mano
    // Esto asegura que mostremos el precio eBay + 10% exacto según configuración.
    const marketPriceUSA = getDisplayPriceUSA(currentPrice);

    return {
      finalPrice: calc.totalFinal,
      isViable: calc.checkoutEnabled,
      checkoutEnabled: calc.checkoutEnabled,
      reason: calc.reason,
      marketPriceUSA
    };
  }, [currentPrice, product.weight]);

  const estimatedArg = pricingResult.finalPrice;

  const isSelectionComplete = useMemo(() => {
    const requiredAttributes = Object.keys(groups);
    return requiredAttributes.every(attr => selected[attr] && selected[attr] !== "");
  }, [selected, groups]);

  const handleAddToCart = () => {
    if (!isSelectionComplete) return; 

    if (!pricingResult.checkoutEnabled) {
      alert(`No se puede agregar: ${pricingResult.reason}`);
      return;
    }

    addToCart({
      id: product._id || product.id,
      sku: currentVariation?.sku || product.sku || "", 
      slug: product.slug || product.id,
      title: product.title,
      priceUSD: currentPrice, 
      weight: product.weight || 0,
      estimatedUSD: estimatedArg,
      netMargin: 0, 
      image: activeImg,
      quantity: 1,
      selections: selected,
      specs: product.specs 
    });
    
    router.push("/carrito"); 
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-0 scale-[0.92] origin-top">
        
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-8 h-[450px] flex items-center justify-center shadow-sm relative overflow-hidden">
            {activeImg ? (
              <Image src={activeImg} alt={product.title} fill className="object-contain p-6 transition-all duration-500" unoptimized priority />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-20">
                <span className="text-6xl font-black"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Sin Imagen</span>
              </div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              {productImages.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-white transition-all ${
                    activeImg === img ? "border-[#0A2647] scale-105 shadow-md" : "border-slate-100 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="object-contain w-full h-full p-2" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white border border-slate-200 p-6 flex flex-col gap-4 h-full shadow-sm">
          <div className="text-sm">
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Precio Tienda USA (Inc. Gestión)</p>
            {/* El precio ahora responde dinámicamente al BASE_FEE_PERCENT del engine */}
            <p className="text-4xl font-black text-slate-900 transition-all duration-300">
              USD {pricingResult.marketPriceUSA.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {Object.entries(groups).map(([attr, values]: any) => (
            <div key={attr}>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{attr}</p>
              <div className="flex flex-wrap gap-2">
                {values.map((val: string) => (
                  <button
                    key={val}
                    onClick={() => setSelected({ ...selected, [attr]: val })}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black border transition-all ${
                      selected[attr] === val 
                        ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg scale-105" 
                        : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={`rounded-2xl border px-4 py-3 mt-auto transition-colors ${
             pricingResult.checkoutEnabled ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"
          }`}>
            <div className="flex justify-between items-center mb-1">
               <p className={`text-[10px] font-black uppercase tracking-widest ${
                 pricingResult.checkoutEnabled ? "text-emerald-800" : "text-amber-800"
               }`}>Puesto en Argentina (Final All-in)</p>
               
               {!pricingResult.checkoutEnabled && (
                 <span className="text-[7px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                   {pricingResult.reason}
                 </span>
               )}
            </div>
            <p className={`text-3xl font-black ${
                 pricingResult.checkoutEnabled ? "text-emerald-700" : "text-amber-700"
            }`}>USD {estimatedArg?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className={`text-[8px] font-bold uppercase tracking-tighter mt-1 ${
                 pricingResult.checkoutEnabled ? "text-emerald-600" : "text-amber-600"
            }`}>Flete Internacional, Aduana y Gestión Incluidos</p>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={!isSelectionComplete}
            className={`w-full rounded-2xl font-black py-4 shadow-xl transition active:scale-95 uppercase text-sm tracking-widest ${
              isSelectionComplete 
                ? (pricingResult.checkoutEnabled ? "bg-[#E02020] text-white hover:bg-red-700" : "bg-amber-500 text-white cursor-help")
                : "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-dashed border-slate-200"
            }`}
          >
            {isSelectionComplete 
              ? (pricingResult.checkoutEnabled ? "Agregar al carrito" : "Revisar monto mínimo") 
              : "Seleccione las opciones"}
          </button>
        </section>
      </div>

      <section className="rounded-2xl bg-white border border-slate-200 p-8 mt-4 mb-6 transform scale-[0.92] origin-top mx-auto shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
          {product.title} {Object.values(selected).join(" ")}
        </h1>
        <p className="text-sm leading-relaxed text-slate-700 mb-8 whitespace-pre-line font-medium">
          {product.description || "Descripción disponible en la tienda oficial."}
        </p>
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ficha Técnica</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(product.specs || {}).map(([key, value]: any) => (
              <div key={key} className="flex flex-col">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{key}</span>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}