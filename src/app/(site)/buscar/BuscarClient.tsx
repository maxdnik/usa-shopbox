"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

// ✅ Importamos el nuevo Sidebar Premium (Componente visual)
import SidebarFilters, { FilterSection } from "@/components/products/SidebarFilters";

// ✅ Importamos el motor de precios y contexto
import { usePricing } from "@/context/PricingContext";
import { calculateCartPricing } from "@/lib/pricing-engine";

const ITEMS_PER_PAGE = 15;

type SearchItem = {
  id: string;
  title: string;
  price?: number | string;
  priceUSD?: number;
  currency?: string;
  image?: string | null;
  imageUrl?: string;
  images?: string[];
  url?: string | null;
  slug?: string;
  brand?: string;
  store?: string;
  category?: { main: string; sub: string; leaf: string };
  isInternal?: boolean;
  specs?: Record<string, string>;
};

export default function BuscarClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  // Hook de configuración de precios
  const config = usePricing();

  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("relevant");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  // 1. Carga de datos inicial
  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      return;
    }

    const fetchAllResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ebayRes, internalRes] = await Promise.all([
          fetch(`/api/ebay/search?query=${encodeURIComponent(query)}`),
          fetch(`/api/products?search=${encodeURIComponent(query)}`),
        ]);

        const ebayData = await ebayRes.json();
        const internalData = await internalRes.json();

        const internalItems = (internalData.products || []).map((p: any) => ({
          ...p,
          id: p._id || p.id,
          isInternal: true,
        }));

        const ebayItems = (ebayData.items || []).map((it: any) => ({
          ...it,
          store: "eBay Store",
          brand: "eBay Store",
        }));

        setItems([...internalItems, ...ebayItems]);
      } catch (e) {
        console.error("Error en búsqueda:", e);
        setError("Error de conexión.");
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchAllResults();
  }, [query]);

  // Resetear paginación al filtrar
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [query, selectedStore, maxPrice, sortOrder, selectedSpecs]);

  // 2. Cálculo de filtros dinámicos basados en los items
  const dynamicFilters = useMemo(() => {
    const storeCounts: Record<string, number> = {};
    const specsMap: Record<string, Record<string, number>> = {};

    items.forEach((item) => {
      const storeName = item.brand || item.store;
      if (storeName) {
        storeCounts[storeName] = (storeCounts[storeName] || 0) + 1;
      }
      if (item.specs) {
        Object.entries(item.specs).forEach(([key, value]) => {
          if (!specsMap[key]) specsMap[key] = {};
          specsMap[key][value] = (specsMap[key][value] || 0) + 1;
        });
      }
    });

    const stores = Object.entries(storeCounts).map(([name, count]) => ({
      name,
      count,
    }));

    const attributes = Object.entries(specsMap).map(([name, values]) => ({
      name,
      options: Object.entries(values).map(([val, count]) => ({ val, count })),
    }));

    const firstWithCat = items.find((i) => i.category?.main);
    const defaultPath = {
      main: "Tecnología",
      sub: "Resultados",
      leaf: query,
    };

    return { stores, attributes, path: firstWithCat?.category || defaultPath };
  }, [items, query]);

  // ✅ Adaptador Sidebar
  const sidebarData: FilterSection[] = useMemo(() => {
    const sections: FilterSection[] = [];

    if (dynamicFilters.stores.length > 0) {
      sections.push({
        id: "store",
        title: "Tienda",
        items: dynamicFilters.stores.map((s) => ({
          id: s.name,
          label: s.name,
          count: s.count,
          isActive: selectedStore === s.name,
        })),
      });
    }

    sections.push({
      id: "price",
      title: "Precio",
      items: [500, 1000, 2000].map((p) => ({
        id: p.toString(),
        label: `Hasta USD ${p}`,
        isActive: maxPrice === p,
      })),
    });

    dynamicFilters.attributes.forEach((attr) => {
      sections.push({
        id: `spec-${attr.name}`,
        title: attr.name,
        items: attr.options.map((opt) => ({
          id: opt.val,
          label: opt.val,
          count: opt.count,
          isActive: selectedSpecs[attr.name] === opt.val,
        })),
      });
    });

    return sections;
  }, [dynamicFilters, selectedStore, maxPrice, selectedSpecs]);

  const toggleSpec = (key: string, value: string) => {
    setSelectedSpecs((prev) => {
      const newSpecs = { ...prev };
      if (newSpecs[key] === value) delete newSpecs[key];
      else newSpecs[key] = value;
      return newSpecs;
    });
  };

  const handleFilterClick = (sectionId: string, itemId: string) => {
    if (sectionId === "store") {
      setSelectedStore(selectedStore === itemId ? null : itemId);
    } else if (sectionId === "price") {
      const price = Number(itemId);
      setMaxPrice(maxPrice === price ? null : price);
    } else if (sectionId.startsWith("spec-")) {
      const specName = sectionId.replace("spec-", "");
      toggleSpec(specName, itemId);
    }
  };

  // 3. Filtrado y Ordenamiento
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesStore =
        !selectedStore ||
        item.brand === selectedStore ||
        item.store === selectedStore;

      const itemPrice = item.isInternal
        ? item.priceUSD
        : typeof item.price === "number"
        ? item.price
        : Number(item.price);

      const matchesPrice = !maxPrice || (itemPrice && itemPrice <= maxPrice);

      const matchesSpecs = Object.entries(selectedSpecs).every(([key, value]) => {
        return item.specs && item.specs[key] === value;
      });

      return matchesStore && matchesPrice && matchesSpecs;
    });

    if (sortOrder === "price-asc") {
      result.sort((a, b) => {
        const pA = a.isInternal ? a.priceUSD || 0 : Number(a.price) || 0;
        const pB = b.isInternal ? b.priceUSD || 0 : Number(b.price) || 0;
        return pA - pB;
      });
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => {
        const pA = a.isInternal ? a.priceUSD || 0 : Number(a.price) || 0;
        const pB = b.isInternal ? b.priceUSD || 0 : Number(b.price) || 0;
        return pB - pA;
      });
    }

    return result;
  }, [items, selectedStore, maxPrice, sortOrder, selectedSpecs]);

  return (
    <>
      {/* ✅ MEJORA PUNTO 3: Fondo General con Gradiente Suave */}
      <main
        className="min-h-screen"
        style={{
          background: "linear-gradient(180deg, #F3F6FA 0%, #F8FAFC 100%)",
        }}
      >
        {/* ✅ Container */}
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row gap-12 pt-12 pb-20">
          {/* Sidebar */}
          {!loading && items.length > 0 && (
            <SidebarFilters
              title={query}
              totalCount={filteredItems.length}
              categoryTree={dynamicFilters.path}
              filters={sidebarData}
              onFilterClick={handleFilterClick}
            />
          )}

          {/* Columna Derecha: Resultados */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 flex flex-col items-center gap-8 max-w-lg w-full">
                  <div className="w-24 h-24 bg-[#0A2647] rounded-[32px] flex items-center justify-center shadow-2xl relative overflow-hidden animate-pulse">
                    <div className="w-10 h-10 border-[4px] border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      Buscando "{query}"
                    </p>
                    <h2 className="text-2xl font-black text-[#0A2647] uppercase tracking-tighter leading-none">
                      Estamos buscando las <br /> mejores publicaciones
                    </h2>
                  </div>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col gap-10 max-w-3xl mx-auto mt-20">
                <div className="bg-white rounded-[48px] p-16 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl opacity-20">🔍</span>
                  </div>
                  <h2 className="text-3xl font-black text-[#0A2647] uppercase tracking-tighter mb-4">
                    No encontramos resultados para <br />{" "}
                    <span className="text-red-600">"{query}"</span>
                  </h2>
                  <Link
                    href="/"
                    className="mt-8 px-8 py-4 bg-[#0A2647] text-white font-black rounded-full uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h1 className="text-[42px] font-semibold text-[#0A2647] tracking-[-0.02em] leading-none mb-2 capitalize">
                      {query}
                    </h1>
                    <p className="text-sm font-medium text-slate-400">
                      Mostrando {Math.min(visibleCount, filteredItems.length)} de{" "}
                      {filteredItems.length} resultados
                    </p>
                  </div>

                  <div className="relative group">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="appearance-none pl-5 pr-10 py-3 rounded-full text-sm font-bold text-[#0A2647] cursor-pointer focus:outline-none transition-all hover:bg-white/90"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                      }}
                    >
                      <option value="relevant">Más relevantes</option>
                      <option value="price-asc">Menor precio</option>
                      <option value="price-desc">Mayor precio</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#0A2647]">
                      <svg className="w-3 h-3 fill-current opacity-70" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-10">
                  {filteredItems.slice(0, visibleCount).map((item, index) => {
                    const isInternal = !!item.isInternal;

                    let rawPrice = isInternal
                      ? item.priceUSD || 0
                      : typeof item.price === "number"
                      ? item.price
                      : Number(item.price) || 0;

                    const isInflatedListPrice = rawPrice > 0;
                    if (isInflatedListPrice) rawPrice = rawPrice / 1.1;

                    const imageUrl = isInternal
                      ? item.images?.[0] || item.imageUrl || item.image
                      : item.image || "";

                    const imagesArray = imageUrl ? [imageUrl as string] : [];

                    const calculated = calculateCartPricing(
                      [
                        {
                          priceUSD: rawPrice,
                          weight: 0,
                          quantity: 1,
                        },
                      ],
                      config
                    );

                    const cardProduct = {
                      _id: item.id,
                      slug: isInternal
                        ? item.slug || item.id
                        : `${encodeURIComponent(item.id)}?src=ebay&title=${encodeURIComponent(
                            item.title
                          )}&price=${rawPrice}&image=${encodeURIComponent(
                            imageUrl as string
                          )}&url=${encodeURIComponent(item.url || "")}`,
                      title: item.title,
                      priceUSD: rawPrice,
                      estimatedUSD: calculated.totalFinal,
                      imageUrl: imageUrl as string,
                      images: imagesArray,
                      store: isInternal ? item.brand || item.store : "eBay Store",
                      category: item.category?.leaf || item.category?.main || "General",
                    };

                    return (
                      <div
                        key={item.id}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <ProductCard product={cardProduct} />
                      </div>
                    );
                  })}
                </div>

                {visibleCount < filteredItems.length && (
                  <div className="mt-20 flex justify-center pb-10">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                      className="px-14 py-4 bg-white border border-[#0A2647] text-[#0A2647] font-bold uppercase text-xs tracking-[0.2em] rounded-full hover:bg-[#0A2647] hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
                    >
                      Cargar más productos
                    </button>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="mt-6 text-sm font-bold text-red-600 uppercase tracking-widest text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}