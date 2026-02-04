import { Metadata } from "next"; 
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import * as cheerio from "cheerio";

import HeaderEcom from "@/components/home/HeaderEcom";
import { mockProducts } from "@/lib/products";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import ProductView from "@/components/products/ProductView"; 

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
  variations?: any[];
  specs?: Record<string, string>; // ✅ Aquí guardaremos los atributos (Marca, Talle, etc)
};

// 🛠️ SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
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
        images: getFirstParam(sp.image) ? [getFirstParam(sp.image)!] : []
      };
    }
  }

  if (!product) return { title: "Producto no encontrado | USAShopBox" };

  const title = `Comprar ${product.title} en USA - Envío a Argentina | USAShopBox`;
  const description = `Adquiere tu ${product.title} directamente desde ${product.store || 'tiendas oficiales'}. Calidad garantizada y entrega segura a través de USAShopBox.`;
  const imageUrl = product.images?.[0] || product.image || "";

  return {
    title,
    description,
    openGraph: { title, description, images: imageUrl ? [{ url: imageUrl }] : [], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: imageUrl ? [imageUrl] : [] },
  };
}

function getFirstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  let product: ViewProduct | null = null;

  // 1) PRIORIDAD: Buscar en MongoDB
  await dbConnect();
  const dbProd = await Product.findOne({ slug }).lean();

  if (dbProd) {
    const plainProduct = JSON.parse(JSON.stringify(dbProd));
    product = {
      ...plainProduct,
      id: plainProduct._id,
      category: plainProduct.category,
      images: plainProduct.images || [], 
      specs: plainProduct.specs || {},
    };
  } else {
    // 2) FALLBACK: Mock Local
    const mock = mockProducts.find((p) => p.slug?.toLowerCase() === slug.toLowerCase());
    if (mock) {
      const plainMock = JSON.parse(JSON.stringify(mock));
      product = {
        ...plainMock,
        id: plainMock.id,
        images: Array.from(new Set([plainMock.image, ...(Array.isArray(plainMock.images) ? plainMock.images : [])].filter(Boolean))),
        sourceUrl: plainMock.sourceUrl ?? null,
      } as any;
    } else {
      // 3) FALLBACK: eBay (Scraping en tiempo real)
      const src = getFirstParam(sp.src);
      if (src === "ebay") {
        const title = getFirstParam(sp.title) || slug;
        const priceStr = getFirstParam(sp.price) || "0";
        const priceNumber = Number(priceStr.replace(",", ".")) || 0;
        const targetUrl = getFirstParam(sp.url);

        let description = "Descripción disponible en la tienda oficial.";
        let specs: Record<string, string> = {};

        if (targetUrl) {
          try {
             // 🔥 Llamamos al nuevo scraper que trae TODO (Desc + Specs)
             const scrapedData = await scrapeEbayData(targetUrl);
             
             if (scrapedData.description && scrapedData.description.length > 20) {
                description = scrapedData.description;
             }
             if (scrapedData.specs) {
                specs = scrapedData.specs;
             }

          } catch (error) {
             console.error("Error scraping ebay data:", error);
          }
        }

        product = {
          id: slug, 
          slug, 
          title, 
          description, 
          specs, // ✅ Pasamos las especificaciones al producto
          store: "eBay", 
          category: "Producto",
          priceUSD: priceNumber, 
          estimatedUSD: priceNumber > 0 ? Number((priceNumber * 1.35).toFixed(2)) : 0,
          images: getFirstParam(sp.image) ? [getFirstParam(sp.image)!] : [], 
          sourceUrl: targetUrl || null,
        };
      }
    }
  }

  if (!product) return notFound();

  const relatedProducts = JSON.parse(JSON.stringify(
    mockProducts
      .filter((p) => p.id !== product!.id && (
        (typeof p.category === 'object' ? p.category.main === product!.category?.main : p.category === product!.category) || 
        p.store.toLowerCase() === product!.store.toLowerCase()
      ))
      .slice(0, 6)
  ));

  return (
    <>
      <HeaderEcom />
      <main className="bg-[#f5f5f5] min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <nav className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <Link href="/" className="hover:text-[#0A2647] transition-colors">Inicio</Link>
            <span>/</span>
            {typeof product.category === 'object' ? (
              <>
                <Link href={`/buscar?query=${product.category.main}`} className="hover:text-[#0A2647]">{product.category.main}</Link>
                <span>/</span>
                <Link href={`/buscar?query=${product.category.sub}`} className="hover:text-[#0A2647]">{product.category.sub}</Link>
                <span className="text-red-600">/</span>
                <span className="text-[#0A2647]">{product.category.leaf}</span>
              </>
            ) : (
              <span className="text-[#0A2647]">{product.category}</span>
            )}
          </nav>
        </div>

        <ProductView product={product} />

        {/* ✅ NUEVA SECCIÓN: FICHA TÉCNICA VISUAL */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="mt-8 max-w-6xl mx-auto px-4">
             <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-[#0A2647] mb-6 uppercase tracking-tight">Especificaciones Técnicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
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

        {relatedProducts.length > 0 && (
          <section className="mt-2 mb-4">
            <div className="max-w-6xl mx-auto px-4 transform scale-[0.92] origin-top">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Productos relacionados</h2>
                <span className="text-xs text-slate-500">Podrían interesarte también</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rp: any) => (
                  <Link
                    key={rp.id}
                    href={`/producto/${rp.slug}`}
                    className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <div className="mb-3 h-24 w-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                      {rp.image ? (
                        <Image src={rp.image} alt={rp.title} width={120} height={120} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-slate-400 text-[10px]">Imagen producto</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-slate-900">{rp.title}</h3>
                    <p className="text-[11px] text-slate-500 mb-2">
                      desde {rp.store} · {typeof rp.category === 'object' ? rp.category.leaf : rp.category}
                    </p>
                    <p className="text-sm text-slate-700">USA: <span className="font-semibold">USD {rp.priceUSD}</span></p>
                    <p className="text-sm text-emerald-700">Arg (est.): <span className="font-semibold">USD {rp.estimatedUSD}</span></p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

// ⬇️ HELPER: Scraping COMPLETO (Descripción + Especificaciones)
async function scrapeEbayData(url: string): Promise<{ description: string, specs: Record<string, string> }> {
  const result = { description: "", specs: {} as Record<string, string> };
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/120 Safari/537.36",
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) return result;
    const html = await res.text();
    const $ = cheerio.load(html);

    // --- 1. SCRAPING DE SPECS (Ficha Técnica) ---
    // Buscamos los contenedores de atributos de eBay
    // eBay suele usar dl, dt, dd o divs con clases ux-labels-values
    
    // Intentamos selector moderno de eBay
    $('.ux-layout-section--itemSpecifics .ux-labels-values').each((_, element) => {
        const key = $(element).find('.ux-labels-values__labels').text().trim().replace(':', '');
        const value = $(element).find('.ux-labels-values__values').text().trim();
        
        if (key && value) {
            result.specs[key] = value;
        }
    });

    // Fallback para layouts antiguos
    if (Object.keys(result.specs).length === 0) {
        $('.item-specifications dl').each((_, element) => {
             const dt = $(element).find('dt').text().trim().replace(':', '');
             const dd = $(element).find('dd').text().trim();
             if (dt && dd) result.specs[dt] = dd;
        });
    }


    // --- 2. SCRAPING DE DESCRIPCIÓN (Tu lógica anterior mejorada) ---
    const iframeSrc = $("iframe#desc_ifr").attr("src");

    if (iframeSrc) {
       const descRes = await fetch(iframeSrc);
       if (descRes.ok) {
         let rawHtml = await descRes.text();
         const $desc = cheerio.load(rawHtml);

         $desc('script').remove();
         $desc('style').remove();
         $desc('link').remove();
         $desc('br').replaceWith('\n');
         $desc('p, div, li, h1, h2, h3, h4').after('\n');

         let textContent = $desc("#ds_div").length > 0 
            ? $desc("#ds_div").text() 
            : $desc("body").text();
            
         const lines = textContent.split('\n');
         
         const stopWords = [
            "policy", "política", "return", "devolución", "shipping", "envío", 
            "shipment", "contact us", "contactar", "feedback", "rating", 
            "thank you", "gracias", "check out", "payment", "pago",
            "paypal", "credit card", "refund", "reembolso", "tax", "impuesto",
            "po box", "apo", "fpo", "hawaii", "alaska", "puerto rico",
            "business hours", "horario", "restocking", "tracking", "copyright",
            "price", "precio", "msrp", "retail", "cost", "costo", "value", 
            "valor", "usd", "dollars", "bid", "oferta", "subasta"
         ];

         const seenLines = new Set<string>();

         const cleanLines = lines.filter(line => {
            const trimmed = line.trim();
            const lowerLine = trimmed.toLowerCase();
            if (trimmed.length < 3) return false;
            if (line.includes("$")) return false;
            if (stopWords.some(word => lowerLine.includes(word))) return false;
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

  } catch (e) {
    return result;
  }
}
