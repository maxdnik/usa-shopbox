"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// 🛡️ IMPORTACIÓN CORREGIDA: Ahora usamos PRICING_CONFIG_DEFAULT
import { PRICING_CONFIG_DEFAULT } from "@/lib/pricing-engine";

export default function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Traemos los productos de la API
        const res = await fetch("/api/products?limit=68 ");
        const data = await res.json();
        
        const items = (data.products || data || []).map((p: any) => {
          
          // 🛠️ GESTIÓN DE IMÁGENES (Prioridad Galería -> imageUrl)
          const imageToDisplay = (p.images && p.images.length > 0) 
            ? p.images[0] 
            : (p.imageUrl || p.image || "");

          return {
            ...p,
            id: p._id || p.id,
            displayImage: imageToDisplay,
            /**
             * 🎯 CÁLCULO DEL PRECIO CON MARKUP CENTRALIZADO
             * Usamos PRICING_CONFIG_DEFAULT para el renderizado inicial.
             */
            priceIncGestion: p.priceUSD * (1 + PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT)
          };
        });

        setProducts(items);
      } catch (err) {
        console.error("Error en ProductGrid:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse mt-12 px-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-[32px] h-80 border border-slate-100 shadow-sm"></div>)}
    </div>
  );

  return (
    <section className="mt-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-[#0A2647] uppercase tracking-tighter">
          Productos Destacados
        </h2>
        <Link href="/buscar?query=productos" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Ver todos →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/producto/${p.slug}`}
            className="group bg-white rounded-[32px] p-6 border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col"
          >
            <div className="relative w-full aspect-square mb-6 overflow-hidden bg-white flex items-center justify-center rounded-2xl border border-slate-50">
               <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                  {p.displayImage ? (
                    <img 
                      src={p.displayImage} 
                      alt={p.title}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('placeholder')) {
                           target.src = `https://placehold.co/400x400/white/0A2647?text=${p.slug}`;
                        }
                      }}
                    />
                  ) : (
                    <div className="opacity-10 font-black text-4xl"></div>
                  )}
               </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] font-black px-2 py-0.5 rounded uppercase border bg-red-50 text-red-600 border-red-100">
                  {p.brand || p.store || 'Importado'}
                </span>
              </div>

              <h3 className="font-black text-[#0A2647] text-[13px] leading-tight uppercase mb-4 line-clamp-2 h-8">
                {p.title}
              </h3>

              <div className="mt-auto flex items-end justify-between">
                <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">
                     USA (Inc. Gestión)
                   </p>
                   <p className="text-2xl font-black text-[#1E3A8A] tracking-tighter">
                     USD {p.priceIncGestion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </p>
                </div>
                
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#0A2647] group-hover:bg-[#0A2647] group-hover:text-white transition-all duration-300 shadow-sm">
                   →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}