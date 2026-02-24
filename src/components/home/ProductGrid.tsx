"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ✅ 1. Importamos los componentes Premium reutilizables
import ProductCard from "@/components/products/ProductCard";
import QuickViewModal from "@/components/products/QuickViewModal";

// 🛡️ Configuración de precios
import { PRICING_CONFIG_DEFAULT } from "@/lib/pricing-engine";

export default function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ 2. Estado para el Modal Quick View
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products?limit=12"); 
        const data = await res.json();
        
        const items = (data.products || data || []).map((p: any) => {
          // Gestión de imágenes
          const imageToDisplay = (p.images && p.images.length > 0) 
            ? p.images[0] 
            : (p.imageUrl || p.image || "");

          // 🛠️ FIX CRÍTICO: Normalizar categoría si viene como objeto
          const categoryString = typeof p.category === 'object' 
            ? p.category?.leaf || p.category?.main || "General"
            : p.category || "General";

          return {
            ...p,
            id: p._id || p.id,
            image: imageToDisplay, 
            imageUrl: imageToDisplay,
            category: categoryString, // ✅ Aquí guardamos un string, no un objeto
            /**
             * 🎯 Mapeamos el cálculo al campo que espera ProductCard
             */
            estimatedUSD: p.priceUSD * (1 + PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT)
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

  // Handler para abrir modal
  const openQuickView = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Modal Renderizado */}
      <QuickViewModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-white to-[#F5F7FA]">
        <div className="max-w-[1440px] mx-auto">
          
          {/* Header de Sección Estilo Apple */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] tracking-tight leading-none mb-2">
                Destacados
              </h2>
              <p className="text-sm font-medium text-slate-400">
                Selección exclusiva para importación directa.
              </p>
            </div>
            
            <Link 
              href="/buscar?query=productos" 
              className="group flex items-center gap-2 text-sm font-bold text-[#0A2647] hover:text-[#3B82F6] transition-colors"
            >
              Ver todo 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-[24px] h-[420px] border border-slate-100 shadow-sm animate-pulse flex flex-col p-5">
                   <div className="w-full h-64 bg-slate-100 rounded-xl mb-4" />
                   <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                   <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p, index) => (
                // ✅ Animación Stagger
                <div 
                  key={p.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard 
                    product={p} 
                    onQuickView={openQuickView} 
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}