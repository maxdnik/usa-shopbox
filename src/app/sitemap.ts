import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const products = await Product.find({}, { slug: 1, updatedAt: 1, _id: 0 }).lean();

  const productUrls: MetadataRoute.Sitemap = products
    .filter((product: any) => product?.slug)
    .map((product: any) => ({
      url: `https://www.usa-shopbox.com/producto/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly",
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
    {
      url: "https://www.usa-shopbox.com/terminos",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://www.usa-shopbox.com/privacidad",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://www.usa-shopbox.com/reembolsos",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://www.usa-shopbox.com/ayuda",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productUrls,
  ];
}