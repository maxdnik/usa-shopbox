import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import mongoose from "mongoose";

type CuratedItem = {
  brand: string;
  title: string;
};

const CITY_WINTER_CURATED: CuratedItem[] = [
  { brand: "Fjallraven", title: "Nuuk Parka" },
  { brand: "Canada Goose", title: "Langford Parka" },
  { brand: "Woolrich", title: "Arctic Parka" },
  { brand: "Filson", title: "Down Cruiser Jacket" },
  { brand: "Barbour", title: "Ashby Wax Jacket" },
  { brand: "Patagonia", title: "Frozen Range Parka" },
  { brand: "The North Face", title: "McMurdo Parka" },
  { brand: "Arc'teryx", title: "Therme Parka" },
  { brand: "Nobis", title: "Cartel Parka" },
  { brand: "Moose Knuckles", title: "Stirling Parka" },

  { brand: "Filson", title: "Guide Wool Sweater" },
  { brand: "Fjallraven", title: "Ovik Knit Sweater" },
  { brand: "Patagonia", title: "Better Sweater Jacket" },
  { brand: "Pendleton", title: "Shetland Wool Sweater" },
  { brand: "Barbour", title: "Patch Crew Neck Sweater" },
  { brand: "Woolrich", title: "Pure Wool Crewneck" },
  { brand: "Norrona", title: "Warm Wool Sweater" },
  { brand: "Arc'teryx", title: "Covert Cardigan" },

  { brand: "Canada Goose", title: "Merino Beanie" },
  { brand: "Filson", title: "Watch Cap Beanie" },
  { brand: "Arc'teryx", title: "Rho Merino Beanie" },
  { brand: "Patagonia", title: "Brodeo Beanie" },
  { brand: "Fjallraven", title: "Classic Knit Hat" },
  { brand: "Filson", title: "Wool Scarf" },
  { brand: "Pendleton", title: "Yakima Camp Scarf" },
  { brand: "Hestra", title: "Leather Winter Gloves" },
  { brand: "Filson", title: "Insulated Gloves" },
  { brand: "Arc'teryx", title: "Venta Gloves" },

  { brand: "Blundstone", title: "Thermal Boots" },
  { brand: "Sorel", title: "Caribou Boots" },
  { brand: "Danner", title: "Mountain 600 Boots" },
  { brand: "Red Wing", title: "Iron Ranger Boots" },
  { brand: "Timberland", title: "Premium 6-Inch Waterproof" },
  { brand: "UGG", title: "Butte Boots" },
  { brand: "Sorel", title: "Madson II Boots" },

  { brand: "Filson", title: "Dryden Backpack" },
  { brand: "Bellroy", title: "Apex Backpack" },
  { brand: "Peak Design", title: "Everyday Backpack" },
  { brand: "YETI", title: "Crossroads Backpack 27L" },
  { brand: "Fjallraven", title: "Kanken No.2 Laptop Bag" },
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getKeywords(title: string): string[] {
  const stopwords = new Set([
    "mens",
    "men",
    "womens",
    "women",
    "the",
    "and",
    "with",
    "for",
    "ii",
    "2",
    "no",
  ]);

  return normalize(title)
    .split(" ")
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

async function main() {
  console.log("MONGODB_URI loaded?", !!process.env.MONGODB_URI);

  const { default: dbConnect } = await import("../src/lib/mongodb");
  const { Product } = await import("../src/lib/models/Product");

  console.log("typeof dbConnect:", typeof dbConnect);
  console.log("typeof Product:", typeof Product);

  await dbConnect();

  async function findMatch(item: CuratedItem) {
    const brandRegex = new RegExp(escapeRegex(item.brand), "i");
    const fullTitleRegex = new RegExp(escapeRegex(item.title), "i");

    let candidates = await Product.find({
      brand: brandRegex,
      title: fullTitleRegex,
    })
      .select("title brand slug sku category priceUSD")
      .lean();

    if (candidates.length > 0) {
      return { status: "matched_full_title", candidates };
    }

    const keywords = getKeywords(item.title);
    const keywordRegexes = keywords.map((k) => new RegExp(escapeRegex(k), "i"));

    candidates = await Product.find({
      brand: brandRegex,
      $and: keywordRegexes.map((rx) => ({ title: rx })),
    })
      .select("title brand slug sku category priceUSD")
      .lean();

    if (candidates.length > 0) {
      return { status: "matched_keywords", candidates };
    }

    candidates = await Product.find({
      brand: brandRegex,
      $or: keywordRegexes.map((rx) => ({ title: rx })),
    })
      .select("title brand slug sku category priceUSD")
      .lean();

    const normalizedTarget = normalize(item.title);

    const scored = candidates
      .map((c: any) => {
        const normalizedDbTitle = normalize(c.title || "");
        let score = 0;

        for (const kw of keywords) {
          if (normalizedDbTitle.includes(kw)) score += 1;
        }

        if (normalizedDbTitle === normalizedTarget) score += 5;

        return { ...c, _score: score };
      })
      .filter((c: any) => c._score >= 2)
      .sort((a: any, b: any) => b._score - a._score);

    if (scored.length > 0) {
      return { status: "matched_fuzzy", candidates: scored };
    }

    return { status: "missing", candidates: [] };
  }

  const found: any[] = [];
  const missing: CuratedItem[] = [];

  console.log(`\n🔎 Revisando ${CITY_WINTER_CURATED.length} productos City Winter...\n`);

  for (const item of CITY_WINTER_CURATED) {
    const result = await findMatch(item);

    if (result.status === "missing") {
      missing.push(item);
      console.log(`❌ FALTA  | ${item.brand} — ${item.title}`);
    } else {
      const top = result.candidates[0];
      found.push({
        requested: item,
        matchType: result.status,
        matches: result.candidates,
      });

      console.log(
        `✅ OK     | ${item.brand} — ${item.title}  --->  ${top?.brand} | ${top?.title}`
      );
    }
  }

  console.log("\n================ RESUMEN ================\n");
  console.log(`✅ Ya presentes: ${found.length}`);
  console.log(`❌ Faltantes: ${missing.length}`);

  const outDir = path.resolve(process.cwd(), "scripts/output");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, "city-winter-found.json"),
    JSON.stringify(found, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(outDir, "city-winter-missing.json"),
    JSON.stringify(missing, null, 2),
    "utf-8"
  );

  console.log("\n📁 Archivos generados:");
  console.log(" - scripts/output/city-winter-found.json");
  console.log(" - scripts/output/city-winter-missing.json");

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ Error running city winter check:", err);

  try {
    await mongoose.connection.close();
  } catch {}

  process.exit(1);
});