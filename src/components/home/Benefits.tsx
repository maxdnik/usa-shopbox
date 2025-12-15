// src/components/home/Benefits.tsx
const items = [
  {
    title: "Pagás en pesos o dólares",
    text: "Pagá con tarjeta argentina y olvidate de la tarjeta internacional.",
  },
  {
    title: "Precio final antes de pagar",
    text: "Te mostramos el costo estimado con envío e impuestos antes de confirmar.",
  },
  {
    title: "Envíos en 5–10 días",
    text: "Operación propia en Miami y Argentina para reducir tiempos.",
  },
];

export default function Benefits() {
  return (
    <section className="mt-10 mb-6">
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((b) => (
          <div
            key={b.title}
            className="bg-white border border-slate-200 rounded-xl p-4 text-sm"
          >
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">
              {b.title}
            </h3>
            <p className="text-xs text-slate-600">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

