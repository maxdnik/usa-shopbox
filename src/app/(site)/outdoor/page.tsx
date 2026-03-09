import HeaderEcom from "@/components/home/HeaderEcom";
import Footer from "@/components/home/Footer";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import ProductCard from "@/components/products/ProductCard";

import OutdoorFiltersClient from "./OutdoorFiltersClient";
import { buildOutdoorQuery, type OutdoorSearch } from "@/lib/outdoor-filters";
import { getOutdoorFacets } from "@/lib/outdoor-facets";

export const dynamic = "force-dynamic";

export default async function OutdoorPage({
  searchParams,
}: {
  searchParams: Promise<OutdoorSearch>;
}) {
  const sp = await searchParams;

  await dbConnect();

  const query = buildOutdoorQuery(sp);

  const raw = await Product.find(query).sort({ priceUSD: -1 }).lean();
  const products = JSON.parse(JSON.stringify(raw));

  const facets = await getOutdoorFacets(query);

  return (
    <div className="min-h-screen bg-white">
      <HeaderEcom />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 h-fit">
          <OutdoorFiltersClient facets={facets} />
        </aside>

        <section>
          <div className="flex items-end justify-between mb-4">
            <h1 className="text-2xl font-semibold text-[#0A2647]">Outdoor Gear</h1>
            <div className="text-sm text-gray-600">{products.length} productos</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}