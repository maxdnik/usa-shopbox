// src/components/landing/Benefits.tsx
export default function Benefits() {
  const benefits = [
    {
      title: "Tarifas claras",
      text: "Precio por kilo transparente, sin sorpresas al final.",
    },
    {
      title: "Consolidación gratuita",
      text: "Unimos tus compras en un solo envío para que pagues menos.",
    },
    {
      title: "Soporte local",
      text: "Atención desde Argentina por WhatsApp, email y teléfono.",
    },
    {
      title: "Envíos rápidos",
      text: "Miami → Buenos Aires en 5–10 días con seguimiento.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0A2647] mb-6">
        ¿Por qué elegir USAShopBox?
      </h2>
      <div className="grid md:grid-cols-4 gap-6">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="border border-slate-100 rounded-2xl p-4 bg-slate-50"
          >
            <h3 className="font-semibold text-sm text-[#0A2647] mb-2">
              {b.title}
            </h3>
            <p className="text-xs text-slate-600">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

