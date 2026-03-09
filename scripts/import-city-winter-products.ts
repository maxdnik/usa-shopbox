import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SEED_PATH = path.join(process.cwd(), "seeds", "city-winter.json");

type SeedImage = {
  url?: string;
  label?: string;
};

type SeedItem = {
  id?: string;
  type?: string;
  title: string;
  slug: string;
  brand?: string;
  store?: string;
  category?: { main?: string; sub?: string; leaf?: string };
  sku?: string;
  priceUSD?: number | null;
  currency?: string;

  imageUrl?: string;
  imageUrls?: string[];
  images?: SeedImage[] | string[];

  sourceUrl?: string;

  weightKg?: number;
  weight?: number;

  description?: string;
  specs?: Record<string, any>;

  sizes?: string[];
  variants?: any[];

  color?: string;
  featured?: boolean;
  tags?: string[];

  stock?: { status?: string; note?: string };
  availability?: { status?: string; note?: string };
  stockNote?: string;
  inStockNote?: string;
  inStock?: boolean;
};

function toStringArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map((x) => x.trim()).filter(Boolean);
  return [String(v).trim()].filter(Boolean);
}

function cleanUrl(url: string) {
  return String(url).trim().replace(/^hhttps:\/\//, "https://");
}

function getImages(item: SeedItem): string[] {
  const out: string[] = [];

  if (Array.isArray(item.images) && item.images.length) {
    for (const img of item.images) {
      if (typeof img === "string") out.push(cleanUrl(img));
      else if (img?.url) out.push(cleanUrl(img.url));
    }
  }

  if (Array.isArray(item.imageUrls) && item.imageUrls.length) {
    for (const url of item.imageUrls) out.push(cleanUrl(url));
  }

  if (item.imageUrl) out.push(cleanUrl(item.imageUrl));

  return Array.from(new Set(out)).filter(Boolean);
}

function getStock(item: SeedItem) {
  if (item.stock) {
    return {
      status: item.stock.status ?? "in_stock",
      note: item.stock.note ?? "",
    };
  }

  if (item.availability) {
    return {
      status: item.availability.status ?? "in_stock",
      note: item.availability.note ?? "",
    };
  }

  if (item.stockNote) {
    return {
      status: "in_stock",
      note: item.stockNote,
    };
  }

  if (item.inStockNote) {
    return {
      status: "in_stock",
      note: item.inStockNote,
    };
  }

  if (typeof item.inStock === "boolean") {
    return {
      status: item.inStock ? "in_stock" : "out_of_stock",
      note: "",
    };
  }

  return {
    status: "in_stock",
    note: "",
  };
}

/**
 * IMPORTANTE:
 * El schema Product aparentemente SOLO acepta:
 * winterCategory: "ski" | "snowboard" | "outdoor"
 *
 * Por eso City Winter y City Winter Women van como "outdoor"
 * y la segmentación fina queda en category/tags/specs.
 */
function getWinterCategory(item: SeedItem): "ski" | "snowboard" | "outdoor" {
  const sub = String(item.category?.sub ?? "").toLowerCase().trim();

  if (sub === "city winter" || sub === "city winter women") {
    return "outdoor";
  }

  return "outdoor";
}

function mapCategory(item: SeedItem) {
  const sub = String(item.category?.sub ?? "").toLowerCase().trim();
  const leaf = String(item.category?.leaf ?? "").trim();

  if (sub === "city winter") {
    return {
      main: "Ropa y Accesorios",
      sub: "Abrigos",
      leaf: leaf || "Camperas y Abrigos",
    };
  }

  if (sub === "city winter women") {
    const leafLower = leaf.toLowerCase();

    if (leafLower.includes("boots")) {
      return {
        main: "Ropa y Accesorios",
        sub: "Calzado",
        leaf: "Zapatos",
      };
    }

    if (
      leafLower.includes("beanies") ||
      leafLower.includes("scarves") ||
      leafLower.includes("gloves")
    ) {
      return {
        main: "Ropa y Accesorios",
        sub: "Accesorios",
        leaf: "Guantes y Bufandas",
      };
    }

    return {
      main: "Ropa y Accesorios",
      sub: "Abrigos",
      leaf: leaf || "Camperas y Abrigos",
    };
  }

  return {
    main: "Outdoor & Aventura",
    sub: "Accesorios",
    leaf: "Otros Accesorios Outdoor",
  };
}

function getSizes(item: SeedItem): string[] {
  return Array.from(new Set(toStringArray(item.sizes)));
}

function buildOptionsFromSeed(item: SeedItem) {
  const opts: { name: string; values: string[] }[] = [];
  const sizes = getSizes(item);

  if (sizes.length) {
    opts.push({
      name: "Size",
      values: sizes,
    });
  }

  return opts;
}

function buildVariationsFromSeed(item: SeedItem) {
  const sizes = getSizes(item);

  return sizes.map((size) => ({
    sku: item.sku ? `${item.sku}-${size}` : `${item.slug}-${size}`,
    attribute: "Size",
    value: size,
    price: typeof item.priceUSD === "number" ? item.priceUSD : undefined,
    stock: undefined,
  }));
}

function normalizeSpecs(specs?: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(specs ?? {}).map(([k, v]) => [
      k,
      Array.isArray(v)
        ? v.join(", ")
        : typeof v === "object" && v !== null
        ? JSON.stringify(v)
        : String(v),
    ])
  );
}

