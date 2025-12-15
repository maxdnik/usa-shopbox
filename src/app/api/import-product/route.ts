// src/app/api/import-product/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import crypto from "crypto";

export const runtime = "nodejs"; // necesario para poder usar cheerio / scraping en Next.js

// =========================
// Types
// =========================

type ImportedProduct = {
  id: string;
  title: string;
  imageUrl?: string;
  store: string;
  url: string;
  priceUSD: number;
  estimatedUSD: number;
  category?: string;
};

// =========================
// MAIN POST HANDLER
// =========================

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL requerida" },
        { status: 400 }
      );
    }

    const hostname = new URL(url).hostname.toLowerCase();

    let product: ImportedProduct | null = null;

    // Detectamos tienda según URL
    if (hostname.includes("amazon")) {
      product = await importFromAmazon(url);
    } else if (hostname.includes("ebay")) {
      product = await importFromEbay(url);
    } else if (hostname.includes("nike")) {
      product = await importFromNike(url);
    } else if (hostname.includes("bestbuy")) {
      product = await importFromBestBuy(url);
    } else {
      // fallback genérico
      product = await importFromGeneric(url);
    }

    if (!product) {
      return NextResponse.json(
        {
          error:
            "No se pudo obtener la información automáticamente. Probá con otro link o más tarde.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("Error en /api/import-product:", err);
    return NextResponse.json(
      { error: "Error procesando la URL" },
      { status: 500 }
    );
  }
}

// ======================================================================
// ADAPTADORES PARA CADA TIENDA
// ======================================================================

async function importFromAmazon(url: string): Promise<ImportedProduct | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    console.error("Amazon fetch error:", res.status);
    return null;
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Título del producto
  const title =
    $("#productTitle").text().trim() ||
    $("meta[property='og:title']").attr("content")?.trim() ||
    $("title").first().text().trim();

  if (!title) {
    console.error("No se encontró título en Amazon");
    return null;
  }

  // Imagen principal
  const landingImg = $("#landingImage").attr("src");
  const ogImage = $("meta[property='og:image']").attr("content");
  const imageUrl = (landingImg || ogImage)?.trim();

  // Precio (probamos varios selectores típicos)
  const priceSelectors = [
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    "#corePrice_feature_div span.a-offscreen",
    "span.a-price span.a-offscreen",
  ];

  let priceUSD = 0;

  for (const sel of priceSelectors) {
    const text = $(sel).first().text().trim();
    if (text) {
      const numeric = parseFloat(
        text.replace(/[^\d.,]/g, "").replace(",", ".")
      );
      if (!Number.isNaN(numeric)) {
        priceUSD = numeric;
        break;
      }
    }
  }

  const id = crypto.randomUUID();
  const estimatedUSD =
    priceUSD > 0 ? Number((priceUSD * 1.4).toFixed(2)) : 0; // tu fórmula se puede ajustar

  return {
    id,
    title,
    imageUrl,
    store: "Amazon",
    url,
    priceUSD,
    estimatedUSD,
    category: "Producto importado",
  };
}

async function importFromEbay(url: string): Promise<ImportedProduct | null> {
  // De momento usa fallback genérico
  const base = await importFromGeneric(url);
  if (!base) return null;
  return { ...base, store: "eBay" };
}

async function importFromNike(url: string): Promise<ImportedProduct | null> {
  const base = await importFromGeneric(url);
  if (!base) return null;
  return { ...base, store: "Nike" };
}

async function importFromBestBuy(url: string): Promise<ImportedProduct | null> {
  const base = await importFromGeneric(url);
  if (!base) return null;
  return { ...base, store: "BestBuy" };
}

// ======================================================================
// FALLBACK GENÉRICO (funciona con cualquier página que exponga OG tags)
// ======================================================================

async function importFromGeneric(url: string): Promise<ImportedProduct | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/120 Safari/537.36",
    },
  });

  if (!res.ok) {
    console.error("Generic fetch error:", res.status);
    return null;
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Título general
  const title =
    $("meta[property='og:title']").attr("content")?.trim() ||
    $("title").first().text().trim();

  if (!title) return null;

  // Imagen principal
  const imageUrl = $("meta[property='og:image']").attr("content")?.trim();

  // Precio (mínimo soporte con meta tags)
  let priceUSD = 0;
  const metaPrice =
    $("meta[property='product:price:amount']").attr("content") ||
    $("meta[itemprop='price']").attr("content");

  if (metaPrice) {
    const parsed = parseFloat(metaPrice.replace(/[^\d.]/g, ""));
    if (!Number.isNaN(parsed)) priceUSD = parsed;
  }

  const id = crypto.randomUUID();
  const estimatedUSD =
    priceUSD > 0 ? Number((priceUSD * 1.4).toFixed(2)) : 0;

  return {
    id,
    title,
    imageUrl,
    store: "Tienda USA",
    url,
    priceUSD,
    estimatedUSD,
    category: "Producto importado",
  };
}
