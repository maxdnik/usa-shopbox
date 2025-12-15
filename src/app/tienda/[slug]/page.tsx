// src/app/tienda/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import HeaderEcom from "@/components/home/HeaderEcom";
import { OFFICIAL_STORES } from "@/lib/stores";
import { mockProducts } from "@/lib/products";

// En Next 16 params y searchParams vienen como Promise
type StorePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ categoria?: string }>;
};

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { slug } = await params;
  const { categoria } = await searchParams;

  const storeDef = OFFICIAL_STORES.find(
    (s: any) => s.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!storeDef) {
    return notFound();
  }

  // Todos los productos de esa tienda
  const storeProducts = mockProducts.filter(
    (p) => p.store.toLowerCase() === storeDef.name.toLowerCase()
  );

  // Categorías disponibles dentro de esa tienda
  const categories = Array.from(
    new Set(storeProducts.map((p) => p.category))
  );

  const activeCategory =
    categoria && categoria !== "todos" ? categoria : "todos";

  const filteredProducts =
    activeCategory === "todos"
      ? storeProducts
      : storeProducts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Navbar / header principal */}
      <HeaderEcom />

      <main className="bg-[#f5f5f5] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header de la tienda */}
          <header className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-200">
              <Image
                src={storeDef.image || "/product-placeholder.png"}
                alt={storeDef.name}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Productos de {storeDef.name} desde USA
              </h1>
              <p className="text-sm text-slate-500">
                Seleccionamos productos populares de {storeDef.name} para traer a
                Argentina.
              </p>
            </div>
          </header>

          {/* C) Filtros por categoría (celulares, computadoras, AirPods, etc.) */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {/* Botón "Todos" */}
              <Link
                href={`/tienda/${slug}`}
                className={
                  "px-3 py-1 rounded-full text-sm border " +
                  (activeCategory === "todos"
                    ? "bg-[#0A2647] text-white border-[#0A2647]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
                }
              >
                Todos
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/tienda/${slug}?categoria=${encodeURIComponent(cat)}`}
                  className={
                    "px-3 py-1 rounded-full text-sm border " +
                    (activeCategory === cat
                      ? "bg-[#0A2647] text-white border-[#0A2647]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
                  }
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {/* Grid de productos */}
          {filteredProducts.length === 0 ? (
            <p className="text-slate-500">
              Todavía no tenemos productos cargados para esta categoría.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col"
                >
                  {/* Más adelante: product.imageUrl */}
                  <div className="mb-3 h-40 w-full rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
                    Imagen producto
                  </div>

                  <h3 className="font-semibold mb-1 line-clamp-2 text-slate-900">
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-1">
                    desde {product.store}
                  </p>

                  <p className="text-sm text-slate-700">
                    Precio en USA:{" "}
                    <span className="font-semibold">
                      USD {product.priceUSD}
                    </span>
                  </p>
                  <p className="text-sm text-emerald-700 mb-4">
                    Estimado puesto en Arg:{" "}
                    <span className="font-semibold">
                      USD {product.estimatedUSD}
                    </span>
                  </p>

                  <Link
                    href={`/producto/${product.slug}`}
                    className="mt-auto inline-flex items-center justify-center rounded-xl bg-[#0A2647] text-white text-sm font-semibold py-2 hover:bg-[#0c315d]"
                  >
                    Ver detalle
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
