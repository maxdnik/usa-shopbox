"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderEcom from "@/components/home/HeaderEcom";
import { useCart } from "@/context/CartContext";

export default function ImportProductPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleImport = async () => {
    setError(null);

    if (!url.trim()) {
      setError("Pegá el link del producto.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/import-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "No pudimos traer el producto automáticamente.");
        setLoading(false);
        return;
      }

      // data: { id, title, imageUrl, store, priceUSD, estimatedUSD, url }
      addToCart({
        id: data.id,
        title: data.title,
        store: data.store,
        imageUrl: data.imageUrl,

        // ✅ requerido por CartItem
        priceUSD: Number(data.priceUSD ?? data.estimatedUSD ?? 0),

        estimatedUSD: Number(data.estimatedUSD ?? data.priceUSD ?? 0),
        quantity: 1,
        sourceUrl: data.url,
      });


      // Ir directo al carrito
      router.push("/carrito");
    } catch (e) {
      console.error(e);
      setError("Error de conexión. Probá de nuevo en unos segundos.");
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderEcom />
      <main className="bg-[#f5f5f5] min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h1 className="text-2xl font-bold mb-4">
              Traé un producto desde USA
            </h1>
            <p className="text-gray-700 mb-6">
              Pegá el link de Amazon, eBay, Nike, BestBuy u otra tienda de
              Estados Unidos. Vamos a traer automáticamente los datos del
              producto y calcular un precio estimado puesto en Argentina.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Link del producto
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.amazon.com/..."
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2647]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {loading ? "Importando producto..." : "Traer producto y agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