function normalizeTags(item: SeedItem) {
  const tags = new Set<string>();

  const winterType = getWinterCategory(item);
  tags.add(`winter:${winterType}`);

  if (item.brand) tags.add(`brand:${String(item.brand).trim()}`);

  const originalSub = String(item.category?.sub ?? "").trim();
  const originalLeaf = String(item.category?.leaf ?? "").trim();
  const type = String(item.type ?? "").trim();

  if (originalSub) tags.add(`collection:${originalSub.toLowerCase().replace(/\s+/g, "-")}`);
  if (originalLeaf) tags.add(`leaf:${originalLeaf.toLowerCase().replace(/\s+/g, "-")}`);
  if (type) tags.add(`type:${type.toLowerCase().replace(/\s+/g, "-")}`);

  const providedTags = toStringArray(item.tags);
  for (const t of providedTags) tags.add(t);

  return Array.from(tags);
}

function inferGenderSegment(item: SeedItem): "men" | "women" | "unisex" {
  const sub = String(item.category?.sub ?? "").toLowerCase().trim();
  const title = String(item.title ?? "").toLowerCase();

  if (sub.includes("women") || title.includes("women")) return "women";
  if (title.includes("men") || title.includes("men's")) return "men";
  return "unisex";
}

async function main() {
  console.log("cwd:", process.cwd());
  console.log("MONGODB_URI loaded?", !!process.env.MONGODB_URI);

  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(`Seed file no encontrado: ${SEED_PATH}`);
  }

  const raw = fs.readFileSync(SEED_PATH, "utf-8");
  const json = JSON.parse(raw);

  const items: SeedItem[] = Array.isArray(json)
    ? json
    : Array.isArray(json.items)
    ? json.items
    : [];

  if (!items.length) {
    throw new Error("Seed vacío o estructura inválida");
  }

  const { default: dbConnect } = await import("../src/lib/mongodb");
  const { Product } = await import("../src/lib/models/Product");

  const ProductModel: any = Product;

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

      const cleanImages = getImages(item);
      const stock = getStock(item);
      const options = buildOptionsFromSeed(item);
      const variations = buildVariationsFromSeed(item);
      const mappedCategory = mapCategory(item);
      const winterCategory = getWinterCategory(item);
      const sizes = getSizes(item);
      const genderSegment = inferGenderSegment(item);

      const safeSpecs = normalizeSpecs({
        ...(item.specs ?? {}),
        originalCategoryMain: item.category?.main ?? "",
        originalCategorySub: item.category?.sub ?? "",
        originalCategoryLeaf: item.category?.leaf ?? "",
        originalProductType: item.type ?? "",
        color: item.color ?? "",
        sizes: sizes.join(", "),
        genderSegment,
      });

      const doc: any = {
        title: item.title,
        slug: item.slug,
        brand: item.brand ?? undefined,
        store: item.store ?? undefined,

        source: "manual",
        sourceHandle: item.slug,
        sourceId: item.id ?? undefined,
        sourceUrl: item.sourceUrl ?? undefined,

        winterCategory, // <- city winter entra como "outdoor" para respetar enum
        productType: item.type ?? "product",

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

        specs: safeSpecs,

        tags: normalizeTags(item),
        options,
        variations,

        stockStatus: stock.status,
        stockNote: stock.note,
        featured: !!item.featured,
      };

      const existing = await ProductModel.findOne({ slug: item.slug }).select("_id").lean();

      if (existing?._id) {
        await ProductModel.updateOne({ _id: existing._id }, { $set: doc });
        updated++;
        console.log(`♻️ Updated: ${item.slug}`);
        continue;
      }

      await ProductModel.create(doc);
      created++;
      console.log(`✅ Created: ${item.slug}`);
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