"use client";

// src/app/producto/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { use } from "react";

import HeaderEcom from "@/components/home/HeaderEcom";
import { mockProducts } from "@/lib/products";
import { useCart } from "@/context/CartContext";

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
  category: string;
  priceUSD: number;
  estimatedUSD: number;
  images: string[];
  sourceUrl?: string | null;
};

function getFirstParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = use(params);
  const sp = use(searchParams);

  const { addToCart } = useCart();

  // 1) Intentar producto local (mockProducts)
  const mock = mockProducts.find((p) => {
    if (!p.slug || !slug) return false;
    return p.slug.toLowerCase() === slug.toLowerCase();
  });

  let product: ViewProduct | null = null;

  if (mock) {
    product = {
      id: mock.id,
      slug: mock.slug,
      title: mock.title,
      description: mock.description,
      store: mock.store,
      category: mock.category,
      priceUSD: mock.priceUSD,
      estimatedUSD: mock.estimatedUSD,
      images: Array.from(
        new Set(
          [
            (mock as any).image,
            ...(Array.isArray((mock as any).images)
              ? (mock as any).images
              : []),
          ].filter(Boolean)
        )
      ),
      sourceUrl: (mock as any).sourceUrl ?? null,
    };
  } else {
    // 2) Producto proveniente de la búsqueda de eBay (querystring)
    const src = getFirstParam(sp.src);
    if (src === "ebay") {
      const title = getFirstParam(sp.title) || slug;
      const priceStr = getFirstParam(sp.price) || "0";
      const image = getFirstParam(sp.image);
      const url = getFirstParam(sp.url) || null;

      const parsed = priceStr.replace(",", ".");
      const priceNumber = Number(parsed) || 0;
      const estimated =
        priceNumber > 0 ? Number((priceNumber * 1.3).toFixed(2)) : 0;

      product = {
        id: slug,
        slug,
        title,
        description: "",
        store: "eBay",
        category: "Producto",
        priceUSD: priceNumber,
        estimatedUSD: estimated,
        images: image ? [image] : [],
        sourceUrl: url,
      };
    }
  }

  if (!product)
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <HeaderEcom />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">
            Producto no encontrado
          </h1>
          <p className="text-slate-600">
            No pudimos encontrar el artículo que buscabas. Volvé al inicio
            para seguir explorando.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#E02020] px-4 py-2 rounded-lg"
            >
              Ir al home
            </Link>
          </div>
        </div>
      </div>
    );

  // Imagen principal y versión en alta (s-l1600 si existe)
  const mainImage = product.images[0];
  const highResImage =
    mainImage?.match(/s-l\d+/) != null
      ? mainImage.replace(/s-l\d+/, "s-l1600")
      : mainImage;

  const longDescription =
    product.description ||
    `Producto original comprado en ${product.store} en Estados Unidos. Nosotros lo compramos por vos, lo recibimos en Miami y lo enviamos hasta tu domicilio en Argentina.`;

  const handleAddToCart = () => {
    addToCart({
      id: product!.id,
      title: product!.title,
      priceUSD: product!.priceUSD,
      estimatedUSD: product!.estimatedUSD,
      imageUrl: product!.images?.[0],
      store: product!.store,
      slug: product!.slug,
      quantity: 1,
    });
  };

  const relatedProducts = mockProducts
    .filter(
      (p) =>
        p.id !== product!.id &&
        (p.category === product!.category ||
          p.store.toLowerCase() === product!.store.toLowerCase())
    )
    .slice(0, 6);

  return (
    <>
      <HeaderEcom />

      <main className="bg-[#f5f5f5] min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* breadcrumb */}
          <div className="text-xs text-slate-500 mb-4">
            <span className="text-slate-400">Tienda:</span>{" "}
            <span className="font-medium">{product.store}</span> ·{" "}
            <span className="text-slate-400">Categoría:</span>{" "}
            <span className="font-medium">{product.category}</span>
          </div>

        {/* ============ IMAGEN IZQ + PRECIO DER (30% smaller) ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-0 scale-[0.92] origin-top">

            {/* FOTO (IZQUIERDA) */}
            <section className="rounded-xl bg-white border border-slate-200 p-4 h-full flex items-center justify-center">
              <div className="relative w-full max-w-[360px] h-full min-h-[260px] max-h-[380px] rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center">
                {highResImage ? (
                  <Image
                    src={highResImage}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-contain"
                  />
                ) : (
                  <span className="text-slate-400 text-sm">
                    Imagen del producto
                  </span>
                )}
              </div>
            </section>

            {/* PRECIO (DERECHA) */}
            <section className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col gap-3 h-full">
              <div className="text-sm">
                <p className="text-slate-500">Precio en tienda USA</p>
                <p className="text-2xl font-bold text-slate-900">
                  USD {product.priceUSD.toFixed(2)}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 line-through">
                USD {(product.priceUSD * 1.2).toFixed(0)}{" "}
                <span className="ml-2 text-emerald-600 font-semibold">
                  15% OFF estimado
                </span>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] font-semibold text-emerald-800">
                  Estimado en Argentina
                </p>
                <p className="text-2xl font-extrabold text-emerald-700">
                  USD {product.estimatedUSD.toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                className="rounded-lg bg-[#E02020] text-white text-sm font-semibold py-2"
              >
                Agregar al carrito
              </button>

            </section>

        </div>



      {/* ============ BLOQUE BAJO: TÍTULO + INFO + DESCRIPCIÓN (ACHICADO + MENOS ESPACIO) ============ */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 mt-0 mb-6 transform scale-[0.92] origin-top mx-auto">
        <p className="text-xs text-slate-500 mb-1">
          {product.store} · Enviado desde USA
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-snug">
          {product.title}
        </h1>

        <div className="flex items-center gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1 text-amber-500">
            <span>★★★★☆</span>
          </div>
          <span className="text-slate-500">32 calificaciones</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm mb-5">
          <div>
            <p className="text-slate-500">Disponibilidad:</p>
            <p className="font-medium text-emerald-700">
              En stock en {product.store}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Condición:</p>
            <p className="font-medium">Nuevo</p>
          </div>
          <div>
            <p className="text-slate-500">Envío hacia Argentina:</p>
            <p className="font-medium">
              Con nuestra logística puerta a puerta
            </p>
          </div>
          <div>
            <p className="text-slate-500">Tiempo estimado de entrega:</p>
            <p className="font-medium">8 a 15 días hábiles</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2 text-slate-900">
          Descripción detallada
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 mb-4">
          {longDescription}
        </p>
        <p className="text-xs text-slate-500">
          Las imágenes son ilustrativas. El producto se adquiere en {product.store} y se envía a través de nuestra red logística internacional.
        </p>
      </section>


{/* ============ PRODUCTOS RELACIONADOS ============ */}
{relatedProducts.length > 0 && (
  <section className="mt-2 mb-4">
    <div className="transform scale-[0.92] origin-top mx-auto">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Productos relacionados
        </h2>
        <span className="text-xs text-slate-500">
          Podrían interesarte también
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.map((rp) => (
          <Link
            key={rp.id}
            href={`/producto/${rp.slug}`}
            className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className="mb-3 h-24 w-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
              {(rp as any).image ? (
                <Image
                  src={(rp as any).image}
                  alt={rp.title}
                  width={120}
                  height={120}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-slate-400 text-[10px]">
                  Imagen producto
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-slate-900">
              {rp.title}
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              desde {rp.store} · {rp.category}
            </p>
            <p className="text-sm text-slate-700">
              USA: <span className="font-semibold">USD {rp.priceUSD}</span>
            </p>
            <p className="text-sm text-emerald-700">
              Arg (est.):{" "}
              <span className="font-semibold">USD {rp.estimatedUSD}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}

        </div>
      </main>
    </>
  );
}

