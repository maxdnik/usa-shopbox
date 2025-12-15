// scripts/fetchEbayImages.ts
// Ejecutar con: npx ts-node scripts/fetchEbayImages.ts
// (o npx tsx scripts/fetchEbayImages.ts)

import fs from "fs";
import path from "path";
import { mockProducts, Product } from "../src/lib/products";
import { getEbayToken } from "../src/lib/ebayAuth";

async function searchEbayImage(
  query: string,
  token: string
): Promise<string | null> {
  const url = new URL(
    "https://api.ebay.com/buy/browse/v1/item_summary/search"
  );
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Error eBay (${res.status}) para "${query}":`, text);
    return null;
  }

  const data: any = await res.json();
  const item = data.itemSummaries?.[0];
  const imageUrl: string | undefined = item?.image?.imageUrl;

  return imageUrl ?? null;
}

async function main() {
  const token = await getEbayToken();
  const updated: Product[] = [];

  for (const product of mockProducts) {
    console.log(`🔍 Buscando imagen para: ${product.title}`);

    let imageUrl: string | null = null;

    try {
      imageUrl = await searchEbayImage(product.title, token);
    } catch (err) {
      console.error("Error buscando imagen:", err);
    }

    if (!imageUrl) {
      console.warn(`⚠️ No se encontró imagen para "${product.title}"`);
    }

    updated.push({
      ...product,
      imageUrl: imageUrl ?? product.imageUrl, // por si después querés setear alguna manual
    });

    // Pequeño delay para no spamear la API
    await new Promise((r) => setTimeout(r, 700));
  }

  const outputPath = path.join(
    process.cwd(),
    "src/lib/products-with-images.json"
  );

  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2), "utf8");
  console.log(`✅ Listo. Archivo generado en: ${outputPath}`);
}

main().catch((err) => {
  console.error("Error general:", err);
  process.exit(1);
});
