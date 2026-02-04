"use client";

export default function TestPaymentPage() {
  const simulatePayment = async () => {
    const data = {
      items: [
        {
          productId: "test123",
          title: "Producto de prueba",
          qty: 1,
          priceUSD: 100,
        },
      ],
      totalUSD: 100,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    console.log("Respuesta del servidor:", json);

    if (res.ok) {
      alert("Orden creada: " + json._id);
      window.location.href = `/checkout/success/${json._id}`;
    } else {
      alert("Error: " + json.error);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Simulador de pago</h1>

      <button
        onClick={simulatePayment}
        className="bg-red-600 text-white px-6 py-3 rounded-lg"
      >
        Simular pago
      </button>
    </div>
  );
}
