import { notFound } from "next/navigation";
import Link from "next/link";
import { OFFICIAL_STORES } from "@/lib/stores";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import ProductCard from "@/components/products/ProductCard";
import { PRICING_CONFIG } from "@/lib/pricing-engine";

export const dynamic = "force-dynamic";

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await params;
  const { category } = await searchParams;

  const storeDef = OFFICIAL_STORES.find(
    (s) => s.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!storeDef) return notFound();

  await dbConnect();

  const rawCategories = await Product.distinct("category", {
    store: { $regex: new RegExp(`^${storeDef.name}$`, "i") },
  });

  const allCategories = Array.from(
    new Set(
      rawCategories.map((cat: any) =>
        typeof cat === "object" ? cat.leaf || cat.main : cat
      )
    )
  ).filter(Boolean) as string[];

  const query: any = {
    store: { $regex: new RegExp(`^${storeDef.name}$`, "i") },
  };

  const currentCategory = category || "todos";

  if (currentCategory !== "todos") {
    query.$or = [
      { category: currentCategory },
      { "category.leaf": currentCategory },
    ];
  }

  const rawProductsLean = await Product.find(query)
    .sort({ priceUSD: -1 })
    .lean();

  const cleanProducts = JSON.parse(JSON.stringify(rawProductsLean));

  const markupFactor = 1 + PRICING_CONFIG.BASE_FEE_PERCENT;

  const storeProducts = cleanProducts.map((p: any) => ({
    ...p,
    priceUSD: Number((p.priceUSD * markupFactor).toFixed(2)),
    category:
      typeof p.category === "object"
        ? p.category.leaf || p.category.main
        : p.category || "General",
    variations:
      p.variations?.map((v: any) => ({
        ...v,
        price: Number((v.price * markupFactor).toFixed(2)),
      })) || [],
    image:
      p.image ||
      p.imageUrl ||
      "https://placehold.co/600x400?text=No+Image",
  }));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-8 pb-16">
        {/* CABECERA */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 bg-white rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden p-4">
            {storeDef.logo.startsWith("http") ||
            storeDef.logo.startsWith("/") ? (
              <img
                src={storeDef.logo}
                alt={`Logo ${storeDef.name}`}
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="text-xs font-bold">
                {storeDef.name}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-black text-[#0A2647] tracking-tighter leading-none mb-2">
              {storeDef.name}
            </h1>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#0A2647] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Tienda Oficial
                </span>
              </div>

              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                USA
              </p>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
          <Link
            href={`/tienda/${slug}?category=todos`}
            className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all border ${
              currentCategory === "todos"
                ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg shadow-[#0A2647]/20"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-[#0A2647]"
            }`}
          >
            Todos
          </Link>

          {allCategories.map((catName: string) => (
            <Link
              key={catName}
              href={`/tienda/${slug}?category=${encodeURIComponent(
                catName
              )}`}
              className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all border whitespace-nowrap ${
                currentCategory === catName
                  ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg shadow-[#0A2647]/20"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-[#0A2647]"
              }`}
            >
              {catName}
            </Link>
          ))}
        </div>

        {/* GRILLA */}
        {storeProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {storeProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[32px] border border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-bold text-[#0A2647] mb-1">
              Sin resultados
            </h3>
            <p className="text-slate-400 font-medium text-sm">
              No se encontraron productos en esta categoría.
            </p>
            <Link
              href={`/tienda/${slug}`}
              className="inline-block mt-6 text-[#D72638] font-bold text-sm hover:underline"
            >
              Ver todos los productos de {storeDef.name}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}