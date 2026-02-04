"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HeaderEcom from "@/components/home/HeaderEcom";
// 🛡️ IMPORTACIÓN CLAVE: Usamos la tarjeta oficial que ya sabe calcular precios
import ProductCard from "@/components/products/ProductCard";

// 🛠️ Mantenemos tu configuración de 15 productos
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

  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("relevant");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

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

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [query, selectedStore, maxPrice, sortOrder, selectedSpecs]);

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
      sub: "Celulares y Teléfonos",
      leaf: "Celulares y Smartphones",
    };

    return { stores, attributes, path: firstWithCat?.category || defaultPath };
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesStore =
        !selectedStore || item.brand === selectedStore || item.store === selectedStore;
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

  const toggleSpec = (key: string, value: string) => {
    setSelectedSpecs((prev) => {
      const newSpecs = { ...prev };
      if (newSpecs[key] === value) {
        delete newSpecs[key];
      } else {
        newSpecs[key] = value;
      }
      return newSpecs;
    });
  };

  return (
    <>
      <HeaderEcom />

      <main className="bg-[#f5f5f5] min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12">
          {!loading && filteredItems.length > 0 && (
            <aside className="w-full md:w-64 flex-shrink-0">
              <h1 className="text-3xl font-black text-[#0A2647] mb-2 capitalize tracking-tighter leading-none">
                {query}
              </h1>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
                {filteredItems.length} productos encontrados
              </p>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-[5px] h-8 bg-red-600 rounded-full"></div>
                    <h3 className="text-14xl font-black text-[#1E3A8A] uppercase tracking-tighter">
                      {dynamicFilters.path.main}
                    </h3>
                  </div>
                  <div className="pl-5">
                    <h4 className="text-[13px] font-black text-slate-500 uppercase tracking-tight mb-2">
                      {dynamicFilters.path.sub}
                    </h4>
                    <ul className="text-[13px] space-y-1 text-[#0A2647] font-bold border-l-2 border-slate-100 pl-6 ml-1">
                      <li>{dynamicFilters.path.leaf}</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[4px] h-5 bg-red-600 rounded-full"></div>
                    <h3 className="text-[14px] font-black text-[#1E3A8A] uppercase tracking-widest">
                      Filtrar por tienda
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2 pl-4">
                    {dynamicFilters.stores.map((store) => (
                      <button
                        key={store.name}
                        onClick={() =>
                          setSelectedStore(selectedStore === store.name ? null : store.name)
                        }
                        className={`text-[13px] text-left hover:text-red-600 transition-colors uppercase font-black tracking-tight ${
                          selectedStore === store.name ? "text-red-600" : "text-slate-400"
                        }`}
                      >
                        {store.name}{" "}
                        <span className="text-[10px] opacity-40 ml-1">({store.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {dynamicFilters.attributes.map((attr) => (
                  <div key={attr.name} className="border-t border-slate-100 pt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-[4px] h-5 bg-red-600 rounded-full"></div>
                      <h3 className="text-[14px] font-black text-[#1E3A8A] uppercase tracking-widest">
                        {attr.name}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-2 pl-4">
                      {attr.options.map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => toggleSpec(attr.name, opt.val)}
                          className={`text-[13px] text-left font-black uppercase tracking-tight ${
                            selectedSpecs[attr.name] === opt.val
                              ? "text-red-600"
                              : "text-[#0A2647] hover:text-red-600"
                          }`}
                        >
                          {opt.val}{" "}
                          <span className="text-[10px] opacity-40 ml-1">({opt.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[4px] h-5 bg-red-600 rounded-full"></div>
                    <h3 className="text-[14px] font-black text-[#1E3A8A] uppercase tracking-widest">
                      Precio máximo
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2 pl-4">
                    {[500, 1000, 2000].map((p) => (
                      <button
                        key={p}
                        onClick={() => setMaxPrice(maxPrice === p ? null : p)}
                        className={`text-[13px] text-left font-black uppercase tracking-tight ${
                          maxPrice === p
                            ? "text-red-600"
                            : "text-[#0A2647] hover:text-red-600"
                        }`}
                      >
                        Hasta USD {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

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
              <div className="flex flex-col gap-10">
                <div className="bg-white rounded-[48px] p-16 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl opacity-20">🔍</span>
                  </div>
                  <h2 className="text-3xl font-black text-[#0A2647] uppercase tracking-tighter mb-4">
                    No encontramos resultados para <br />{" "}
                    <span className="text-red-600">"{query}"</span>
                  </h2>
                  <div className="text-slate-400 text-sm font-bold space-y-1 uppercase tracking-tight">
                    <p>• Revisa la ortografía de la palabra.</p>
                    <p>• Utiliza términos más genéricos.</p>
                    <p>• Intenta buscar por marca o modelo específico.</p>
                  </div>
                  <Link
                    href="/"
                    className="mt-10 px-8 py-4 bg-[#0A2647] text-white font-black rounded-2xl uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <nav className="mb-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Link href="/" className="hover:text-[#0A2647] transition-colors">
                    Inicio
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/buscar?query=${dynamicFilters.path.main}`}
                    className="hover:text-[#0A2647] transition-colors"
                  >
                    {dynamicFilters.path.main}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/buscar?query=${dynamicFilters.path.sub}`}
                    className="hover:text-[#0A2647] transition-colors"
                  >
                    {dynamicFilters.path.sub}
                  </Link>
                  <span className="text-red-600">/</span>
                  <span className="text-[#0A2647]">{dynamicFilters.path.leaf}</span>
                </nav>

                <div className="mb-10 flex items-center justify-between gap-4">
                  <h1 className="text-2xl font-black text-[#0A2647] tracking-tighter capitalize">
                    Resultados <span className="text-slate-200"></span>{" "}
                    <span className="text-red-600">{}</span>
                  </h1>

                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Ordenar por
                    </span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="text-xs font-black text-[#0A2647] uppercase tracking-tight bg-transparent outline-none cursor-pointer border-l border-slate-100 pl-3"
                    >
                      <option value="relevant">Más relevantes</option>
                      <option value="price-asc">Menor precio</option>
                      <option value="price-desc">Mayor precio</option>
                    </select>
                  </div>
                </div>

                {/* 🚀 GRID DE PRODUCTOS REFACTORIZADO CON PRODUCTCARD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.slice(0, visibleCount).map((item) => {
                    const isInternal = !!item.isInternal;
                    // Precio RAW (sin margen)
                    const rawPrice = isInternal
                      ? item.priceUSD || 0
                      : typeof item.price === "number"
                        ? item.price
                        : Number(item.price) || 0;

                    // Normalizamos imagen
                    const imageUrl = isInternal
                      ? item.images?.[0] || item.imageUrl || item.image
                      : item.image || "";
                    const imagesArray = imageUrl ? [imageUrl as string] : [];

                    // Construimos la prop de producto para ProductCard
                    // Truco para eBay: Pasamos los params en el slug para que el Link de ProductCard funcione
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
                      priceUSD: rawPrice, // Pasamos precio RAW, ProductCard se encarga del +10%
                      estimatedUSD: 0,
                      imageUrl: imageUrl as string,
                      images: imagesArray,
                      store: isInternal ? item.brand || item.store : "eBay Store",
                      category: item.category?.leaf || item.category?.main || "General",
                    };

                    return <ProductCard key={item.id} product={cardProduct} />;
                  })}
                </div>

                {visibleCount < filteredItems.length && (
                  <div className="mt-12 flex justify-center pb-10">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                      className="px-10 py-4 bg-white border-2 border-[#0A2647] text-[#0A2647] font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-[#0A2647] hover:text-white transition-all shadow-xl active:scale-95"
                    >
                      Ver más resultados
                    </button>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="mt-6 text-sm font-bold text-red-600 uppercase tracking-widest">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}