// src/components/home/HeroBanner.tsx
export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-[#0A2647] to-[#173a6a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[2fr,1fr] gap-8 items-center">
        {/* Texto principal */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Comprá en Amazon, eBay, Nike y cientos de tiendas en USA
            <span className="text-[#FFD166]"> y recibí en Argentina.</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-100">
            Productos de las principales tiendas de Estados Unidos a la puerta de tu casa.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Ofertas en zapatillas
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Electrónica y gaming
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Moda y accesorios
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
