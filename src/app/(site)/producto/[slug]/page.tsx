import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import * as cheerio from "cheerio";

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
    const mock = mockProducts.find((p) => p.slug?.toLowerCase() === slug.toLowerCase());
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

  const title = `Comprar ${product.title} en USA - Envío a Argentina | USAShopBox`;
  const description = `Adquiere tu ${product.title} directamente desde ${
    product.store || "tiendas oficiales"
  }. Calidad garantizada y entrega segura a través de USAShopBox.`;
  const imageUrl = product.images?.[0] || product.image || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

function getFirstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

// ✅ HELPER ÚNICO: soporta Mongo "variations" (legacy) y Shopify/Filson "options + shopifyVariants"
function buildDbVariations(dbProduct: any): {
  variations: ProductVariation[];
  variationMatrix: VariationMatrixEntry[];
} {
  const variations: ProductVariation[] = [];
  const variationMatrix: VariationMatrixEntry[] = [];

  // 1) LEGACY: dbProduct.variations
  const dbVars = Array.isArray(dbProduct?.variations) ? dbProduct.variations : [];

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

  // 2) SHOPIFY: options + shopifyVariants
  const opts = Array.isArray(dbProduct?.options) ? dbProduct.options : [];
  const shopifyVars = Array.isArray(dbProduct?.shopifyVariants) ? dbProduct.shopifyVariants : [];

  if (opts.length > 0 && shopifyVars.length > 0) {
    // A) Variations (plano)
    for (let i = 0; i < opts.length; i++) {
      const optName = String(opts[i]?.name || "").trim();
      const values: string[] = Array.isArray(opts[i]?.values) ? opts[i].values : [];
      if (!optName || values.length === 0) continue;

      for (const val of values) {
        const v = String(val || "").trim();
        if (!v) continue;

        const isAvailable = shopifyVars.some((sv: any) => {
          const svVal =
            i === 0 ? sv?.option1 : i === 1 ? sv?.option2 : i === 2 ? sv?.option3 : undefined;

          return String(svVal || "").trim() === v && sv?.available !== false;
        });

        variations.push({
          attribute: optName,
          value: v,
          available: isAvailable,
        });
      }
    }

    // B) Matrix
    for (const sv of shopifyVars) {
      const selections: Record<string, string> = {};

      if (opts[0]?.name) selections[String(opts[0].name)] = String(sv?.option1 || "").trim();
      if (opts[1]?.name) selections[String(opts[1].name)] = String(sv?.option2 || "").trim();
      if (opts[2]?.name) selections[String(opts[2].name)] = String(sv?.option3 || "").trim();

      variationMatrix.push({
        selections,
        sku: sv?.sku ? String(sv.sku) : undefined,
        price: typeof sv?.priceUSD === "number" ? sv.priceUSD : undefined,
        available: sv?.available !== false,
        sourceVariantId: sv?.sourceVariantId ? String(sv.sourceVariantId) : undefined,
      } as any);
    }

    return { variations, variationMatrix };
  }

  return { variations, variationMatrix };
}

