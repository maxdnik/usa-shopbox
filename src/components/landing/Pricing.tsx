// src/components/landing/Pricing.tsx
export default function Pricing() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0A2647] mb-6">
        Tarifas simples y transparentes
      </h2>
      <div className="border border-slate-100 rounded-2xl p-8 bg-white shadow-sm max-w-md">
        <p className="text-sm font-medium text-slate-600 mb-2">
          Tarifa estándar
        </p>
        <p className="text-4xl font-bold text-[#0A2647]">
          USD 22{" "}
          <span className="text-base font-medium text-slate-500">
            / kilo
          </span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Mínimo 1 kg. Incluye recepción en Miami, fotos, reempaque,
          consolidación y envío a Argentina.
        </p>
        <ul className="mt-4 text-sm text-slate-600 space-y-1">
          <li>• Recepción en nuestro warehouse en Miami</li>
          <li>• Reempaque y consolidación</li>
          <li>• Envío Miami → Buenos Aires</li>
          <li>• Entrega a domicilio en Argentina</li>
        </ul>
        <button className="mt-6 w-full bg-[#D72638] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#b81e2d] transition">
          Crear mi casilla y calcular envío
        </button>
        <p className="mt-3 text-[11px] text-slate-500">
          Impuestos aduaneros, si corresponden, se calculan según normativa
          vigente en Argentina.
        </p>
      </div>
    </section>
  );
}
