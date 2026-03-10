import type { FilterQuery } from "mongoose";

export type WinterSearch = {
  category?: string;
  brand?: string;
  size?: string;
  min?: string;
  max?: string;
};

function splitCSV(v?: string | null): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildWinterQuery(sp: WinterSearch): FilterQuery<any> {
  const category = String(sp.category ?? "ski").toLowerCase().trim();

  const brands = splitCSV(sp.brand);
  const sizes = splitCSV(sp.size);

  const conditions: FilterQuery<any>[] = [];

  if (category === "ski") {
    conditions.push({
      $or: [
        { winterCategory: "ski" },
        { tags: "snow:goggles" }
      ],
    });
  }

  else if (category === "snowboard") {
    conditions.push({
      $or: [
        { winterCategory: "snowboard" },
        { tags: "snow:goggles" }
      ],
    });
  }

  else if (category === "city-winter") {
    conditions.push({
      tags: "collection:city-winter",
    });
  }

  else if (category === "city-winter-women") {
    conditions.push({
      tags: "collection:city-winter-women",
    });
  }

  else if (category === "outdoor") {
    conditions.push({
      winterCategory: "outdoor",
    });
  }

  if (brands.length) {
    conditions.push({
      brand: { $in: brands },
    });
  }

  if (sizes.length) {
    conditions.push({
      "options.values": { $in: sizes },
    });
  }

  const min = Number(sp.min);
  const max = Number(sp.max);

  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    const price: any = {};

    if (!Number.isNaN(min)) price.$gte = min;
    if (!Number.isNaN(max)) price.$lte = max;

    conditions.push({ priceUSD: price });
  }

  if (!conditions.length) return {};

  if (conditions.length === 1) return conditions[0];

  return { $and: conditions };
}