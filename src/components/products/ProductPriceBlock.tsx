"use client";

import { useState, useMemo } from "react";

export default function ProductPriceBlock({ product }: { product: any }) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  // Buscamos la variante que coincida con lo que el usuario seleccionó
  const matchedVariant = useMemo(() => {
    return (product.variations || []).find((v: any) => 
      selected[v.attribute] === v.value && v.price // <--- Busca el campo 'price' en la variante
    );
  }, [selected, product.variations]);

  // Si hay una variante con precio, usamos ese. Si no, el precio base.
  const currentPrice = matchedVariant ? matchedVariant.price : product.priceUSD;

  // Recalcular el estimado de Argentina en tiempo real
  const estimatedArg = Number((currentPrice * 1.35).toFixed(2));

  // Agrupamos para mostrar los botones (Igual que antes)
  const groups = (product.variations || []).reduce((acc: any, v: any) => {
    acc[v.attribute] = acc[v.attribute] || [];
    if (!acc[v.attribute].includes(v.value)) acc[v.attribute].push(v.value);
    return acc;
  }, {});

  return (
    <section className="rounded-xl bg-white border border-slate-200 p-6 flex flex-col gap-4 h-full shadow-sm">
      {Object.entries(groups).map(([attr, values]: any) => (
        <div key={attr}>
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{attr}</p>
          <div className="flex flex-wrap gap-2">
            {values.map((val: string) => (
              <button
                key={val}
                onClick={() => setSelected({ ...selected, [attr]: val })}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
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

      <div className="pt-6 border-t border-slate-50 space-y-3">
        <p className="text-slate-500 text-sm">Precio en tienda USA</p>
        <p className="text-4xl font-black text-slate-900 transition-all duration-300">
          USD {currentPrice.toFixed(2)}
        </p>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Puesto en Argentina</p>
          <p className="text-3xl font-black text-emerald-700">USD {estimatedArg.toLocaleString()}</p>
        </div>

        <button className="w-full rounded-2xl bg-[#E02020] text-white font-black py-4 shadow-xl shadow-red-100 hover:bg-red-700 transition active:scale-95">
          AGREGAR AL CARRITO
        </button>
      </div>
    </section>
  );
}