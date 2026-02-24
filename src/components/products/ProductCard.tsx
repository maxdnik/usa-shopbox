"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: {
    _id?: string;
    id?: string;
    slug: string;
    title: string;
    priceUSD: number;
    estimatedUSD?: number;
    image?: string;
    imageUrl?: string;
    images?: string[];
    store?: string;
    brand?: string;
    category?: string;
  };
  onQuickView?: (product: any) => void; // ✅ Prop necesaria
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const imageSrc =
    product.images?.[0] ||
    product.imageUrl ||
    product.image ||
    "/placeholder.png";

  const finalPrice = product.estimatedUSD || product.priceUSD;
  const href = `/producto/${product.slug}`;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    addToCart({
      id: product.id || product._id || "",
      title: product.title,
      price: finalPrice,
      image: imageSrc,
      quantity: 1,
      priceUSD: product.priceUSD
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  // ✅ CORRECCIÓN: Usamos onQuickView si existe
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onQuickView) {
      onQuickView(product); // Abrir modal
    } else {
      router.push(href); // Fallback: navegar
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-[24px] border border-slate-100 p-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] h-full relative overflow-hidden">
      
      {(product.store || product.brand) && (
        <div className="absolute top-4 left-4 z-10">
          <span 
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#0A2647]"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            {product.store || product.brand}
          </span>
        </div>
      )}

      <div className="relative w-full aspect-[1/1] mb-6 bg-[#F5F7FA] rounded-2xl overflow-hidden flex items-center justify-center p-6">
        <Link href={href} className="relative w-full h-full block">
          <div 
            className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.10))" }}
          >
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              className="object-contain mix-blend-multiply"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>

        {/* HOVER ACTIONS */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 px-4 translate-y-10 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-20">
          
          {/* ✅ Botón llama a handleQuickView */}
          <button
            onClick={handleQuickView}
            className="h-9 px-4 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[#0A2647] shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:bg-white hover:scale-105 transition-all flex items-center gap-2"
            title="Vista Rápida"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide hidden sm:inline">Ver</span>
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`h-9 px-4 rounded-full text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-105 transition-all flex items-center gap-2 ${
              isAdding ? "bg-emerald-500" : "bg-[#0A2647] hover:bg-[#D72638]"
            }`}
            title="Agregar al carrito"
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wide">Listo</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wide hidden sm:inline">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        {product.category && (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {product.category}
          </span>
        )}

        <Link href={href} className="group-hover:text-[#3B82F6] transition-colors">
          <h3 className="text-[15px] font-semibold text-[#0A2647] leading-snug mb-6 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto space-y-2">

          <div className="flex items-end justify-between">
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold text-[#0A2647]/50 uppercase mb-1">Final Argentina</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-[#0A2647]/60 self-start mt-[2px]">USD</span>
                <span className="text-[26px] font-semibold text-[#0A2647] tracking-[-0.02em]">
                  {formatPrice(finalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}