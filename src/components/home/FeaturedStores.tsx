// src/components/home/FeaturedStores.tsx
import Link from "next/link";
import Image from "next/image";
import { OFFICIAL_STORES } from "@/lib/stores";

export default function FeaturedStores() {
  return (
    <section className="mt-8">
      {/* Título en azul */}
      <h2 className="text-xl font-semibold mb-4 text-[#0A2647]">
        Tiendas oficiales en USA
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {OFFICIAL_STORES.map((store) => (
          <Link
            key={store.slug}
            href={`/tienda/${store.slug}`}
            className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
              <Image
                src={store.image || "/product-placeholder.png"}
                alt={store.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {store.name}
              </span>
              <span className="text-sm text-slate-500">Ver productos</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
