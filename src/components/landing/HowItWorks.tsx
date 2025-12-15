// src/components/landing/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    {
      title: "Creás tu casilla en Miami",
      text: "Te damos tu dirección exclusiva en nuestro warehouse en Estados Unidos.",
    },
    {
      title: "Comprás en cualquier tienda de USA",
      text: "Amazon, Walmart, Apple, Nike, BestBuy, eBay y todas las que quieras.",
    },
    {
      title: "Consolidamos y enviamos a Argentina",
      text: "Recibimos tus paquetes, los reempacamos y optimizamos el envío.",
    },
    {
      title: "Recibís en tu casa en 5–10 días",
      text: "Seguimiento en tiempo real y soporte local en Argentina.",
    },
  ];

  return (
    <section id="como-funciona" className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0A2647] mb-6">
        ¿Cómo funciona USAShopBox?
      </h2>
      <div className="grid md:grid-cols-4 gap-6">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className="border border-slate-100 rounded-2xl p-4 shadow-sm bg-white"
          >
            <div className="w-8 h-8 rounded-full bg-[#0A2647] text-white flex items-center justify-center text-sm font-bold mb-3">
              {idx + 1}
            </div>
            <h3 className="font-semibold text-sm text-[#0A2647] mb-2">
              {step.title}
            </h3>
            <p className="text-xs text-slate-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
