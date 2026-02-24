"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

// ✅ DATA (Logos locales desde public/logos)
const ORIGINAL_STORES = [
  { name: "LEGO", slug: "lego", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/LEGO_logo.svg", color: "#FFCF00" },
  { name: "Apple", slug: "apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", color: "#A2AAAD" },
  { name: "Nike", slug: "nike", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", color: "#111111" },
  { name: "Filson", slug: "filson", logo: "/logos/filson.png", color: "#2E2E2E" },
  { name: "YETI", slug: "yeti", logo: "/logos/yeti.png", color: "#005595" },
  { name: "Amazon", slug: "amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", color: "#FF9900" },
  { name: "Pandora", slug: "pandora", logo: "/logos/pandora.png", color: "#000000" },
  { name: "Adidas", slug: "adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", color: "#000000" },
  { name: "The North Face", slug: "north-face", logo: "/logos/The_North_Face.png", color: "#C8102E" },
];

// 🔄 CLONES PARA INFINITE LOOP
const STORES = [...ORIGINAL_STORES, ...ORIGINAL_STORES, ...ORIGINAL_STORES];

// 📏 CONFIGURACIÓN "COMPACT PREMIUM"
const CARD_WIDTH = 208;
const CARD_GAP = 16;
const AUTO_ADVANCE_DELAY = 4200;
const APPLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function OfficialStores() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. INICIALIZACIÓN ---
  useEffect(() => {
    if (scrollRef.current) {
      const singleSetWidth = (CARD_WIDTH + CARD_GAP) * ORIGINAL_STORES.length;
      scrollRef.current.scrollLeft = singleSetWidth;
    }
  }, []);

  // --- 2. INFINITE SCROLL LOGIC ---
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const singleSetWidth = (CARD_WIDTH + CARD_GAP) * ORIGINAL_STORES.length;

    if (scrollLeft >= singleSetWidth * 2) {
      scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
    } else if (scrollLeft <= 50) {
      scrollRef.current.scrollLeft = scrollLeft + singleSetWidth;
    }
  };

  // --- 3. AUTO-PLAY ---
  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      if (scrollRef.current && !isHovering && !isTouching && document.visibilityState === 'visible') {
        const { scrollLeft } = scrollRef.current;
        scrollRef.current.scrollTo({
          left: scrollLeft + CARD_WIDTH + CARD_GAP,
          behavior: "smooth",
        });
      }
    }, AUTO_ADVANCE_DELAY);
  }, [isHovering, isTouching]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  // --- 4. MANUAL SCROLL ---
  const scrollManual = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const move = CARD_WIDTH + CARD_GAP;
      scrollRef.current.scrollBy({
        left: direction === "right" ? move : -move,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-10 bg-white border-b border-slate-100/50 relative overflow-hidden">
      
      <div 
        className="max-w-[1280px] mx-auto px-4 relative group/carousel"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsTouching(true)}
        onTouchEnd={() => { setIsTouching(false); startAutoPlay(); }}
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 px-1 relative z-30">
          <h2 className="text-xl font-semibold text-[#0A2647] tracking-[-0.01em]">
            Tiendas Oficiales
          </h2>
          <Link 
            href="/tiendas" 
            className="text-sm font-medium text-[#0A2647]/70 transition-all duration-200 hover:text-[#0A2647] hover:translate-x-[2px]"
          >
            Ver todas
          </Link>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

        {/* FLECHA IZQ */}
        <button
          onClick={() => scrollManual("left")}
          className="hidden md:flex absolute left-2 top-[60%] -translate-y-1/2 z-20 w-9 h-9 rounded-full items-center justify-center text-[#0A2647] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 transform scale-95 group-hover/carousel:scale-100 hover:-translate-y-[1px] hover:shadow-md"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(10, 38, 71, 0.08)",
            boxShadow: "0 4px 12px rgba(2, 12, 27, 0.08)"
          }}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 opacity-90" />
        </button>

        {/* CARRUSEL */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar items-center relative z-0"
          style={{ 
            scrollBehavior: "auto",
            gap: `${CARD_GAP}px` 
          }}
        >
          {STORES.map((store, index) => (
            <Link
              key={`${store.slug}-${index}`}
              // 🔥 FIX CRÍTICO: Redirección directa a la página de tienda
              href={`/tienda/${store.slug}`}
              className="group relative snap-start shrink-0 bg-white border border-[#0A2647]/10 rounded-2xl flex flex-col items-center justify-center p-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] shadow-[0_8px_20px_rgba(0,0,0,0.06)] overflow-hidden"
              style={{ 
                width: `${CARD_WIDTH}px`,
                height: "140px",
                minWidth: `${CARD_WIDTH}px`,
              }}
            >
              
              {/* Logo Box */}
              <div className="flex-1 w-full flex items-center justify-center relative z-10">
                <div className="relative w-full h-10 flex items-center justify-center">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="object-contain w-full h-full max-h-10 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    loading={index < 8 ? "eager" : "lazy"}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = "0.5"; 
                    }}
                  />
                </div>
              </div>

              {/* Info Footer */}
              <div className="mt-2 flex flex-col items-center gap-1 relative z-10 w-full">
                <span className="text-[14px] font-semibold text-[#0A2647] opacity-90 leading-tight">
                  {store.name}
                </span>
                
                <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 group-hover:text-[#0A2647] transition-colors duration-300">
                  Explorar <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Hover Tint */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${store.color}, transparent 70%)` }}
              />
            </Link>
          ))}
        </div>

        {/* FLECHA DER */}
        <button
          onClick={() => scrollManual("right")}
          className="hidden md:flex absolute right-2 top-[60%] -translate-y-1/2 z-20 w-9 h-9 rounded-full items-center justify-center text-[#0A2647] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 transform scale-95 group-hover/carousel:scale-100 hover:-translate-y-[1px] hover:shadow-md"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(10, 38, 71, 0.08)",
            boxShadow: "0 4px 12px rgba(2, 12, 27, 0.08)"
          }}
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 opacity-90" />
        </button>

        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}