"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// ✅ CONFIGURACIÓN: Las marcas que pediste (Nike, Apple, Ross, Filson)
const STORES = [
  { 
    name: "Apple", 
    slug: "apple", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", 
    color: "#000000" 
  },
  { 
    name: "Nike", 
    slug: "nike", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", 
    color: "#000000" 
  },
  { 
    name: "Ross", 
    slug: "ross", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ross_Stores_logo.svg", 
    color: "#005595" 
  },
  { 
    name: "Filson", 
    slug: "filson", 
    // Usamos texto/fallback si no hay logo SVG público estable, o un placeholder
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/Filson_Logo.png", 
    fallbackText: "FILSON",
    color: "#2E2E2E" 
  },
  { 
    name: "eBay", 
    slug: "ebay", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg", 
    color: "#E53238" 
  },
];

export default function OfficialStores() {
  const easePremium = "cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <section className="py-16 px-4 bg-white border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header de la sección */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-[#0A2647] tracking-tight">
            Tiendas oficiales en USA
          </h2>
          <Link 
            href="/tiendas" 
            className="text-sm font-bold text-slate-400 hover:text-[#0A2647] transition-colors"
          >
            Ver todas
          </Link>
        </div>

        {/* Grid Responsive: Scroll Horizontal en Mobile, Grid en Desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible md:pb-0 md:mx-0 md:px-0 no-scrollbar">
          {STORES.map((store) => (
            <Link
              key={store.slug}
              href={`/buscar?query=${store.slug}`} // O la ruta que prefieras
              className="group snap-center shrink-0 w-[220px] md:w-auto h-[260px] bg-[#FAFBFC] border border-[#F1F3F5] rounded-[24px] flex flex-col items-center justify-center p-8 relative overflow-hidden hover:bg-white hover:border-slate-200 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1"
              style={{ transitionTimingFunction: easePremium }}
            >
              {/* Logo Area */}
              <div className="flex-1 flex items-center justify-center w-full relative z-10 group-hover:scale-110 transition-transform duration-500">
                {store.logo.endsWith(".svg") || store.logo.endsWith(".png") ? (
                   <img 
                     src={store.logo} 
                     alt={store.name} 
                     className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                     // Fallback simple por si la imagen falla
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       // Podríamos mostrar texto aquí si quisiéramos
                     }}
                   />
                ) : (
                   <span className="text-2xl font-black text-[#0A2647] uppercase">{store.name}</span>
                )}
              </div>

              {/* Footer de la card */}
              <div className="mt-auto flex flex-col items-center gap-2 relative z-10">
                <span className="text-[15px] font-bold text-[#0A2647]">{store.name}</span>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-[#22D3EE] transition-colors flex items-center gap-1">
                  Ver productos <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>

              {/* Decoración Hover (Gradiente sutil del color de la marca) */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${store.color}, transparent 70%)` }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}