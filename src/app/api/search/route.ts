// src/app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
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

function searchFallbackFromMock(query: string, perPage = 24): Product[] {
  const q = query.toLowerCase();

  const filtered = mockProducts.filter((p) => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.store.toLowerCase().includes(q)
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

  let browser: puppeteer.Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
    );

    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
      query
    )}`;

    // ⚠️ CAMBIO CLAVE:
    // - timeout: 0 => sin timeout de navegación
    // - waitUntil: "domcontentloaded" => no esperamos a "networkidle2"
    try {
      await page.goto(amazonUrl, {
        waitUntil: "domcontentloaded",
        timeout: 0,
      });
    } catch (navErr) {
      console.error("Error en page.goto (Amazon):", navErr);
      // si la navegación falla, devolvemos fallback
      const fallback = searchFallbackFromMock(query);
      return NextResponse.json<{ products: Product[] }>({ products: fallback });
    }

    // Esperamos a que aparezcan resultados, pero con timeout razonable
    try {
      await page.waitForSelector('[data-component-type="s-search-result"]', {
        timeout: 12000, // 12s máximo
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
          category: "Buscado en Amazon",
          slug: slugify(it.title as string),
          description: it.url, // de momento guardo la URL real acá
        };
      });

    // Si Amazon devolvió productos, usamos esos.
    if (productsFromAmazon.length > 0) {
      return NextResponse.json<{ products: Product[] }>({
        products: productsFromAmazon,
      });
    }

    // Si por X motivo la lista vino vacía, usamos fallback
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
