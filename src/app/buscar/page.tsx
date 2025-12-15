"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HeaderEcom from "@/components/home/HeaderEcom";

type EbayItem = {
  id: string;
  title: string;
  price?: number | string;
  currency?: string;
  image?: string | null;
  url: string | null;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [items, setItems] = useState<EbayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      return;
    }

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/ebay/search?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data?.error || "Error al buscar productos en eBay.");
          setItems([]);
        } else {
          setItems(data.items || []);
        }
      } catch (e) {
        console.error(e);
        setError("No se pudo conectar con el servidor.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [query]);

  return (
    <>
      <HeaderEcom />
      <main className="bg-[#f5f5f5] min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">
            Resultados para:{" "}
            <span className="text-red-600 break-words">{query}</span>
          </h1>

          {loading && <p className="text-gray-700">Buscando productos...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {!loading && !error && items.length === 0 && query && (
            <p className="text-gray-600">
              No encontramos productos para tu búsqueda. Probá con otra palabra
              clave o marca.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {items.map((item) => {
              // normalizamos precio a string lindo
              let priceLabel: string | null = null;
              if (item.price != null) {
                const n =
                  typeof item.price === "number"
                    ? item.price
                    : Number(item.price);
                priceLabel = isNaN(n) ? String(item.price) : n.toFixed(2);
              }

              // nos aseguramos de que image/url sean strings (evitar [object Object])
              const imageUrl =
                typeof item.image === "string" ? item.image : "";
              const productUrl =
                typeof item.url === "string" ? item.url : "";

              // armamos querystring con la info para el detalle
              const qs = new URLSearchParams({
                src: "ebay",
                title: item.title ?? "",
                price: priceLabel || "",
                currency: item.currency || "USD",
                image: imageUrl,
                url: productUrl,
              });

              return (
                <div
                  key={item.id || productUrl || item.title}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col"
                >
                  {/* Imagen */}
                  <div className="bg-[#f2f2f2] h-40 flex items-center justify-center text-gray-400 text-sm">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      "Imagen no disponible"
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs text-gray-500 mb-1">
                      desde{" "}
                      <span className="font-semibold text-gray-800">eBay</span>
                    </div>

                    <h2 className="font-semibold text-sm mb-2 line-clamp-2">
                      {item.title}
                    </h2>

                    <div className="text-sm mb-3">
                      {priceLabel ? (
                        <>
                          <div>
                            Precio en USA:{" "}
                            <span className="font-semibold">
                              {item.currency || "USD"} {priceLabel}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Precio no disponible.
                        </span>
                      )}
                    </div>

                    {/* Detalle en tu sitio */}
                    <Link
                      href={`/producto/${encodeURIComponent(
                        item.id || productUrl || item.title
                      )}?${qs.toString()}`}
                      className="mt-auto bg-[#0a2647] text-white text-sm py-2 rounded-lg font-semibold hover:bg-[#06172b] transition text-center"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
