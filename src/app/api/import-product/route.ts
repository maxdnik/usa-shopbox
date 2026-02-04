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
  description?: string; // ✅ NUEVO: Agregamos campo descripción
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

  // Descripción (Intento básico para Amazon)
  const description = 
    $("#productDescription").text().trim() || 
    $("meta[name='description']").attr("content")?.trim() || 
    "";

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
    priceUSD > 0 ? Number((priceUSD * 1.4).toFixed(2)) : 0; 

  return {
    id,
    title,
    imageUrl,
    store: "Amazon",
    url,
    priceUSD,
    estimatedUSD,
    category: "Producto importado",
    description, // ✅
  };
}

async function importFromEbay(url: string): Promise<ImportedProduct | null> {
  // 1. Obtenemos datos base (Título, Precio, Imagen) usando el genérico o lógica actual
  // Usamos un fetch propio para eBay para tener el HTML fresco y buscar el iframe
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/120 Safari/537.36",
    },
  });

  if (!res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);

  // A. Extracción Base (Replicamos la lógica del genérico pero sobre este HTML)
  const title = $("meta[property='og:title']").attr("content")?.trim() || $("title").first().text().trim();
  const imageUrl = $("meta[property='og:image']").attr("content")?.trim();
  
  let priceUSD = 0;
  const metaPrice = $("meta[property='product:price:amount']").attr("content") || $("meta[itemprop='price']").attr("content");
  if (metaPrice) {
    const parsed = parseFloat(metaPrice.replace(/[^\d.]/g, ""));
    if (!Number.isNaN(parsed)) priceUSD = parsed;
  }

  // B. 🔥 LÓGICA DE DESCRIPCIÓN (IFRAME) 🔥
  let description = "";
  // Buscamos el iframe que contiene la descripción
  const iframeSrc = $("iframe#desc_ifr").attr("src");

  if (iframeSrc) {
    try {
      // eBay a veces pone URLs relativas o completas, aseguramos que sea completa
      const descRes = await fetch(iframeSrc);
      if (descRes.ok) {
        const descHtml = await descRes.text();
        const $desc = cheerio.load(descHtml);
        
        // El contenido real suele estar en un div con id 'ds_div'
        const dsDiv = $desc("#ds_div").html();
        // Si no existe ds_div, tomamos el body, limpiando scripts
        description = (dsDiv || $desc("body").html() || "")
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Quitar scripts por seguridad
          .trim();
      }
    } catch (error) {
      console.error("Error fetching eBay description iframe:", error);
    }
  } else {
    // Fallback: Si no hay iframe, intentamos meta description
    description = $("meta[property='og:description']").attr("content") || "";
  }

  if (!title) return null;

  const id = crypto.randomUUID();
  const estimatedUSD = priceUSD > 0 ? Number((priceUSD * 1.4).toFixed(2)) : 0;

  return {
    id,
    title,
    imageUrl,
    store: "eBay",
    url,
    priceUSD,
    estimatedUSD,
    category: "Producto eBay",
    description, // ✅ Descripción completa del iframe
  };
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

  // Descripción
  const description = 
    $("meta[property='og:description']").attr("content")?.trim() || 
    $("meta[name='description']").attr("content")?.trim() || 
    "";

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
    description, // ✅
  };
}