"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface QuickViewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden"; // Bloquea scroll
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;
  if (!product) return null;

  const imageSrc = product.images?.[0] || product.imageUrl || product.image || "/placeholder.png";
  const finalPrice = product.estimatedUSD || product.priceUSD;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      id: product.id || product._id,
      title: product.title,
      price: finalPrice,
      image: imageSrc,
      quantity: 1,
      priceUSD: product.priceUSD
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isOpen ? "opacity-100 backdrop-blur-md bg-[#0A2647]/40" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Imagen */}
        <div className="w-full md:w-1/2 bg-[#F5F7FA] relative flex items-center justify-center p-12">
           <div className="relative w-full h-full min-h-[300px] aspect-square">
             <Image
               src={imageSrc}
               alt={product.title}
               fill
               className="object-contain mix-blend-multiply"
             />
           </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Vista Rápida
          </span>
          <h2 className="text-2xl font-bold text-[#0A2647] leading-tight mb-6">
            {product.title}
          </h2>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
             <p className="text-xs text-slate-500 mb-1">Precio Final Argentina</p>
             <div className="flex items-baseline gap-1">
               <span className="text-sm font-bold text-[#0A2647]">USD</span>
               <span className="text-4xl font-black text-[#0A2647] tracking-tight">
                 {finalPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
               </span>
             </div>
          </div>

          <div className="mt-auto space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full h-14 rounded-full font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                isAdding ? "bg-emerald-500 text-white" : "bg-[#0A2647] text-white hover:bg-[#D72638]"
              }`}
            >
              {isAdding ? <Check className="w-5 h-5"/> : <ShoppingCart className="w-5 h-5"/>}
              {isAdding ? "Agregado" : "Agregar al carrito"}
            </button>

            <Link 
              href={`/producto/${product.slug || product.id}`}
              className="w-full h-14 rounded-full bg-white border border-slate-200 text-[#0A2647] font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              Ver detalles completos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}