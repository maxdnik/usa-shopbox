import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import * as cheerio from "cheerio";

import HeaderEcom from "@/components/home/HeaderEcom";
import Footer from "@/components/home/Footer"; // ✅ Footer Importado

import { mockProducts } from "@/lib/products";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import ProductView from "@/components/products/ProductView";

import { fetchEbayItemDetail } from "@/lib/ebay";
import type { ProductVariation, VariationMatrixEntry } from "@/lib/ebay";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ViewProduct = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  store: string;
  category: any;
  priceUSD: number;
  estimatedUSD: number;
  images: string[];
  sourceUrl?: string | null;
  variations?: ProductVariation[];
  variationMatrix?: VariationMatrixEntry[];
  specs?: Record<string, string>;
};

// 🛠️ SEO
export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;

  await dbConnect();
  const dbProd = await Product.findOne({ slug }).lean();

  let product: any = null;

  if (dbProd) {
    product = JSON.parse(JSON.stringify(dbProd));
  } else {
    const mock = mockProducts.find(
      (p) => p.slug?.toLowerCase() === slug.toLowerCase()
    );
    if (mock) {
      product = JSON.parse(JSON.stringify(mock));
    } else if (getFirstParam(sp.src) === "ebay") {
      product = {
        title: getFirstParam(sp.title) || slug,
        store: "eBay",
        priceUSD: Number(getFirstParam(sp.price)?.replace(",", ".")) || 0,
        images: getFirstParam(sp.image) ? [getFirstParam(sp.image)!] : [],
      };
    }
  }

  if (!product) return { title: "Producto no encontrado | USAShopBox" };

  const title = `Comprar ${product.title} en USA | USAShopBox`;
  const description = `Compra ${product.title} en USA y recíbelo en Argentina.`;
  const imageUrl = product.images?.[0] || product.image || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

function getFirstParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function buildDbVariations(dbProduct: any): {
  variations: ProductVariation[];
  variationMatrix: VariationMatrixEntry[];
} {
  const variations: ProductVariation[] = [];
  const variationMatrix: VariationMatrixEntry[] = [];
  const dbVars = Array.isArray(dbProduct?.variations)
    ? dbProduct.variations
    : [];

  if (dbVars.length > 0) {
    for (const v of dbVars) {
      const attribute = String(v?.attribute || "").trim();
      const value = String(v?.value || "").trim();
      if (!attribute || !value) continue;

      variations.push({
        attribute,
        value,
        sku: v?.sku ? String(v.sku) : undefined,
        price: typeof v?.price === "number" ? v.price : undefined,
        available: typeof v?.stock === "number" ? v.stock > 0 : true,
      });
    }
    return { variations, variationMatrix };
  }
  return { variations, variationMatrix };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  let product: ViewProduct | null = null;

  // 1) MongoDB
  await dbConnect();
  const dbProd = await Product.findOne({ slug }).lean();

  if (dbProd) {
    const plainProduct = JSON.parse(JSON.stringify(dbProd));
    const { variations, variationMatrix } = buildDbVariations(plainProduct);
    product = {
      ...plainProduct,
      id: plainProduct._id,
      category: plainProduct.category,
      images: plainProduct.images || [],
      specs: plainProduct.specs || {},
      variations,
      variationMatrix,
    };
  } else {
    // 2) Mock Local
    const mock = mockProducts.find(
      (p) => p.slug?.toLowerCase() === slug.toLowerCase()
    );
    if (mock) {
      const plainMock = JSON.parse(JSON.stringify(mock));
      product = {
        ...plainMock,
        id: plainMock.id,
        images: Array.from(
          new Set(
            [
              plainMock.image,
              ...(Array.isArray(plainMock.images) ? plainMock.images : []),
            ].filter(Boolean)
          )
        ),
        sourceUrl: plainMock.sourceUrl ?? null,
      } as any;
    } else {
      // 3) eBay Scraping
      const src = getFirstParam(sp.src);
      if (src === "ebay") {
        const title = getFirstParam(sp.title) || slug;
        const priceStr = getFirstParam(sp.price) || "0";
        const priceNumber = Number(priceStr.replace(",", ".")) || 0;
        const targetUrl = getFirstParam(sp.url);
        
        // Scraping Básico
        let description = "Descripción oficial.";
        let specs: Record<string, string> = {};
        let variations: ProductVariation[] = [];
        let variationMatrix: VariationMatrixEntry[] = [];
        let detailImages: string[] = [];
        let detailPrice: number | undefined;

        if (targetUrl) {
          try {
            const scrapedData = await scrapeEbayData(targetUrl);
            if (scrapedData.description.length > 20) description = scrapedData.description;
            if (scrapedData.specs) specs = scrapedData.specs;
          } catch (e) { console.error(e); }
        }

        try {
          const detailData = await fetchEbayItemDetail(targetUrl || slug);
          variations = detailData.variations;
          variationMatrix = detailData.variationMatrix;
          detailImages = detailData.images;
          detailPrice = detailData.priceUSD;
        } catch (e) { console.error(e); }

        const baseImages = getFirstParam(sp.image) ? [getFirstParam(sp.image)!] : [];
        const images = Array.from(new Set([...baseImages, ...detailImages])).filter(Boolean);
        const resolvedPrice = priceNumber > 0 ? priceNumber : detailPrice || 0;

        product = {
          id: slug,
          slug,
          title,
          description,
          specs,
          store: "eBay",
          category: "Producto",
          priceUSD: resolvedPrice,
          estimatedUSD: resolvedPrice > 0 ? Number((resolvedPrice * 1.35).toFixed(2)) : 0,
          images,
          sourceUrl: targetUrl || null,
          variations,
          variationMatrix,
        };
      }
    }
  }

  if (!product) return notFound();

  // ✅ LOGICA ROBUSTA PARA PRODUCTOS RELACIONADOS
  // 1. Intenta filtrar por categoría exacta
  let relatedItems = mockProducts.filter(
    (p) =>
      p.id !== product!.id &&
      ((typeof p.category === "object"
        ? p.category.main === product!.category?.main
        : p.category === product!.category) ||
        p.store.toLowerCase() === product!.store.toLowerCase())
  );

  // 2. Si hay pocos (< 4), rellena con cualquier otro producto (Popular fallback)
  if (relatedItems.length < 4) {
    const filler = mockProducts.filter(
      (p) => p.id !== product!.id && !relatedItems.find((r) => r.id === p.id)
    );
    relatedItems = [...relatedItems, ...filler];
  }

  // 3. Cortar a 4 items
  const relatedProducts = JSON.parse(JSON.stringify(relatedItems.slice(0, 4)));

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <HeaderEcom />

      <main className="flex-1 pb-12">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          {/* Breadcrumbs simplificado */}
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-[#0A2647]">Inicio</Link>
            <span>/</span>
            <span className="text-[#0A2647] line-clamp-1">{product.title}</span>
          </nav>
        </div>

        <ProductView product={product} />

        {/* ✅ FICHA TÉCNICA */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="mt-8 max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-[#0A2647] mb-6 uppercase tracking-tight">
                Especificaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{key}</span>
                    <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ✅ SECCIÓN PRODUCTOS RELACIONADOS MEJORADA */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 mb-8">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0A2647] tracking-tight">
                  Productos Relacionados
                </h2>
                <Link href="/buscar" className="text-sm font-semibold text-[#D72638] hover:underline">
                  Ver más
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rp: any) => (
                  <Link
                    key={rp.id}
                    href={`/producto/${rp.slug}`}
                    className="group bg-white rounded-2xl border border-slate-100 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
                  >
                    {/* Imagen */}
                    <div className="relative w-full aspect-square mb-4 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      {rp.image ? (
                        <Image
                          src={rp.image}
                          alt={rp.title}
                          width={200}
                          height={200}
                          className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Sin imagen</span>
                      )}
                      
                      {/* Badge Tienda */}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-[#0A2647] border border-slate-100 shadow-sm">
                        {rp.store}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1">
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-[#D72638] transition-colors">
                        {rp.title}
                      </h3>
                      
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-bold text-slate-400">USA</span>
                          <span className="text-lg font-bold text-slate-900">
                            USD {rp.priceUSD}
                          </span>
                        </div>
                        {rp.estimatedUSD && (
                          <div className="text-[11px] font-medium text-emerald-600">
                            Est. Arg: USD {rp.estimatedUSD}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ⬇️ SCRAPING HELPER
async function scrapeEbayData(url: string) {
  const result = { description: "", specs: {} as Record<string, string> };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return result;
    const html = await res.text();
    const $ = cheerio.load(html);

    $(".ux-layout-section--itemSpecifics .ux-labels-values").each((_, el) => {
      const k = $(el).find(".ux-labels-values__labels").text().trim().replace(":", "");
      const v = $(el).find(".ux-labels-values__values").text().trim();
      if (k && v) result.specs[k] = v;
    });

    const iframeSrc = $("iframe#desc_ifr").attr("src");
    if (iframeSrc) {
      const descRes = await fetch(iframeSrc);
      if (descRes.ok) {
        const dHtml = await descRes.text();
        const $d = cheerio.load(dHtml);
        $d("script, style, link").remove();
        $d("br").replaceWith("\n");
        $d("p, div").after("\n");
        result.description = ($d("#ds_div").text() || $d("body").text()).trim().slice(0, 500) + "...";
      }
    }
    return result;
  } catch { return result; }
}