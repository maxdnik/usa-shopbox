export type WinterSearch = {
  category?: string;
  brand?: string;
  size?: string;
  min?: string;
  max?: string;
};

function splitCSV(v?: string | null) {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildWinterQuery(sp: WinterSearch) {
  const query: any = {};
  const category = sp.category ?? "ski";

  // ------------------------------------------------
  // CATEGORY
  // ------------------------------------------------
  if (category === "ski") {
    query.winterCategory = "ski";
  } else if (category === "snowboard") {
    query.winterCategory = "snowboard";
  } else if (category === "outdoor") {
    query.winterCategory = "outdoor";

    // Excluir City Winter y City Winter Women del tab Outdoor
    query.$and = query.$and || [];
    query.$and.push({
      tags: {
        $nin: ["collection:city-winter", "collection:city-winter-women"],
      },
    });
  } else if (category === "city-winter") {
    // En DB entraron como outdoor, pero con tag collection:city-winter
    query.winterCategory = "outdoor";
    query.tags = { $in: ["collection:city-winter"] };
  } else if (category === "city-winter-women") {
    // En DB entraron como outdoor, pero con tag collection:city-winter-women
    query.winterCategory = "outdoor";
    query.tags = { $in: ["collection:city-winter-women"] };
  }

  // ------------------------------------------------
  // BRAND
  // ------------------------------------------------
  const brands = splitCSV(sp.brand);
  if (brands.length) {
    query.brand = { $in: brands };
  }

  // ------------------------------------------------
  // SIZE
  // Buscar desde options, que es donde lo estás guardando bien
  // ------------------------------------------------
  const sizes = splitCSV(sp.size);
  if (sizes.length) {
    query.$and = query.$and || [];
    query.$and.push({
      options: {
        $elemMatch: {
          name: "Size",
          values: { $in: sizes },
        },
      },
    });
  }

  // ------------------------------------------------
  // PRICE
  // ------------------------------------------------
  const min = sp.min ? Number(sp.min) : NaN;
  const max = sp.max ? Number(sp.max) : NaN;

  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    query.priceUSD = {};
    if (!Number.isNaN(min)) query.priceUSD.$gte = min;
    if (!Number.isNaN(max)) query.priceUSD.$lte = max;
  }

  return query;
}