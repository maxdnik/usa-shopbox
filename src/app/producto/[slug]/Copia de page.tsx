// src/app/producto/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import HeaderEcom from "@/components/home/HeaderEcom";
import { mockProducts } from "@/lib/products";

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
};

function getFirstParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  // 1) Intentar producto local (mock)
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
    };
  } else {
    // 2) Si no hay mock, ver si viene de eBay (querystring)
    const src = getFirstParam(sp.src);
    if (src === "ebay") {
      const title = getFirstParam(sp.title) || slug;
      const priceStr = getFirstParam(sp.price) || "0";
      const currency = getFirstParam(sp.currency) || "USD";
      const image = getFirstParam(sp.image);

      const priceNumber = Number(priceStr.replace(",", ".")) || 0;
      const estimated = priceNumber > 0 ? Number((priceNumber * 1.3).toFixed(2)) : 0;

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
      };
    }
  }

  if (!product) return notFound();

  const mainImage = product.images[0];

  const longDescription =
    product.description ||
    `Producto original comprado en ${product.store} en Estados Unidos. Nosotros lo compramos por vos, lo recibimos en Miami y lo enviamos hasta tu domicilio en Argentina.`;

  const relatedProducts = mockProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.store.toLowerCase() === product.store.toLowerCase())
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

          {/* =============== IMAGEN IZQ + INFO DER =============== */}
          <div className="grid gap-6 items-start grid-cols-1 md:grid-cols-[260px,minmax(0,1.8fr)] mb-8">
            {/* columna izquierda: imagen */}
            <section className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="w-full h-56 rounded-xl bg-slate-50 flex items-center justify-center">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={product.title}
                    width={260}
                    height={260}
                    className="max-h-56 w-auto object-contain"
                  />
                ) : (
                  <span className="text-slate-400 text-sm">
                    Imagen del producto
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.length > 1
                  ? product.images.slice(0, 4).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 hover:border-slate-400 transition"
                      >
                        <Image
                          src={img}
                          alt={`${product.title} vista ${idx + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))
                  : Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center text-[9px] text-slate-300"
                      >
                        Vista {idx + 1}
                      </div>
                    ))}
              </div>
            </section>

            {/* columna derecha: info */}
            <section className="rounded-2xl bg-white border border-slate-200 p-6">
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

              <div>
                <h2 className="text-base font-semibold mb-2 text-slate-900">
                  Sobre este producto
                </h2>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  <li>
                    Producto original comprado en{" "}
                    <span className="font-semibold">{product.store}</span> en
                    Estados Unidos.
                  </li>
                  <li>
                    Nosotros lo compramos por vos, lo recibimos en Miami y lo
                    enviamos hasta tu domicilio en Argentina.
                  </li>
                  <li>
                    El valor estimado en Argentina incluye flete internacional,
                    manejo en Miami y entrega en Argentina.
                  </li>
                  <li>
                    Ideal para aprovechar precios de USA sin hacer trámites ni
                    lidiar con la aduana.
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* descripción detallada */}
          <section className="rounded-2xl bg-white border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-2 text-slate-900">
              Descripción detallada
            </h2>
            <p className="text-sm leading-relaxed text-slate-700 mb-4">
              {longDescription}
            </p>
            <p className="text-xs text-slate-500">
              Las imágenes son ilustrativas. El producto se adquiere en{" "}
              {product.store} y se envía a través de nuestra red logística
              internacional.
            </p>
          </section>

          {/* caja de precio */}
          <section className="rounded-2xl bg-white border border-slate-200 p-6 mb-10 max-w-3xl mx-auto">
            <div className="text-sm mb-2">
              <p className="text-slate-500">Precio en tienda USA</p>
              <p className="text-2xl font-bold text-slate-900">
                USD {product.priceUSD.toFixed(2)}
              </p>
            </div>

            <div className="text-xs text-slate-500 line-through mb-3">
              USD {(product.priceUSD * 1.2).toFixed(0)}{" "}
              <span className="ml-2 text-emerald-600 font-semibold">
                15% OFF estimado
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-emerald-800 mb-1">
                Estimado puesto en Argentina
              </p>
              <p className="text-3xl font-extrabold text-emerald-700 mb-1">
                USD {product.estimatedUSD.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-800">
                Incluye envío internacional, manejo en Miami y entrega en
                Argentina.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 mb-4">
              <p>Pagás en pesos argentinos con Mercado Pago.</p>
              <p>Sin trámites de aduana: nosotros nos encargamos de todo.</p>
              <p>Seguimiento online desde la compra hasta la entrega.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button className="inline-flex items-center justify-center rounded-xl bg-[#E02020] text-white text-sm font-semibold h-11 hover:bg-[#c71919] transition">
                Agregar al carrito
              </button>

              <button className="inline-flex items-center justify-center rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold h-11 bg-white hover:bg-slate-50 transition">
                Calcular costo en pesos
              </button>
            </div>
          </section>

          {/* relacionados (siguen siendo tus mocks) */}
          {relatedProducts.length > 0 && (
            <section>
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
                      USA:{" "}
                      <span className="font-semibold">USD {rp.priceUSD}</span>
                    </p>
                    <p className="text-sm text-emerald-700">
                      Arg (est.):{" "}
                      <span className="font-semibold">
                        USD {rp.estimatedUSD}
                      </span>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
