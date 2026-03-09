export type OutdoorSearch = {
  brand?: string;        // "Arc'teryx,Patagonia"
  activity?: string;     // "Hiking,Backpacking"
  waterproof?: string;   // "GORE-TEX,H2No"
  insulation?: string;   // "Down,Synthetic,None"
  size?: string;         // "S,M,US 8"
  min?: string;
  max?: string;
  q?: string;
};

const splitCSV = (v?: string) =>
  v ? v.split(",").map(s => s.trim()).filter(Boolean) : [];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildOutdoorQuery(sp: OutdoorSearch) {
  const query: any = {
    // usamos winterCategory porque ya lo tenés indexado y es perfecto para /winter
    winterCategory: "outdoor",
  };

  // búsqueda por texto (simple)
  if (sp.q?.trim()) {
    const re = new RegExp(escapeRegExp(sp.q.trim()), "i");
    query.$or = [{ title: re }, { brand: re }, { store: re }, { "category.leaf": re }];
  }

  // brand
  const brands = splitCSV(sp.brand);
  if (brands.length) query.brand = { $in: brands };

  // price
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  if (typeof min === "number" || typeof max === "number") {
    query.priceUSD = {};
    if (!Number.isNaN(min as any)) query.priceUSD.$gte = min;
    if (!Number.isNaN(max as any)) query.priceUSD.$lte = max;
    if (Object.keys(query.priceUSD).length === 0) delete query.priceUSD;
  }

  // tags-based filters (activity/waterproof/insulation)
  const activities = splitCSV(sp.activity).map(v => `activity:${v}`);
  const waterproof = splitCSV(sp.waterproof).map(v => `waterproof:${v}`);
  const insulation = splitCSV(sp.insulation).map(v => `insulation:${v}`);

  const tagClauses: any[] = [];
  if (activities.length) tagClauses.push({ tags: { $in: activities } });
  if (waterproof.length) tagClauses.push({ tags: { $in: waterproof } });
  if (insulation.length) tagClauses.push({ tags: { $in: insulation } });

  if (tagClauses.length) query.$and = (query.$and ?? []).concat(tagClauses);

  // size desde options (Shopify-like)
  const sizes = splitCSV(sp.size);
  if (sizes.length) {
    query.options = {
      $elemMatch: {
        name: "Size",
        values: { $in: sizes },
      },
    };
  }

  return query;
}