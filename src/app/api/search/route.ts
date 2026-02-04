// src/app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import { mockProducts, type Product } from "@/lib/products";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normaliza cualquier tipo de category a un string indexable para búsqueda.
 * - Si es string => lo usa
 * - Si es objeto {main, sub, leaf} => concatena
 * - Si es null/undefined => ""
 */
function categoryToSearchText(
  category: unknown
): string {
  if (!category) return "";

  if (typeof category === "string") return category;

  if (typeof category === "object") {
    const c = category as any;
    const main = typeof c.main === "string" ? c.main : "";
    const sub = typeof c.sub === "string" ? c.sub : "";
    const leaf = typeof c.leaf === "string" ? c.leaf : "";
    return [main, sub, leaf].filter(Boolean).join(" ");
  }

  return String(category);
}

function storeToSearchText(store: unknown): string {
  if (!store) return "";
  if (typeof store === "string") return store;
  // por si en algún momento es objeto o enum raro
  return String(store);
}

function searchFallbackFromMock(query: string, perPage = 24): Product[] {
  const q = query.toLowerCase();

  const filtered = mockProducts.filter((p) => {
    const titleText = (p.title ?? "").toLowerCase();
    const categoryText = categoryToSearchText((p as any).category).toLowerCase();
    const storeText = storeToSearchText((p as any).store).toLowerCase();

    return (
      titleText.includes(q) ||
      categoryText.includes(q) ||
      storeText.includes(q)
    );
  });

  return filtered.slice(0, perPage);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim();

  if (!query) {
    return NextResponse.json<{ products: Product[] }>({ products: [] });
  }

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
    );

    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

    try {
      await page.goto(amazonUrl, {
        waitUntil: "domcontentloaded",
        timeout: 0,
      });
    } catch (navErr) {
      console.error("Error en page.goto (Amazon):", navErr);
      const fallback = searchFallbackFromMock(query);
      return NextResponse.json<{ products: Product[] }>({ products: fallback });
    }

    try {
      await page.waitForSelector('[data-component-type="s-search-result"]', {
        timeout: 12000,
      });
    } catch (selErr) {
      console.error("No se encontraron resultados en Amazon:", selErr);
      const fallback = searchFallbackFromMock(query);
      return NextResponse.json<{ products: Product[] }>({ products: fallback });
    }

    const items = await page.$$eval(
      '[data-component-type="s-search-result"]',
      (nodes) =>
        nodes.slice(0, 20).map((el) => {
          const titleEl = el.querySelector("h2 a span");
          const priceWhole = el.querySelector(".a-price-whole");
          const priceFrac = el.querySelector(".a-price-fraction");
          const imageEl = el.querySelector("img.s-image");
          const linkEl = el.querySelector("h2 a");

          const title = titleEl ? titleEl.textContent?.trim() : null;
          const imageUrl = imageEl ? (imageEl as HTMLImageElement).src : null;
          const link = linkEl ? (linkEl as HTMLAnchorElement).href : null;

          let priceText: string | null = null;
          if (priceWhole) {
            priceText =
              priceWhole.textContent!.replace(/[^\d]/g, "") +
              "." +
              (priceFrac
                ? priceFrac.textContent!.replace(/[^\d]/g, "")
                : "00");
          }

          const priceUSD = priceText ? parseFloat(priceText) : null;

          return {
            title,
            imageUrl,
            url: link,
            priceUSD,
          };
        })
    );

    const productsFromAmazon: Product[] = items
      .filter((it) => it.title && it.priceUSD)
      .map((it, index) => {
        const price = it.priceUSD as number;
        const estimated = Number((price * 1.35).toFixed(2)); // después lo afinamos

        return {
          id: `amazon-${Date.now()}-${index}`,
          title: it.title as string,
          store: "Amazon",
          imageUrl: it.imageUrl || undefined,
          priceUSD: price,
          estimatedUSD: estimated,
          // 👇 si tu Product.category es objeto en el tipo, esto podría exigir ajuste.
          // Pero como ya te compila el resto, lo dejo como string SOLO si tu Product lo acepta.
          // Si tu Product requiere objeto, decime y lo adapto a {main,sub,leaf}.
          category: "Buscado en Amazon" as any,
          slug: slugify(it.title as string),
          description: it.url || "", // de momento guardo la URL real acá
        };
      });

    if (productsFromAmazon.length > 0) {
      return NextResponse.json<{ products: Product[] }>({
        products: productsFromAmazon,
      });
    }

    const fallback = searchFallbackFromMock(query);
    return NextResponse.json<{ products: Product[] }>({ products: fallback });
  } catch (error) {
    console.error("Error general en /api/search (Amazon):", error);
    const fallback = searchFallbackFromMock(query);
    return NextResponse.json<{ products: Product[] }>({ products: fallback });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

