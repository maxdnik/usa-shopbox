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
            Mostramos productos de las principales tiendas de Estados Unidos,
            calculamos el costo a Argentina y nos encargamos del envío, la
            aduana y la entrega en tu casa.
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

        {/* Card resumen “Cómo funciona” */}
        <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-lg">
          <h2 className="text-sm font-semibold mb-2">
            ¿Cómo funciona USAShopBox?
          </h2>
          <ol className="text-xs space-y-1.5">
            <li>1. Elegís un producto de nuestro catálogo o pegás el link.</li>
            <li>2. Te mostramos el precio final puesto en Argentina.</li>
            <li>3. Pagás en nuestra web en cuotas o en un pago.</li>
            <li>4. Lo compramos en USA y te lo enviamos a tu casa.</li>
          </ol>
          <button className="mt-3 w-full bg-[#D72638] text-white py-2 rounded-md text-xs font-semibold hover:bg-[#b81e2d] transition">
            Ver productos destacados
          </button>
        </div>
      </div>
    </section>
  );
}
