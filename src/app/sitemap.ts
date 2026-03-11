import { MetadataRoute } from "next";
import clientPromise from "@/lib/mongodb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const client = await clientPromise;
  const db = client.db();

  const products = await db
    .collection("products")
    .find({}, { projection: { slug: 1, updatedAt: 1 } })
    .toArray();

  const productUrls = products.map((product: any) => ({
    url: `https://www.usa-shopbox.com/producto/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: "https://www.usa-shopbox.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://www.usa-shopbox.com/winter",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://www.usa-shopbox.com/outdoor",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...productUrls,
  ];
}