import { Product } from "@/lib/models/Product";

const prefixFacet = (prefix: string) => ([
  { $unwind: "$tags" },
  { $match: { tags: { $regex: `^${prefix}:` } } },
  {
    $group: {
      _id: { $substrBytes: ["$tags", prefix.length + 1, 999] },
      count: { $sum: 1 },
    },
  },
  { $sort: { count: -1, _id: 1 } },
]);

export async function getOutdoorFacets(baseQuery: any) {
  const [res] = await Product.aggregate([
    { $match: baseQuery },
    {
      $facet: {
        brands: [
          { $group: { _id: "$brand", count: { $sum: 1 } } },
          { $match: { _id: { $ne: null } } },
          { $sort: { count: -1, _id: 1 } },
        ],

        activity: prefixFacet("activity"),
        waterproof: prefixFacet("waterproof"),
        insulation: prefixFacet("insulation"),

        sizes: [
          { $unwind: "$options" },
          { $match: { "options.name": "Size" } },
          { $unwind: "$options.values" },
          { $group: { _id: "$options.values", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ],

        price: [
          { $group: { _id: null, min: { $min: "$priceUSD" }, max: { $max: "$priceUSD" } } }
        ],
      },
    },
  ]);

  return res ?? { brands: [], activity: [], waterproof: [], insulation: [], sizes: [], price: [] };
}