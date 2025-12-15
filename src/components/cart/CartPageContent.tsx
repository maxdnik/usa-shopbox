"use client";

import HeaderEcom from "@/components/home/HeaderEcom";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((acc, item) => acc + item.estimatedUSD, 0);

  return (
    <>
      <HeaderEcom />

      <main className="bg-[#f5f5f5] min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4">

          {/* CARD PRINCIPAL */}
          <div className="bg-white p-8 rounded-xl shadow-sm border">

            {/* Si carrito vacío */}
            {cart.length === 0 ? (
              <p className="text-gray-700">Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-8">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-6 border-b"
                  >

                    <div className="flex items-center gap-5">
                      {/* Imagen */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                        <img
                          src={item.imageUrl || "/placeholder.png"}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {/* ✔ Checkout dentro del card */}
                      <h1 className="text-2xl font-bold text-gray-900 mb-8">
                        Checkoutt
                      </h1>
                      {/* Info */}
                      <div className="flex flex-col">
                        {/* ✔ Título más oscuro */}
                        <p className="font-semibold text-lg text-gray-900">
                          {item.title}
                        </p>

                        <p className="text-sm text-gray-700">
                          {item.store}
                        </p>

                        <p className="text-sm text-gray-700">
                          Cantidad: <span className="font-medium">1</span>
                        </p>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 text-sm mt-2"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>

                    {/* ✔ Precio más oscuro */}
                    <p className="font-semibold text-xl text-gray-900">
                      USD {item.estimatedUSD}
                    </p>
                  </div>
                ))}

                {/* ✔ Resumen de compra */}
                <div className="pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Resumen de compra
                  </h2>

                  <div className="flex justify-between text-lg font-semibold text-green-700">
                    <span>Total estimado (USD)</span>
                    <span>USD {total.toFixed(2)}</span>
                  </div>

                  <p className="text-sm text-gray-700 mt-2">
                    Total estimado puesto en Argentina. El valor final puede variar según impuestos aduaneros vigentes.
                  </p>

                  <button className="w-full bg-red-600 text-white py-4 rounded-lg mt-8 text-lg font-semibold hover:bg-red-700 transition">
                    Ir al pago (simulado)
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full py-3 rounded-lg mt-3 text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#0A2647] text-white mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} USAShopBox. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#ayuda" className="hover:underline">
              Ayuda
            </a>
            <a href="#terminos" className="hover:underline">
              Términos y condiciones
            </a>
            <a href="#contacto" className="hover:underline">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

