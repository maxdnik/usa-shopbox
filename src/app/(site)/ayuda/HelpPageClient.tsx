"use client";

import Link from "next/link";
import { Suspense } from "react";

// ✅ componente interactivo
import HelpCenterInteractive from "@/components/help/HelpCenterInteractive";

export default function HelpPageClient() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0A2647] uppercase tracking-widest transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Volver al inicio
            </Link>
          </div>

          {/* Tarjeta Principal */}
          <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {/* ✅ Si HelpCenterInteractive usa useSearchParams, queda cubierto */}
            <Suspense fallback={<HelpCenterInteractiveFallback />}>
              <HelpCenterInteractive />
            </Suspense>

            {/* 👇 Desde acá en adelante NO SE TOCA: tus FAQs hardcodeadas */}
            <div className="p-8 md:p-12 pt-0">
              {/* Categoría: GENERAL Y ENVÍOS */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-black text-[#0A2647] uppercase tracking-tight">
                    Preguntas Frecuentes
                  </h2>
                </div>

                <div className="grid gap-4">
                  {/* FAQ ITEM 1 */}
                  <details className="group bg-slate-50 rounded-2xl border border-slate-100 open:border-[#0A2647]/10 open:bg-white transition-colors duration-300">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#0A2647] transition-colors">
                        ¿El precio que veo es el final? ¿Tengo que pagar algo extra?
                      </span>
                      <span className="bg-white group-open:bg-[#0A2647] group-open:text-white p-2 rounded-full shadow-sm text-slate-400 transition-all">
                        <svg
                          className="w-4 h-4 transform group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-2 animate-in slide-in-from-top-2">
                      <p>
                        <strong className="text-[#0A2647]">Sí, es final.</strong>{" "}
                        En USA Shop Box operamos con el sistema "All-In" (Todo
                        Incluido). El precio que ves en el carrito incluye el
                        producto, flete internacional, gastos de aduana, gestión
                        y entrega en tu domicilio. No tendrás que hacer trámites
                        en AFIP ni pagar extras al cartero.
                      </p>
                    </div>
                  </details>

                  {/* FAQ ITEM 2 */}
                  <details className="group bg-slate-50 rounded-2xl border border-slate-100 open:border-[#0A2647]/10 open:bg-white transition-colors duration-300">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#0A2647] transition-colors">
                        ¿Cuánto tarda en llegar mi pedido?
                      </span>
                      <span className="bg-white group-open:bg-[#0A2647] group-open:text-white p-2 rounded-full shadow-sm text-slate-400 transition-all">
                        <svg
                          className="w-4 h-4 transform group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-2">
                      <p>
                        El tiempo estimado de entrega suele ser de{" "}
                        <strong className="text-[#0A2647]">8 a 15 días hábiles</strong>{" "}
                        desde que el producto llega a nuestro depósito en Miami.
                        Tené en cuenta que los tiempos pueden variar por factores
                        climáticos o demoras en aduana ajenas a nuestra gestión.
                      </p>
                    </div>
                  </details>

                  {/* FAQ ITEM 3 */}
                  <details className="group bg-slate-50 rounded-2xl border border-slate-100 open:border-[#0A2647]/10 open:bg-white transition-colors duration-300">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#0A2647] transition-colors">
                        ¿Necesito Clave Fiscal o trámites en AFIP?
                      </span>
                      <span className="bg-white group-open:bg-[#0A2647] group-open:text-white p-2 rounded-full shadow-sm text-slate-400 transition-all">
                        <svg
                          className="w-4 h-4 transform group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-2">
                      <p>
                        No. Nosotros gestionamos toda la importación a nombre de nuestro
                        importador o mediante régimen Courier simplificado. Vos solo
                        necesitás poner tu DNI/CUIT para la factura y recibir el paquete.
                      </p>
                    </div>
                  </details>

                  {/* FAQ ITEM 4 */}
                  <details className="group bg-slate-50 rounded-2xl border border-slate-100 open:border-[#0A2647]/10 open:bg-white transition-colors duration-300">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#0A2647] transition-colors">
                        ¿Qué métodos de pago aceptan?
                      </span>
                      <span className="bg-white group-open:bg-[#0A2647] group-open:text-white p-2 rounded-full shadow-sm text-slate-400 transition-all">
                        <svg
                          className="w-4 h-4 transform group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-2">
                      <p>
                        Podés pagar en Pesos Argentinos (ARS) a través de{" "}
                        <strong className="text-[#0A2647]">Mercado Pago</strong>, con tarjeta
                        de crédito, débito o dinero en cuenta. También aceptamos
                        transferencias bancarias directas para montos mayores.
                      </p>
                    </div>
                  </details>
                </div>
              </div>

              {/* Sección de Soporte Directo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0A2647] text-white p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-lg font-black uppercase tracking-widest mb-2">
                      Atención al Cliente
                    </h3>
                    <p className="text-white/80 text-sm mb-6">
                      ¿Tenés un problema con tu pedido? Estamos para ayudarte de Lunes a Viernes de 9 a 18hs.
                    </p>
                    <a
                      href="mailto:soporte@usashopbox.com"
                      className="inline-flex items-center gap-2 bg-white text-[#0A2647] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 hover:text-[#0A2647] transition-all"
                    >
                      Contactar Soporte
                    </a>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-slate-100 text-slate-800 p-8 rounded-3xl flex flex-col justify-between border border-slate-200">
                  <div>
                    <h3 className="text-lg font-black text-[#0A2647] uppercase tracking-widest mb-2">
                      Ventas Mayoristas
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Si querés traer productos para tu negocio o en cantidad, consultá por nuestros planes corporativos.
                    </p>
                    <a
                      href="mailto:ventas@usashopbox.com"
                      className="inline-flex items-center gap-2 bg-[#0A2647] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#1E3A8A] transition-all"
                    >
                      Consultar Business
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function HelpCenterInteractiveFallback() {
  return (
    <div className="p-8 md:p-12">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="h-12 w-full rounded-2xl bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}