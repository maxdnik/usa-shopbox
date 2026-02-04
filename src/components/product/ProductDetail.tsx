// src/components/ProductDetail.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({
  product,
  relatedProducts,
}: ProductDetailProps) {
  const longDescription =
    product.description ??
    `Producto original importado desde ${product.store}, ideal para quienes quieren aprovechar los precios de USA sin preocuparse por la logística.`;

  return (
    <div className="space-y-10 pb-10">
      {/* ========== IMAGEN IZQUIERDA + INFO DERECHA ========== */}
      <div className="grid gap-6 items-start grid-cols-[220px,minmax(0,1.8fr)] mb-4">
        {/* Columna izquierda: imagen */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="w-full h-40 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
            Imagen del producto
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center text-[9px] text-slate-300"
              >
                Vista {idx + 1}
              </div>
            ))}
          </div>
        </section>

        {/* Columna derecha: info */}
        <section className="rounded-2xl bg-white border border-slate-200 p-6">
          <p className="text-xs text-slate-500 mb-1">
            {product.store} · Enviado desde USA
          </p>

          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 leading-tight mb-3">
            {product.title}
          </h1>

          {/* ratings + calificaciones */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              ★★★★☆
            </div>
            <span className="text-slate-500 text-xs">32 calificaciones</span>
          </div>

          {/* disponibilidad / condición / envío / tiempo */}
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

          {/* Sobre este producto */}
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

      {/* ========== DESCRIPCIÓN DETALLADA ========== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
          Descripción detallada
        </h2>
        <p className="text-sm text-slate-700 mb-3">{longDescription}</p>
        <p className="text-xs text-slate-500">
          Las imágenes son ilustrativas. El producto se adquiere en{" "}
          {product.store} y se envía a través de nuestra red logística
          internacional. Ante cualquier duda sobre talles, medidas o
          compatibilidad, podés consultarnos antes de comprar.
        </p>
      </section>

      {/* ========== CAJA PRECIO / BOTONES ========== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl mx-auto">
        {/* Precio USA */}
        <div className="text-sm mb-2">
          <p className="text-slate-500">Precio en tienda USA</p>
          <p className="text-2xl font-bold text-slate-900">
            USD {product.priceUSD}
          </p>
        </div>

        <div className="text-xs text-slate-500 line-through mb-3">
          USD {(product.priceUSD * 1.2).toFixed(0)}{" "}
          <span className="ml-2 text-emerald-600 font-semibold">
            15% OFF estimado
          </span>
        </div>

        {/* Caja verde */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-emerald-800 mb-1">
            Estimado puesto en Argentina
          </p>
          <p className="text-3xl font-extrabold text-emerald-700 mb-1">
            USD {product.estimatedUSD}
          </p>
          <p className="text-[11px] text-emerald-800">
            Incluye envío internacional, manejo en Miami y entrega en Argentina.
            El valor final en pesos se calcula al momento del pago.
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

      {/* ========== PRODUCTOS RELACIONADOS ========== */}
      {relatedProducts.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Productos relacionados
            </h2>
            <span className="text-xs text-slate-400">
              Podrían interesarte también
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/producto/${p.slug}`}
                className="group rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm transition overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-slate-50 flex items-center justify-center text-[11px] text-slate-300">
                  Imagen producto
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs text-slate-400">desde {p.store}</p>
                  <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-sky-700">
                    {p.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Precio USA:{" "}
                    <span className="font-semibold">USD {p.priceUSD}</span>
                  </p>
                  <p className="text-xs text-emerald-700">
                    Arg (est.):{" "}
                    <span className="font-semibold">USD {p.estimatedUSD}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
