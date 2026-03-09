import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import ProductCard from "@/components/products/ProductCard";

import { buildWinterQuery, type WinterSearch } from "@/lib/winter-filters";
import { getWinterFacets } from "@/lib/winter-facets";
import WinterFiltersClient from "./WinterFiltersClient";

export const dynamic = "force-dynamic";

function getCategoryLabel(category: string) {
  switch (category) {
    case "ski":
      return "Ski";
    case "snowboard":
      return "Snowboard";
    case "city-winter":
      return "City Winter";
    case "city-winter-women":
      return "City Winter Women";
    case "outdoor":
      return "Outdoor";
    default:
      return "Winter";
  }
}

export default async function WinterPage({
  searchParams,
}: {
  searchParams: Promise<WinterSearch>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "ski";

  await dbConnect();

  const query = buildWinterQuery({ ...sp, category });
  const rawProducts = await Product.find(query).sort({ priceUSD: -1 }).lean();

  const products = JSON.parse(JSON.stringify(rawProducts)).map((p: any) => ({
    ...p,
    category: p.category?.leaf || "",
  }));

  const facets = await getWinterFacets(query, category);

  const tabs = [
    { key: "ski", label: "Ski" },
    { key: "snowboard", label: "Snowboard" },
    { key: "city-winter", label: "City Winter" },
    { key: "city-winter-women", label: "City Winter Women" },
    { key: "outdoor", label: "Outdoor" },
  ];

  const categoryLabel = getCategoryLabel(category);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0A2647]">
            Winter • {categoryLabel}
          </h1>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = category === tab.key;

              return (
                <Link
                  key={tab.key}
                  href={`/winter?category=${tab.key}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    active
                      ? "bg-[#0A2647] text-white border-[#0A2647]"
                      : "bg-white text-[#0A2647] border-slate-300 hover:border-[#0A2647]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 h-fit">
            <WinterFiltersClient facets={facets} category={category} />
          </aside>

          <section>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0A2647]">
                {categoryLabel}
              </h2>
              <div className="text-sm text-gray-600">
                {products.length} productos
              </div>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-600">
                No hay productos para esta categoría con los filtros actuales.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p: any) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}