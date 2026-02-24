"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import QuickViewModal from "@/components/products/QuickViewModal";
import { PRICING_CONFIG_DEFAULT } from "@/lib/pricing-engine";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products?limit=24"); 
        const data = await res.json();
        
        const rawItems = data.products || data || [];

        const items = rawItems.map((p: any) => {
          const imageToDisplay = (p.images && p.images.length > 0) ? p.images[0] : (p.imageUrl || p.image || "/placeholder.png");

          // Normalizar categoría
          const categoryString = typeof p.category === 'object' 
            ? p.category?.leaf || p.category?.main || "General"
            : p.category || "General";

          // Asegurar precio numérico
          const price = Number(p.priceUSD || p.price || 0);

          return {
            ...p,
            id: p._id || p.id,
            image: imageToDisplay,
            images: p.images || [imageToDisplay],
            category: categoryString,
            priceUSD: price,
            estimatedUSD: price * (1 + PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT)
          };
        });

        // Validamos que haya items antes de setear
        if (items.length > 0) {
            setProducts(items.slice(0, 24)); // Nos quedamos con los primeros 8
        }
      } catch (err) {
        console.error("Error en FeaturedProducts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const openQuickView = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <>
      <QuickViewModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1440px] mx-auto">
          
          {/* Header Sección */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A2647] tracking-tight leading-none mb-2">
                Destacados
              </h2>
              <p className="text-slate-500 font-medium max-w-md">
                Los productos más buscados en USA, disponibles para vos.
              </p>
            </div>
            
            <Link 
              href="/buscar?query=productos" 
              className="hidden md:flex items-center gap-2 text-sm font-bold text-[#0A2647] hover:text-[#D72638] transition-colors group"
            >
              Ver todo el catálogo 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-50 rounded-[24px] h-[450px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((p) => (
                // ⚠️ CAMBIO CRÍTICO: Eliminé opacity-0 y la animación compleja para asegurar visibilidad
                <div key={p.id} className="block hover:-translate-y-1 transition-transform duration-300">
                  <ProductCard product={p} onQuickView={openQuickView} />
                </div>
              ))}
            </div>
          )}

          {/* Botón Móvil */}
          <div className="mt-12 text-center md:hidden">
             <Link 
              href="/buscar?query=productos" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-slate-200 text-[#0A2647] font-bold uppercase text-xs tracking-widest"
            >
              Ver todo el catálogo
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}