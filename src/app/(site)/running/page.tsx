import Link from "next/link";

import HeaderEcom from "@/components/home/HeaderEcom";
import Footer from "@/components/home/Footer";

import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import ProductCard from "@/components/products/ProductCard";
import { PRICING_CONFIG } from "@/lib/pricing-engine";

export const dynamic = "force-dynamic";

export default async function RunningPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  await dbConnect();

  // ✅ Definición “Running” (compatible con tu esquema)
  const RUNNING_OR: any[] = [
    { "category.sub": { $regex: /running/i } },
    { "category.main": { $regex: /running/i } },
    {
      "category.leaf": {
        $in: [
          "Smartwatches",
          "Zapatillas",
          "Geles",
          "Sensores Fitness",
          "Hidratación",
          "Auriculares",
          "Seguridad",
          "Indumentaria de Running",
        ],
      },
    },
    { category: { $regex: /running/i } },
    {
      category: {
        $in: [
          "Smartwatches",
          "Zapatillas",
          "Geles",
          "Sensores Fitness",
          "Hidratación",
          "Auriculares",
          "Seguridad",
          "Indumentaria de Running",
        ],
      },
    },
    { tags: { $in: ["running", "run"] } },
    { sourceCollections: { $in: ["running", "run"] } },
  ];

  // ✅ Categorías (chips)
  const rawCategories = await Product.distinct("category", { $or: RUNNING_OR });

  const allCategories = Array.from(
    new Set(
      rawCategories
        .map((cat: any) => (typeof cat === "object" ? cat.leaf || cat.sub || cat.main : cat))
        .filter(Boolean)
        .map((x: any) => String(x))
    )
  );

  const CATEGORY_ORDER = [
    "Zapatillas",
    "Smartwatches",
    "Auriculares",
    "Sensores Fitness",
    "Hidratación",
    "Geles",
    "Seguridad",
    "Indumentaria de Running",
  ];
  allCategories.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  // ✅ Query principal
  const currentCategory = category || "todos";
  const query: any = { $or: RUNNING_OR };

  if (currentCategory !== "todos") {
    query.$and = [
      {
        $or: [
          { category: currentCategory },
          { "category.leaf": currentCategory },
          { "category.sub": currentCategory },
          { "category.main": currentCategory },
        ],
      },
    ];
  }

  // 🚫 BLOQUEO lifestyle (Converse / Vans / NB 574 / AF1 / adidas Forum)
  query.$and = query.$and || [];
  query.$and.push({
    $nor: [
      { title: /converse|chuck\s*taylor/i },
      { title: /vans|old\s*skool/i },
      { title: /new\s*balance\s*574/i },
      { title: /air\s*force\s*1|\baf1\b/i },
      { title: /adidas.*forum|forum\s*low/i },
      {
        name: /converse|chuck\s*taylor|vans|old\s*skool|new\s*balance\s*574|air\s*force\s*1|\baf1\b|forum/i,
      },
      { slug: /converse|chuck|vans|old-skool|new-balance-574|air-force|af1|forum/i },
    ],
  });

  // 1) Productos
  const rawProductsLean = await Product.find(query).sort({ priceUSD: -1 }).lean();
  const cleanProducts = JSON.parse(JSON.stringify(rawProductsLean));

  const markupFactor = 1 + PRICING_CONFIG.BASE_FEE_PERCENT;

  // 2) Markup + normalización visual
  const runningProducts = cleanProducts.map((p: any) => {
    const normalizedCategory =
      typeof p.category === "object"
        ? p.category.leaf || p.category.sub || p.category.main
        : p.category || "General";

    const imageFallback =
      p.image ||
      p.imageUrl ||
      (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null) ||
      "https://placehold.co/600x400?text=No+Image";

    const price = typeof p.priceUSD === "number" ? p.priceUSD : null;

    return {
      ...p,
      priceUSD: price != null ? Number((price * markupFactor).toFixed(2)) : p.priceUSD,
      category: normalizedCategory,
      variations:
        p.variations?.map((v: any) => ({
          ...v,
          price: typeof v.price === "number" ? Number((v.price * markupFactor).toFixed(2)) : v.price,
        })) || [],
      image: imageFallback,
    };
  });

  /**
   * ✅ HERO: imagen del corredor de fondo (sútil, premium)
   * - Poné tu imagen acá:
   *   1) Guardala en: /public/images/running-hero.jpg
   *   2) O usá una URL https
   */
  const HERO_BG_URL = "/images/run.jpg";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <HeaderEcom />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-8 pb-16">
        {/* ✅ HERO PREMIUM (fondo sutil con blur + overlay) */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm mb-10">
          {/* Fondo con imagen */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 opacity-35"
            style={{ backgroundImage: `url('${HERO_BG_URL}')` }}
          />

          {/* Overlay premium: degradado + blur para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/75 to-white/92 backdrop-blur-sm" />

          {/* Borde de luz sutil */}
          <div className="absolute inset-0 ring-1 ring-white/40" />

          {/* Contenido */}
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/80 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                <span className="text-3xl">🏃</span>
              </div>

              <div>
                <h1 className="text-4xl font-black text-[#0A2647] tracking-tighter leading-none mb-2">
                  Running
                </h1>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0A2647] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Colección
                    </span>
                    <span className="bg-[#D72638] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      USA
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                    {runningProducts.length} productos
                  </p>
                </div>
              </div>
            </div>

            {/* FILTROS */}
            <div className="mt-10 flex gap-3 overflow-x-auto pb-3 no-scrollbar">
              <Link
                href={`/running?category=todos`}
                className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all border ${
                  currentCategory === "todos"
                    ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg shadow-[#0A2647]/20"
                    : "bg-white/80 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-[#0A2647]"
                }`}
              >
                Todos
              </Link>

              {allCategories.map((catName: string) => (
                <Link
                  key={catName}
                  href={`/running?category=${encodeURIComponent(catName)}`}
                  className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all border whitespace-nowrap ${
                    currentCategory === catName
                      ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg shadow-[#0A2647]/20"
                      : "bg-white/80 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-[#0A2647]"
                  }`}
                >
                  {catName}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* GRILLA */}
        {runningProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {runningProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[32px] border border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-bold text-[#0A2647] mb-1">Sin resultados</h3>
            <p className="text-slate-400 font-medium text-sm">
              No se encontraron productos en esta categoría por el momento.
            </p>
            <Link
              href={`/running`}
              className="inline-block mt-6 text-[#D72638] font-bold text-sm hover:underline"
            >
              Ver todos los productos de Running
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}