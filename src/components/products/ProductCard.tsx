// src/components/products/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
// 🛡️ IMPORTACIÓN: Traemos el helper para mostrar siempre el precio con margen
import { getDisplayPriceUSA } from "@/lib/pricing-engine";

interface ProductCardProps {
  product: {
    _id: string;
    slug: string;
    title: string;
    priceUSD: number;
    estimatedUSD: number;
    imageUrl?: string; 
    images?: string[]; 
    store?: string;
    category?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // LÓGICA DE IMÁGENES: Prioridad al array de galería
  const imageSrc = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : product.imageUrl || "/placeholder-product.png";

  // 💰 CÁLCULO VISUAL: Aplicamos el margen del 10% (o lo que configure el engine)
  const displayPrice = getDisplayPriceUSA(product.priceUSD);

  return (
    <Link 
      href={`/producto/${product.slug}`}
      className="group bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* 🖼️ CONTENEDOR DE IMAGEN */}
      <div className="relative aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden mb-5 flex items-center justify-center">
        {(product.images?.length || product.imageUrl) ? (
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 250px"
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="text-slate-200 font-bold text-[10px] uppercase tracking-widest">
            Sin Imagen
          </div>
        )}
      </div>

      {/* 📝 INFO DEL PRODUCTO */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">
            {product.category || "General"}
          </span>
          <span className="text-[13px] text-[#1E3A8A] font-bold">
            {product.store || "USA"}
          </span>
        </div>
        
        <h3 className="text-sm font-black text-slate-700 leading-tight mb-3 group-hover:text-[#0A2647] transition-colors line-clamp-2">
          {product.title}
        </h3>
      </div>

      {/* 🎯 PRECIO FINAL CON MARKUP (INC. GESTIÓN) */}
      <div className="mt-auto pt-4 border-t border-slate-50">
        <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">
          USA (Inc. Gestión)
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-[#1E3A8A] tracking-tighter">
            {/* Usamos displayPrice en lugar de priceUSD directo */}
            USD {displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {/* Botón de acción integrado */}
          <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[#0A2647] group-hover:bg-[#0A2647] group-hover:text-white transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}