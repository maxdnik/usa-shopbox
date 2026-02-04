// src/app/tienda/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import HeaderEcom from "@/components/home/HeaderEcom";
import { OFFICIAL_STORES } from "@/lib/stores";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import ProductCard from "@/components/products/ProductCard";
// 🛡️ IMPORTACIÓN DEL MOTOR DE PRICING PARA EL MARKUP
import { PRICING_CONFIG } from "@/lib/pricing-engine";

export default async function StorePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>, 
  searchParams: Promise<{ category?: string }> 
}) {
  const { slug } = await params;
  const { category } = await searchParams;

  const storeDef = OFFICIAL_STORES.find(
    (s) => s.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!storeDef) return notFound();

  await dbConnect();

  // 🛠️ NORMALIZACIÓN DE CATEGORÍAS PARA EL MENÚ SUPERIOR
  const rawCategories = await Product.distinct("category", { 
    store: { $regex: new RegExp(`^${storeDef.name}$`, "i") } 
  });

  const allCategories = Array.from(new Set(rawCategories.map((cat: any) => 
    typeof cat === 'object' ? (cat.leaf || cat.main) : cat
  ))).filter(Boolean) as string[];

  const query: any = { store: { $regex: new RegExp(`^${storeDef.name}$`, "i") } };
  const currentCategory = category || "todos";
  
  if (currentCategory !== "todos") {
    // 🛠️ BÚSQUEDA HÍBRIDA: Compatible con el formato viejo y el nuevo {category.leaf}
    query.$or = [
      { category: currentCategory },
      { "category.leaf": currentCategory }
    ];
  }

  // 🔍 CONSULTA A BASE DE DATOS
  const rawProducts = await Product.find(query).sort({ priceUSD: -1 }).lean();

  /**
   * 🎯 APLICACIÓN DE MARKUP DEL ENGINE (10%)
   * Esto asegura que el ProductCard reciba el precio ya marginado de venta.
   */
  const markupFactor = 1 + PRICING_CONFIG.BASE_FEE_PERCENT;
  
  const allProductsWithMarkup = rawProducts.map((p: any) => ({
    ...p,
    // El precio sale marginado directamente desde el servidor
    priceUSD: Number((p.priceUSD * markupFactor).toFixed(2)),
    // Marginamos también todas las variaciones posibles
    variations: p.variations?.map((v: any) => ({
      ...v,
      price: Number((v.price * markupFactor).toFixed(2))
    }))
  }));

  const seenTitles = new Set();
  const storeProducts = allProductsWithMarkup.filter((p: any) => {
    const normalizedTitle = p.title.trim().toLowerCase();
    if (seenTitles.has(normalizedTitle)) return false;
    seenTitles.add(normalizedTitle);
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <HeaderEcom />
      
      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* CABECERA DINÁMICA CON LOGO */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden shadow-inner p-4">
            <Image 
              src={`/logos/${storeDef.name.toLowerCase()}.png`} 
              alt={`Logo ${storeDef.name}`}
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0A2647] tracking-tighter leading-none">
              {storeDef.name} Official Store
            </h1>
            <p className="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">
              USA (Inc. Gestión) — Precios finales garantizados.
            </p>
          </div>
        </div>

        {/* FILTROS DE CATEGORÍA (ÓVALOS) */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
          <Link
            href={`/tienda/${slug}?category=todos`}
            className={`px-6 py-2 rounded-full text-xs font-black transition-all border ${
              currentCategory === "todos"
                ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
            }`}
          >
            Todos
          </Link>
          {allCategories.map((catName: string) => (
            <Link
              key={catName}
              href={`/tienda/${slug}?category=${encodeURIComponent(catName)}`}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all border whitespace-nowrap ${
                currentCategory === catName
                  ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg"
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
              }`}
            >
              {catName}
            </Link>
          ))}
        </div>

        {/* GRILLA DE PRODUCTOS */}
        {storeProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {storeProducts.map((product: any) => (
              <ProductCard 
                key={product._id.toString()} 
                product={{
                  ...product,
                  _id: product._id.toString(),
                  category: typeof product.category === 'object' 
                    ? (product.category.leaf || product.category.main) 
                    : (product.category || "General")
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">
              No se encontraron productos en esta categoría.
            </p>
          </div>
        )}
      </main>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="mt-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="bg-[#0A2647] text-white font-black rounded px-2 py-1 text-[10px]">USA</div>
             <span className="text-xs font-black text-[#0A2647] uppercase tracking-tighter">USAShopBox Logistics</span>
          </div>
          <div className="flex gap-10">
             <Link href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors">Ayuda</Link>
             <Link href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors">Términos</Link>
             <Link href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors">Privacidad</Link>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            © {new Date().getFullYear()} USAShopBox. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}