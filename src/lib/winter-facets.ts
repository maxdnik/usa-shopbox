import { Product } from "@/lib/models/Product";

export async function getWinterFacets(query: any, _category: string) {
  const baseQuery = { ...query };

  const [brands, sizes] = await Promise.all([
    Product.aggregate([
      { $match: baseQuery },

      // evita marcas null
      { $match: { brand: { $ne: null } } },

      { $group: { _id: "$brand", count: { $sum: 1 } } },

      { $sort: { count: -1, _id: 1 } },
    ]),

    Product.aggregate([
      { $match: baseQuery },

      { $unwind: { path: "$options", preserveNullAndEmptyArrays: false } },

      { $match: { "options.name": "Size" } },

      { $unwind: { path: "$options.values", preserveNullAndEmptyArrays: false } },

      { $match: { "options.values": { $ne: null } } },

      { $group: { _id: "$options.values", count: { $sum: 1 } } },

      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    brands,
    sizes,
  };
}