import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | USA Shop Box",
  description: "Condiciones de uso, políticas de servicio y regulaciones de USA Shop Box.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Navegación Breadcrumb / Volver */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0A2647] uppercase tracking-widest transition-colors"
            >
              {/* ✅ Reemplazo de ArrowLeft por SVG nativo */}
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

          {/* Tarjeta de Contenido */}
          <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {/* Encabezado del Documento */}
            <div className="bg-[#0A2647]/5 p-8 md:p-12 border-b border-slate-100">
              <h1 className="text-3xl md:text-4xl font-black text-[#0A2647] mb-4 tracking-tighter uppercase">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                USA Shop Box
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Última actualización: Febrero 2026
              </p>
            </div>

            {/* Cuerpo del Texto Legal */}
            <div className="p-8 md:p-12 text-slate-600 leading-relaxed text-sm md:text-base space-y-8">
              {/* Intro / Datos */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs md:text-sm">
                <p>
                  <span className="font-bold text-slate-900">
                    Titular / Operador:
                  </span>{" "}
                  [Razón social], CUIT [●], con domicilio en [●] (en adelante,
                  “USA Shop Box”, “nosotros” o “la Plataforma”).
                </p>
                <p className="mt-2">
                  <span className="font-bold text-slate-900">Contacto:</span>{" "}
                  [email de soporte] – [whatsapp] – [domicilio]
                </p>
              </div>

              {/* 1) Aceptación */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  1) Aceptación
                </h3>
                <p>
                  Al acceder, registrarse, navegar, cotizar o comprar a través de
                  USA Shop Box, el usuario (el “Usuario”) declara haber leído y
                  aceptado estos Términos y Condiciones (“T&C”), junto con las
                  políticas complementarias (p. ej., Política de Privacidad,
                  Política de Devoluciones, y cualquier anexo operativo publicado
                  en la Plataforma). Si no está de acuerdo, debe abstenerse de
                  usar el servicio.
                </p>
              </section>

              {/* 2) Qué es USA Shop Box */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  2) Qué es USA Shop Box y cuál es nuestro rol
                </h3>
                <p className="mb-3">
                  USA Shop Box es una plataforma de consumo + tecnología que
                  permite a Usuarios en Argentina acceder a productos ofrecidos
                  por vendedores/retailers del exterior (por ejemplo,
                  marketplaces y tiendas de EE. UU.), gestionando el flujo de
                  compra internacional, logística, nacionalización (cuando
                  corresponda) y entrega final.
                </p>
                <p className="mb-3">Según el producto y el flujo de compra:</p>
                <ul className="list-disc list-inside pl-4 space-y-1 mb-3">
                  <li>
                    Podemos actuar como intermediario/gestor de la compra
                    internacional (facilitando el acceso y la gestión).
                  </li>
                  <li>
                    Como prestador de servicios (gestión operativa, logística,
                    seguimiento, atención, etc.).
                  </li>
                </ul>
                <p className="font-medium text-slate-800">
                  USA Shop Box no fabrica los productos y, salvo indicación
                  expresa en la publicación o comprobante, no es el fabricante
                  ni otorga garantías de fábrica por cuenta propia.
                </p>
                <p className="mt-2 italic text-xs text-slate-400">
                  Importante: la Plataforma prioriza curaduría, experiencia y
                  confiabilidad; la logística es una ventaja operativa “silenciosa”
                  del servicio.
                </p>
              </section>

              {/* 3) Capacidad */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  3) Capacidad, registro y cuenta
                </h3>
                <p>
                  Para comprar, el Usuario puede necesitar crear una cuenta con
                  datos veraces y completos. El Usuario es responsable por la
                  confidencialidad de sus credenciales y por toda actividad
                  realizada desde su cuenta. Podemos suspender o cancelar cuentas
                  ante uso fraudulento, incumplimientos o riesgos operativos.
                </p>
              </section>

              {/* 4) Productos */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  4) Productos, publicaciones y disponibilidad
                </h3>
                <p className="mb-2">
                  La información de publicaciones (título, descripción, imágenes,
                  compatibilidades, talles, colores, variaciones, stock, etc.)
                  puede provenir de fuentes externas (vendedores/retailers).
                </p>
                <p>
                  La disponibilidad y el precio pueden variar hasta el momento
                  efectivo de compra/confirmación. En ciertos casos, el sistema
                  puede permitir la compra y luego informarse indisponibilidad;
                  de ocurrir, USA Shop Box podrá: (i) gestionar alternativa
                  equivalente; o (ii) cancelar y reembolsar conforme estos T&C.
                </p>
              </section>

              {/* 5) Precios */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  5) Precios, moneda, impuestos, aduana y costos de envío
                </h3>

                <h4 className="font-bold text-slate-900 mt-4 mb-2">
                  5.1 Composición del precio
                </h4>
                <p className="mb-2">
                  El importe que ve el Usuario puede incluir (según corresponda):
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1 mb-4">
                  <li>Precio del producto.</li>
                  <li>Impuestos (p. ej. IVA u otros).</li>
                  <li>Flete internacional y logística nacional.</li>
                  <li>Costos de aduana/tasas.</li>
                  <li>Fee de gestión/seguro/servicio USA Shop Box.</li>
                </ul>

                <h4 className="font-bold text-slate-900 mt-4 mb-2">
                  5.2 Cotizaciones y tipo de cambio
                </h4>
                <p className="mb-4">
                  Si se muestran valores estimados en ARS, pueden calcularse con
                  un tipo de cambio de referencia/operativo indicado en checkout.
                  Las variaciones de tipo de cambio, impuestos o costos externos
                  pueden impactar en la cotización cuando aplique.
                </p>

                <h4 className="font-bold text-slate-900 mt-4 mb-2">
                  5.3 Aduana / restricciones
                </h4>
                <p>
                  El Usuario reconoce que ciertas compras internacionales pueden
                  estar sujetas a controles y regulaciones. Si un producto
                  resultara restringido o prohibido, USA Shop Box podrá cancelar
                  o retener la gestión hasta que se resuelva el cumplimiento
                  normativo.
                </p>
              </section>

              {/* 6) Compra y Pago */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  6) Proceso de compra y pago
                </h3>
                <p>
                  Al confirmar una compra, el Usuario realiza una orden sujeta a
                  verificación. Los pagos pueden procesarse por proveedores
                  externos (por ejemplo, Mercado Pago). La orden se considera
                  confirmada cuando el pago fue aprobado y la Plataforma lo
                  refleja como “confirmado”.
                </p>
              </section>

              {/* 7) Envíos */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  7) Envíos, plazos, seguimiento y entrega
                </h3>
                <ul className="space-y-3">
                  <li>
                    <span className="font-bold">7.1 Plazos:</span> Los plazos
                    informados son estimados y pueden variar por disponibilidad
                    del exterior, aduana o fuerza mayor.
                  </li>
                  <li>
                    <span className="font-bold">7.2 Seguimiento:</span> USA Shop
                    Box brindará tracking y estados operativos en la medida
                    disponible.
                  </li>
                  <li>
                    <span className="font-bold">7.3 Dirección:</span> El Usuario
                    debe cargar una dirección correcta y asegurar recepción.
                  </li>
                </ul>
              </section>

              {/* 8) Peso y Dimensiones */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  8) Peso, dimensiones y costos recalculados
                </h3>
                <p>
                  Si existieran diferencias relevantes en el peso real o
                  volumétrico, USA Shop Box podrá: (a) recalcular costos y
                  solicitar regularización; o (b) cancelar la orden y reembolsar,
                  descontando costos ya incurridos.
                </p>
              </section>

              {/* 9) Cancelaciones */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  9) Cancelaciones, reembolsos y créditos
                </h3>
                <p className="mb-2">
                  <span className="font-bold">Por el Usuario:</span> Si el
                  producto ya fue comprado o enviado, puede no ser cancelable o
                  implicar costos.
                </p>
                <p className="mb-2">
                  <span className="font-bold">Por USA Shop Box:</span> Podemos
                  cancelar órdenes por falta de stock, restricciones o
                  validaciones de seguridad.
                </p>
                <p>
                  <span className="font-bold">Reembolsos:</span> Se realizan al
                  mismo medio de pago o como crédito, según corresponda. En
                  devoluciones, pueden deducirse costos no recuperables (fletes,
                  tasas).
                </p>
              </section>

              {/* 10) Devoluciones */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  10) Devoluciones y cambios
                </h3>
                <p className="mb-2">
                  Las devoluciones dependen de si el vendedor/retailer exterior
                  las admite. El Usuario debe iniciar la solicitud dentro de los
                  [7] días corridos desde la recepción (o el plazo indicado).
                </p>
                <p className="text-sm bg-amber-50 text-amber-900 p-3 rounded-lg border border-amber-100">
                  <span className="font-bold">Exclusiones:</span> Por
                  higiene/seguridad, suelen excluirse perfumes, cosmética abierta,
                  productos personalizados, ropa interior, etc. El producto debe
                  volver sin uso y con embalaje original.
                </p>
              </section>

              {/* 11) Garantías */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  11) Garantías y reclamos por fallas
                </h3>
                <p>
                  La garantía corresponde al fabricante o vendedor del exterior.
                  USA Shop Box asistirá en la gestión, pero la resolución depende
                  de terceros. El Usuario debe reportar daños visibles o
                  faltantes dentro de las [48/72] horas de la entrega con
                  evidencia.
                </p>
              </section>

              {/* 12, 13, 14, 15 Legales varios */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#0A2647] uppercase">
                    12) Uso permitido y Propiedad Intelectual
                  </h3>
                  <p>
                    Está prohibido el fraude, reventa no autorizada, ingeniería
                    inversa o violación de derechos de propiedad intelectual.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A2647] uppercase">
                    13) Productos prohibidos
                  </h3>
                  <p>
                    USA Shop Box podrá rechazar órdenes de productos prohibidos
                    por ley o políticas aduaneras (armas, explosivos,
                    falsificaciones, etc.).
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A2647] uppercase">
                    14) Limitación de responsabilidad
                  </h3>
                  <p>
                    USA Shop Box no responde por actos de terceros fuera de su
                    control razonable. La responsabilidad total no excederá el
                    monto pagado por la orden.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A2647] uppercase">
                    15) Fuerza mayor
                  </h3>
                  <p>
                    No somos responsables por demoras o incumplimientos debidos a
                    causas de fuerza mayor (clima, huelgas, cambios regulatorios,
                    etc.).
                  </p>
                </div>
              </section>

              {/* Final */}
              <section className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-black text-[#0A2647] mb-2 uppercase tracking-tight">
                  Modificaciones y Ley Aplicable
                </h3>
                <p className="mb-2">
                  Podemos actualizar estos T&C. La versión vigente se publicará
                  en la Plataforma. El tratamiento de datos se rige por nuestra
                  Política de Privacidad.
                </p>
                <p className="font-bold">
                  Estos T&C se rigen por las leyes de la República Argentina.
                  Toda controversia será sometida a los tribunales competentes de
                  [CABA / domicilio del proveedor].
                </p>
              </section>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}