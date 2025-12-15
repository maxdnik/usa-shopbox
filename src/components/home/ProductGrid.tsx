// src/components/home/ProductGrid.tsx
import Link from "next/link";
import { mockProducts } from "@/lib/products";

export default function ProductGrid() {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Productos destacados desde USA
        </h2>
        <a
          href="#"
          className="text-[11px] text-[#0A2647] hover:underline font-semibold"
        >
          Ver todos
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockProducts.map((p) => (
          <article
            key={p.id}
            className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col hover:shadow-sm hover:-translate-y-0.5 transition"
          >
            {/* Placeholder de imagen */}
            <div className="bg-slate-100 rounded-lg h-28 mb-3 flex items-center justify-center text-[11px] text-slate-400">
              Imagen producto
            </div>

            <h3 className="text-xs font-semibold text-slate-800 line-clamp-2">
              {p.title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              desde <span className="font-semibold">{p.store}</span>
            </p>

            <div className="mt-2 text-xs">
              <p className="text-slate-500">
                Precio en USA:&nbsp;
                <span className="font-semibold text-slate-800">
                  USD {p.priceUSD}
                </span>
              </p>
              <p className="text-emerald-700 font-semibold">
                Estimado puesto en Arg: USD {p.estimatedUSD}
              </p>
            </div>

            <Link
              href={`/producto/${p.slug}`}
              className="mt-3 w-full bg-[#0A2647] text-white py-1.5 rounded-md text-[11px] font-semibold text-center hover:bg-[#132f5f] transition"
            >
              Ver detalle
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
