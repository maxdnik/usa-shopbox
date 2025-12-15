"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();

  const orderId = sp.get("orderId");
  const orderNumber = sp.get("orderNumber");
  const totalUSD = sp.get("totalUSD");

  return (
    <div className="min-h-screen bg-[#061a33] text-white">
      {/* Header / Estética USAShopBox */}
      <div className="w-full bg-[#0b2a4a] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#0b2a4a] font-bold rounded-md px-2 py-1">
              USA
            </div>
            <div className="text-xl font-semibold tracking-tight">
              USAShopBox
            </div>
          </div>

          <Link href="/" className="text-white/80 hover:text-white">
            Seguir comprando
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Card principal */}
        <div className="bg-white text-black rounded-2xl p-8 shadow-xl">
          <div className="flex items-start gap-4">
            {/* Icono check */}
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 text-green-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                ¡Pedido recibido!
              </h1>

              <p className="text-gray-700">
                Gracias por comprar en <b>USAShopBox</b>.  
                Ya tenemos tu solicitud y empezamos a procesarla.
              </p>
            </div>
          </div>

          {/* Datos de orden */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border">
              <p className="text-xs uppercase text-gray-500 font-semibold">
                Número de orden
              </p>
              <p className="text-lg font-bold">
                {orderNumber || "—"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border">
              <p className="text-xs uppercase text-gray-500 font-semibold">
                Total estimado
              </p>
              <p className="text-lg font-bold text-green-700">
                USD {totalUSD || "—"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border">
              <p className="text-xs uppercase text-gray-500 font-semibold">
                Estado actual
              </p>
              <p className="text-lg font-bold">
                Pendiente de pago
              </p>
            </div>
          </div>

          {/* Texto “qué sigue” */}
          <div className="mt-7 space-y-3 text-gray-800">
            <h2 className="text-lg font-semibold">¿Qué sigue ahora?</h2>

            <ul className="list-disc pl-5 space-y-2">
              <li>
                Te vamos a avisar por email cuando confirmemos el pago.
              </li>
              <li>
                Una vez confirmado, compramos el producto en USA y lo enviamos a tu domicilio en Argentina.
              </li>
              <li>
                Podés seguir el estado de tu orden desde tu panel.
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col md:flex-row gap-3">
            <Link
              href="/dashboard/orders"
              className="w-full md:w-auto bg-[#D72638] text-white px-6 py-3 rounded-lg text-center font-semibold hover:opacity-95"
            >
              Ver mis pedidos
            </Link>

            <Link
              href="/"
              className="w-full md:w-auto bg-black/5 px-6 py-3 rounded-lg text-center font-semibold hover:bg-black/10"
            >
              Seguir comprando
            </Link>
          </div>

          {/* ID técnico chiquito */}
          {orderId && (
            <p className="mt-6 text-xs text-gray-500">
              ID interno: {orderId}
            </p>
          )}
        </div>

        {/* Frase final bien USAShopBox */}
        <div className="text-center text-white/80 mt-8">
          <p className="text-sm">
            Si tenés alguna duda, escribinos cuando quieras.  
            Estamos para acompañarte en todo el proceso 🙌
          </p>
        </div>
      </div>
    </div>
  );
}
