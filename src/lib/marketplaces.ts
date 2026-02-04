// src/lib/marketplaces.ts

import { mockProducts, type Product } from "@/lib/products";

export type MarketplaceId = "amazon" | "ebay" | "nike" | "apple" | "bestbuy";

export type MarketplaceSearchParams = {
  query: string;
  page?: number;
  perPage?: number;
  // en el futuro podrías elegir fuentes: ["amazon","ebay"]
  sources?: MarketplaceId[];
};

/**
 * Category puede venir:
 * - string (legacy)
 * - { main, sub, leaf } (nuevo)
 * - null/undefined
 */
function normalizeCategory(category: any): { main: string; sub: string; leaf: string } {
  if (!category) return { main: "Otros", sub: "", leaf: "" };

  if (typeof category === "string") {
    // si viene "Electrónica > Celulares > iPhone" lo podemos partir, si no, queda en main
    const parts = category.split(">").map((s) => s.trim()).filter(Boolean);
    return {
      main: parts[0] ?? category,
      sub: parts[1] ?? "",
      leaf: parts[2] ?? "",
    };
  }

  if (typeof category === "object") {
    const main = typeof category.main === "string" ? category.main : "Otros";
    const sub = typeof category.sub === "string" ? category.sub : "";
    const leaf = typeof category.leaf === "string" ? category.leaf : "";
    return { main, sub, leaf };
  }

  return { main: String(category), sub: "", leaf: "" };
}

function categoryToSearchText(category: any): string {
  const c = normalizeCategory(category);
  return [c.main, c.sub, c.leaf].filter(Boolean).join(" ");
}

/**
 * Función central del "marketplace".
 * Hoy:
 *   - Si tenés PRODUCT_DATA_API_URL configurado:
 *       llama a esa API externa (tu scraper / proveedor de datos)
 *   - Si NO:
 *       usa mockProducts como fallback para que la app funcione.
 *
 * Mañana:
 *   - Esta función pasa a llamar a tus scrapers reales de Amazon/eBay/Nike, etc.
 */
export async function searchMarketplaceProducts(
  params: MarketplaceSearchParams
): Promise<Product[]> {
  const { query, page = 1, perPage = 24 } = params;

  const externalUrl = process.env.PRODUCT_DATA_API_URL;
  const externalKey = process.env.PRODUCT_DATA_API_KEY;

  // ===============================
  // MODO REAL: proveedor externo
  // ===============================
  if (externalUrl && externalKey) {
    try {
      const res = await fetch(externalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": externalKey,
        },
        body: JSON.stringify({
          query,
          page,
          perPage,
          sources: params.sources ?? ["amazon", "ebay", "nike", "apple", "bestbuy"],
        }),
      });

      if (!res.ok) {
        console.error("PRODUCT_DATA_API_URL error:", res.status);
        // caemos al fallback de mockProducts si falla
      } else {
        const data = await res.json();

        // Esperamos algo como data.items = [{ title, priceUSD, store, imageUrl, category, slug, description }]
        if (Array.isArray(data.items)) {
          const mapped: Product[] = data.items.map((item: any, index: number) => {
            const title = String(item.title ?? "Producto importado");
            const store = String(item.store ?? "Tienda USA");
            const priceUSD = Number(item.priceUSD ?? 0);

            return {
              id: String(item.id ?? `${store ?? "ext"}-${page}-${index}`),
              title,
              store,
              imageUrl: item.imageUrl,
              priceUSD,
              estimatedUSD: Number(item.estimatedUSD ?? (priceUSD ? priceUSD * 1.4 : 0)),
              category: normalizeCategory(item.category),
              slug: String(item.slug ?? slugify(title)),
              description: item.description ?? undefined,
            } as Product;
          });

          return mapped;
        }
      }
    } catch (error) {
      console.error("Error llamando PRODUCT_DATA_API_URL:", error);
      // si hay error, seguimos al fallback
    }
  }

  // ===============================
  // MODO FALLBACK: mockProducts
  // ===============================
  const q = query.toLowerCase();

  const filtered = mockProducts.filter((p: any) => {
    return (
      String(p.title ?? "").toLowerCase().includes(q) ||
      categoryToSearchText(p.category).toLowerCase().includes(q) ||
      String(p.store ?? "").toLowerCase().includes(q)
    );
  });

  const start = (page - 1) * perPage;
  const end = start + perPage;

  return filtered.slice(start, end);
}

/**
 * Slug tipo "nike-air-max-270-white-black"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
