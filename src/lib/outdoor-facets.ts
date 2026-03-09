import { Product } from "@/lib/models/Product";

export async function getOutdoorFacets(baseQuery: any) {
  const pipeline: any[] = [
    { $match: baseQuery },
    {
      $facet: {
        brands: [
          {
            $group: {
              _id: "$brand",
              count: { $sum: 1 },
            },
          },
          { $match: { _id: { $nin: [null, ""] } } },
          { $sort: { count: -1, _id: 1 } },
        ],
        stores: [
          {
            $group: {
              _id: "$store",
              count: { $sum: 1 },
            },
          },
          { $match: { _id: { $nin: [null, ""] } } },
          { $sort: { count: -1, _id: 1 } },
        ],
        categories: [
          {
            $group: {
              _id: "$category.leaf",
              count: { $sum: 1 },
            },
          },
          { $match: { _id: { $nin: [null, ""] } } },
          { $sort: { count: -1, _id: 1 } },
        ],
        tags: [
          { $unwind: "$tags" },
          { $match: { tags: { $regex: "outdoor", $options: "i" } } },
          {
            $group: {
              _id: "$tags",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ],
      },
    },
  ];

  const [res] = await Product.aggregate(pipeline);

  return {
    brands: res?.brands ?? [],
    stores: res?.stores ?? [],
    categories: res?.categories ?? [],
    tags: res?.tags ?? [],
  };
}