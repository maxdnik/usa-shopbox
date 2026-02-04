import Link from "next/link";

export default async function SuccessPage({ params }: any) {
  const { orderId } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/orders/${orderId}`, {
    cache: "no-store",
  });

  const order = await res.json();

  return (
    <div className="min-h-screen bg-[#061a33] text-white p-6">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">¡Gracias por tu compra!</h1>
        <p className="text-lg mb-6">Tu orden fue creada con éxito.</p>

        <div className="bg-white text-black rounded-xl p-4 mb-6">
          <p className="font-semibold">Número de orden:</p>
          <p className="text-xl font-bold">{order._id}</p>
          <p className="mt-3">Estado: {order.status}</p>
        </div>

        <Link
          href="/dashboard/orders"
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
        >
          Ver mis pedidos
        </Link>
      </div>
    </div>
  );
}
