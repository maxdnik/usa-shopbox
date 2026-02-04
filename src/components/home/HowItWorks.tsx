// src/components/home/HowItWorks.tsx
export default function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-10 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          ¿Cómo funciona USAShopBox?
        </h2>

        <ol className="text-sm text-slate-700 space-y-2">
          <li>1. Elegís un producto de nuestro catálogo o pegás el link.</li>
          <li>2. Te mostramos el precio final puesto en Argentina.</li>
          <li>3. Pagás en nuestra web con tarjeta argentina.</li>
          <li>4. Nosotros compramos en USA y te enviamos a tu domicilio.</li>
        </ol>

        <button className="mt-4 w-full bg-[#D72638] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#b81e2d] transition">
          Ver productos destacados
        </button>
      </div>
    </section>
  );
}