// ✅ limpiar descripción para que NO muestre campos internos
function sanitizeDescription(desc?: string): string | undefined {
  if (!desc) return desc;

  const HIDDEN = new Set(["setNumber", "sku", "sourceUrl", "currency"]);
  const lines = String(desc).split(/\r?\n/);

  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const t = raw.trim();
    if (!t) continue;

    const lower = t.toLowerCase();

    const m = lower.match(/^([a-z0-9_]+)\s*:\s*(.+)$/i);
    if (m) {
      const key = String(m[1] || "").trim();
      if (HIDDEN.has(key)) continue;
      out.push(raw);
      continue;
    }

    if (HIDDEN.has(lower)) {
      const next = (lines[i + 1] ?? "").trim();
      if (next) i += 1;
      continue;
    }

    if (t.startsWith("http") && t.includes("lego.com") && t.includes("/product/")) continue;

    out.push(raw);
  }

  const cleaned = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return cleaned || undefined;
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
    // 2) Mock
    const mock = mockProducts.find((p) => p.slug?.toLowerCase() === slug.toLowerCase());
    if (mock) {
      const plainMock = JSON.parse(JSON.stringify(mock));
      product = {
        ...plainMock,
        id: plainMock.id,
        images: Array.from(
          new Set([plainMock.image, ...(Array.isArray(plainMock.images) ? plainMock.images : [])].filter(Boolean))
        ),
        sourceUrl: plainMock.sourceUrl ?? null,
      } as any;
    } else {
      // 3) eBay
      const src = getFirstParam(sp.src);
      if (src === "ebay") {
        const title = getFirstParam(sp.title) || slug;
        const priceStr = getFirstParam(sp.price) || "0";
        const priceNumber = Number(priceStr.replace(",", ".")) || 0;
        const targetUrl = getFirstParam(sp.url);
        const ebayItemId = slug;

        let description = "Descripción disponible en la tienda oficial.";
        let specs: Record<string, string> = {};

        let variations: ProductVariation[] = [];
        let variationMatrix: VariationMatrixEntry[] = [];
        let detailImages: string[] = [];
        let detailPrice: number | undefined;

        if (targetUrl) {
          try {
            const scrapedData = await scrapeEbayData(targetUrl);
            if (scrapedData.description && scrapedData.description.length > 20) description = scrapedData.description;
            if (scrapedData.specs) specs = scrapedData.specs;
          } catch (error) {
            console.error("Error scraping ebay data:", error);
          }
        }

        try {
          const detailData = await fetchEbayItemDetail(targetUrl || ebayItemId);
          variations = detailData.variations;
          variationMatrix = detailData.variationMatrix;
          detailImages = detailData.images;
          detailPrice = detailData.priceUSD;
        } catch (error) {
          console.error("Error fetching ebay detail data:", error);
        }

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

  const sanitizedDescription = sanitizeDescription(product.description);

  const HIDDEN_SPECS = new Set(["setNumber", "sku", "sourceUrl", "currency"]);
  const filteredSpecs =
    product.specs && Object.keys(product.specs).length > 0
      ? Object.fromEntries(
          Object.entries(product.specs).filter(([k, v]) => {
            if (!v) return false;
            if (HIDDEN_SPECS.has(k)) return false;
            if (k.startsWith("_")) return false;
            return true;
          })
        )
      : {};

  product = {
    ...product,
    description: sanitizedDescription,
    specs: filteredSpecs,
  };

  // -----------------------------------------------------------------------------
  // RELACIONADOS (DB + MOCK)
  // -----------------------------------------------------------------------------
  let relatedItems: any[] = [];

  const categoryToSearch =
    typeof product.category === "object" ? product.category.leaf : product.category;

  try {
    const dbRelated = await Product.find({
      $and: [
        { _id: { $ne: product.id } },
        {
          $or: [
            { "category.leaf": categoryToSearch },
            { category: categoryToSearch },
            {
              "category.main":
                typeof product.category === "object" ? product.category.main : categoryToSearch,
            },
          ],
        },
      ],
    })
      .limit(4)
      .lean();

    if (dbRelated?.length) relatedItems = JSON.parse(JSON.stringify(dbRelated));
  } catch (err) {
    console.error("Error buscando relacionados en DB:", err);
  }

  if (relatedItems.length < 4) {
    const mockRelated = mockProducts.filter(
      (p) =>
        p.id !== product!.id &&
        ((typeof p.category === "object"
          ? p.category.main === (typeof product!.category === "object" ? product!.category.main : product!.category)
          : p.category === categoryToSearch) ||
          p.store.toLowerCase() === product!.store.toLowerCase())
    );

    const currentIds = new Set(relatedItems.map((rp) => rp.id || rp._id));
    const uniqueMocks = mockRelated.filter((mp) => !currentIds.has(mp.id));

    relatedItems = [...relatedItems, ...uniqueMocks].slice(0, 4);
  }

  const relatedProducts = relatedItems;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <main className="flex-1 pb-12">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <nav className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <Link href="/" className="hover:text-[#0A2647] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            {typeof product.category === "object" ? (
              <>
                <Link href={`/buscar?query=${product.category.main}`} className="hover:text-[#0A2647]">
                  {product.category.main}
                </Link>
                <span>/</span>
                <Link href={`/buscar?query=${product.category.sub}`} className="hover:text-[#0A2647]">
                  {product.category.sub}
                </Link>
                <span className="text-red-600">/</span>
                <span className="text-[#0A2647]">{product.category.leaf}</span>
              </>
            ) : (
              <span className="text-[#0A2647]">{product.category}</span>
            )}
          </nav>
        </div>

        <ProductView product={product} />

        {relatedProducts.length > 0 && (
          <section className="mt-16 mb-8">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-[#0A2647] uppercase tracking-tight">
                  Productos Similares
                </h2>
                <Link href="/buscar" className="text-xs font-bold text-[#D72638] uppercase hover:underline">
                  Ver más
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rp: any) => {
                  const rpSlug = rp.slug || rp._id;
                  const rpImage = rp.images?.[0] || rp.image;

                  return (
                    <Link
                      key={rp.id || rp._id}
                      href={`/producto/${rpSlug}`}
                      className="group bg-white rounded-2xl border border-slate-100 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full"
                    >
                      <div className="relative w-full aspect-square mb-4 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-4">
                        {rpImage ? (
                          <Image
                            src={rpImage}
                            alt={rp.title}
                            width={200}
                            height={200}
                            className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Sin imagen</span>
                        )}

                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-[#0A2647] border border-slate-100 shadow-sm">
                          {rp.store || "Tienda"}
                        </div>
                      </div>

                      <div className="flex flex-col flex-1">
                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-[#D72638] transition-colors">
                          {rp.title}
                        </h3>

                        <div className="mt-auto pt-2 border-t border-slate-50">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Precio USA
                            </span>
                            <span className="text-base font-bold text-slate-900">USD {rp.priceUSD}</span>
                          </div>

                          {rp.estimatedUSD && (
                            <div className="flex items-baseline justify-between mt-0.5">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                Est. Arg
                              </span>
                              <span className="text-xs font-bold text-emerald-700">
                                USD {rp.estimatedUSD}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ⬇️ HELPER: Scraping COMPLETO (Descripción + Especificaciones)
async function scrapeEbayData(
  url: string
): Promise<{ description: string; specs: Record<string, string> }> {
  const result = { description: "", specs: {} as Record<string, string> };

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/120 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return result;
    const html = await res.text();
    const $ = cheerio.load(html);

    $(".ux-layout-section--itemSpecifics .ux-labels-values").each((_, element) => {
      const key = $(element).find(".ux-labels-values__labels").text().trim().replace(":", "");
      const value = $(element).find(".ux-labels-values__values").text().trim();
      if (key && value) result.specs[key] = value;
    });

    if (Object.keys(result.specs).length === 0) {
      $(".item-specifications dl").each((_, element) => {
        const dt = $(element).find("dt").text().trim().replace(":", "");
        const dd = $(element).find("dd").text().trim();
        if (dt && dd) result.specs[dt] = dd;
      });
    }

    const iframeSrc = $("iframe#desc_ifr").attr("src");

    if (iframeSrc) {
      const descRes = await fetch(iframeSrc);
      if (descRes.ok) {
        const rawHtml = await descRes.text();
        const $desc = cheerio.load(rawHtml);

        $desc("script").remove();
        $desc("style").remove();
        $desc("link").remove();
        $desc("br").replaceWith("\n");
        $desc("p, div, li, h1, h2, h3, h4").after("\n");

        const textContent =
          $desc("#ds_div").length > 0 ? $desc("#ds_div").text() : $desc("body").text();

        const lines = textContent.split("\n");

        const stopWords = [
          "policy","política","return","devolución","shipping","envío","shipment","contact us","contactar",
          "feedback","rating","thank you","gracias","check out","payment","pago","paypal","credit card",
          "refund","reembolso","tax","impuesto","po box","apo","fpo","hawaii","alaska","puerto rico",
          "business hours","horario","restocking","tracking","copyright","price","precio","msrp","retail",
          "cost","costo","value","valor","usd","dollars","bid","oferta","subasta",
        ];

        const seenLines = new Set<string>();

        const cleanLines = lines.filter((line) => {
          const trimmed = line.trim();
          const lowerLine = trimmed.toLowerCase();
          if (trimmed.length < 3) return false;
          if (line.includes("$")) return false;
          if (stopWords.some((word) => lowerLine.includes(word))) return false;
          if (seenLines.has(trimmed)) return false;
          seenLines.add(trimmed);
          return true;
        });

        result.description = cleanLines.join("\n").replace(/\n+/g, "\n").trim();
      }
    } else {
      result.description = $("meta[property='og:description']").attr("content") || "";
    }

    return result;
  } catch {
    return result;
  }
}