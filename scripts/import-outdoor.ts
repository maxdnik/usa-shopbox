import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SEED_PATH = path.join(process.cwd(), "seeds", "outdoor-products.json");

type SeedItem = {
  id?: string;
  title: string;
  slug: string;
  brand?: string;
  store?: string;
  category?: { main?: string; sub?: string; leaf?: string };
  sku?: string;
  priceUSD?: number;
  imageUrls?: string[];
  images?: string[];
  sourceUrl?: string;
  weightKg?: number;
  weight?: number;
  description?: string;
  specs?: Record<string, any>;
  sizes?: string[];
  variants?: Array<{
    variantSku?: string;
    sku?: string;
    size?: string;
    stock?: number;
    price?: number;
  }>;
  color?: string;
};

function toStringArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  return [String(v)];
}

function normalizeTagsFromSpecs(specs: Record<string, any> | undefined) {
  const tags: string[] = [];

  for (const a of toStringArray(specs?.activity)) tags.push(`activity:${a}`);
  if (specs?.waterproof) tags.push(`waterproof:${String(specs.waterproof)}`);
  if (specs?.insulation) tags.push(`insulation:${String(specs.insulation)}`);

  return tags;
}

function buildOptionsFromSeed(item: SeedItem) {
  const opts: { name: string; values: string[] }[] = [];

  if (item.color) opts.push({ name: "Color", values: [String(item.color)] });

  const sizes =
    item.sizes?.length
      ? item.sizes.map(String)
      : item.variants?.map((v) => v.size).filter(Boolean).map(String) ?? [];

  const uniqueSizes = Array.from(new Set(sizes)).filter(Boolean);
  if (uniqueSizes.length) opts.push({ name: "Size", values: uniqueSizes });

  return opts;
}

function buildVariationsFromSeed(item: SeedItem) {
  const vars =
    item.variants?.map((v) => ({
      sku: v.variantSku ?? v.sku ?? item.sku ?? "",
      attribute: "Size",
      value: v.size ?? "",
      price: typeof v.price === "number" ? v.price : undefined,
      stock: typeof v.stock === "number" ? v.stock : undefined,
    })) ?? [];

  return vars.filter((v) => v.value);
}

function mapOutdoorCategory(item: SeedItem) {
  const leaf = String(item.category?.leaf ?? "").trim();

  const leafMap: Record<string, { main: string; sub: string; leaf: string }> = {
    "Shell Jackets": {
      main: "Ropa y Accesorios",
      sub: "Abrigos",
      leaf: "Camperas y Abrigos",
    },
    "Down Jackets": {
      main: "Ropa y Accesorios",
      sub: "Abrigos",
      leaf: "Camperas y Abrigos",
    },
    "Insulated Jackets": {
      main: "Ropa y Accesorios",
      sub: "Abrigos",
      leaf: "Camperas y Abrigos",
    },
    "Rain Jackets": {
      main: "Ropa y Accesorios",
      sub: "Abrigos",
      leaf: "Camperas y Abrigos",
    },
    "Parkas": {
      main: "Ropa y Accesorios",
      sub: "Abrigos",
      leaf: "Camperas y Abrigos",
    },
    "Fleece": {
      main: "Ropa y Accesorios",
      sub: "Ropa",
      leaf: "Buzos",
    },
    "Vests": {
      main: "Ropa y Accesorios",
      sub: "Ropa",
      leaf: "Camperas y Abrigos",
    },
    "Pants": {
      main: "Ropa y Accesorios",
      sub: "Ropa",
      leaf: "Pantalones",
    },
    "Hiking Boots": {
      main: "Deportes y Fitness",
      sub: "Outdoor",
      leaf: "Calzado Outdoor",
    },
    "Backpacks": {
      main: "Outdoor & Aventura",
      sub: "Bolsos y Gear",
      leaf: "Mochilas Outdoor",
    },
  };

  return (
    leafMap[leaf] ?? {
      main: "Outdoor & Aventura",
      sub: "Accesorios",
      leaf: "Otros Accesorios Outdoor",
    }
  );
}

async function main() {
  console.log("cwd:", process.cwd());
  console.log("MONGODB_URI loaded?", !!process.env.MONGODB_URI);

  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(`Seed file no encontrado: ${SEED_PATH}`);
  }

  const json = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
  const items: SeedItem[] = json.items ?? [];

  if (!items.length) throw new Error("Seed vacío");

  const { default: dbConnect } = await import("../src/lib/mongodb");
  const { Product } = await import("../src/lib/models/Product");

  await dbConnect();
  console.log("✅ Mongo conectado. Items:", items.length);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const item of items) {
    try {
      if (!item.slug || !item.title) {
        throw new Error("Item inválido: falta slug o title");
      }

      const images = (item.images?.length ? item.images : item.imageUrls) ?? [];
      const cleanImages = images.map(String).filter(Boolean);

      const tags = normalizeTagsFromSpecs(item.specs);
      const options = buildOptionsFromSeed(item);
      const variations = buildVariationsFromSeed(item);
      const mappedCategory = mapOutdoorCategory(item);

      const doc: any = {
        title: item.title,
        slug: item.slug,
        brand: item.brand ?? undefined,
        store: item.store ?? "Backcountry",

        source: "manual",
        sourceHandle: item.slug,
        sourceId: item.id ?? undefined,
        sourceUrl: item.sourceUrl ?? undefined,

        winterCategory: "outdoor",

        category: mappedCategory,

        description: item.description ?? "",
        priceUSD: typeof item.priceUSD === "number" ? item.priceUSD : undefined,

        weight:
          typeof item.weight === "number"
            ? item.weight
            : typeof item.weightKg === "number"
            ? item.weightKg
            : 0,

        images: cleanImages,

        specs: Object.fromEntries(
          Object.entries(item.specs ?? {}).map(([k, v]) => [
            k,
            Array.isArray(v) ? v.join(", ") : String(v),
          ])
        ),

        tags,
        options,
        variations,
      };

      const existing = await Product.findOne({ slug: item.slug }).select("_id").lean();

      if (existing?._id) {
        await Product.updateOne({ _id: existing._id }, { $set: doc });
        updated++;
        continue;
      }

      await Product.create(doc);
      created++;
    } catch (e) {
      failed++;
      console.error("❌ Error item:", item.slug, e);
    }
  }

  console.log("------------------------------------------------");
  console.log("✅ Import terminado");
  console.log({ created, updated, failed, total: items.length });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  });