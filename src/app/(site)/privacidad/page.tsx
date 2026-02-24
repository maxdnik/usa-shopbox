import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | USA Shop Box",
  description:
    "Cómo recopilamos, usamos y protegemos tus datos personales en USA Shop Box.",
};

export default function PrivacyPage() {
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
              {/* SVG nativo para evitar errores de librería */}
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
                Política de Privacidad
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                USA Shop Box
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Última actualización: [completar fecha]
              </p>
            </div>

            {/* Cuerpo del Texto Legal */}
            <div className="p-8 md:p-12 text-slate-600 leading-relaxed text-sm md:text-base space-y-10">
              {/* Intro / Responsable */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs md:text-sm space-y-2">
                <p>
                  <span className="font-bold text-slate-900">
                    Responsable del tratamiento (Titular/Operador):
                  </span>{" "}
                  [Razón social], CUIT [●], domicilio en [●], República Argentina
                  (en adelante, “USA Shop Box”, “nosotros” o “la Plataforma”).
                </p>
                <p>
                  <span className="font-bold text-slate-900">
                    Contacto de privacidad:
                  </span>{" "}
                  [email privacidad] / [whatsapp soporte] / [domicilio]
                </p>
                <p className="pt-2 italic text-slate-500">
                  Esta Política describe cómo recopilamos, usamos, almacenamos,
                  compartimos y protegemos los datos personales de quienes usan
                  USA Shop Box (el “Usuario”), y los derechos que pueden ejercer.
                </p>
              </div>

              {/* 1) Alcance */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  1) Alcance y aceptación
                </h3>
                <p className="mb-2">
                  Esta Política aplica a los datos personales tratados a través
                  de:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1 mb-3">
                  <li>El sitio web y/o app de USA Shop Box.</li>
                  <li>Formularios, checkouts y atención al cliente.</li>
                  <li>
                    Comunicaciones por email, WhatsApp u otros canales vinculados
                    a la operación.
                  </li>
                </ul>
                <p className="font-medium">
                  El uso de la Plataforma implica la aceptación de esta Política
                  y de los Términos y Condiciones.
                </p>
              </section>

              {/* 2) Datos Recopilados */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  2) Datos personales que recopilamos
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      2.1 Datos de identificación y contacto
                    </h4>
                    <p>
                      Nombre y apellido, DNI/CUIT/CUIL (cuando corresponda),
                      fecha de nacimiento (si aplica), email, teléfono, dirección
                      de entrega y facturación.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">2.2 Datos de cuenta</h4>
                    <p>
                      Usuario, contraseña (almacenada de forma cifrada/hasheada),
                      preferencias.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      2.3 Datos de compra y operación
                    </h4>
                    <p>
                      Productos consultados o comprados, carrito, órdenes,
                      historial, reclamos, información necesaria para logística,
                      aduana y entrega (según el caso).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">2.4 Datos de pago</h4>
                    <p>
                      No almacenamos datos completos de tarjeta si el pago se
                      procesa mediante terceros (p. ej., Mercado Pago). Sí
                      podemos guardar datos relacionados a la transacción:
                      estado, identificadores, medio de pago (parcial), monto,
                      fecha y comprobantes.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      2.5 Datos técnicos y de navegación
                    </h4>
                    <p>
                      IP, identificadores de dispositivo, navegador, sistema
                      operativo, logs, eventos de uso, cookies/tecnologías
                      similares, métricas para analítica y prevención de fraude.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">2.6 Comunicaciones</h4>
                    <p>
                      Mensajes y archivos que nos envíes (emails, WhatsApp,
                      formularios, chats) para soporte, gestión de pedidos o
                      reclamos.
                    </p>
                  </div>

                  <p className="text-xs bg-slate-50 p-3 rounded border border-slate-100 italic">
                    <span className="font-bold">Dato sensible:</span> no te
                    pedimos datos sensibles (salud, religión, orientación, etc.).
                    Si el Usuario los comparte voluntariamente por un canal de
                    soporte, se tratarán solo en la medida necesaria para
                    responder.
                  </p>
                </div>
              </section>

              {/* 3) Finalidades */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-3 uppercase tracking-tight">
                  3) Finalidades del tratamiento
                </h3>
                <ul className="space-y-3">
                  <li>
                    <span className="font-bold">3.1 Prestación del servicio:</span>{" "}
                    Crear y administrar cuentas, procesar órdenes, compras,
                    facturación y entrega, gestionar logística, seguimiento y
                    atención postventa, prevenir usos indebidos y mejorar
                    seguridad.
                  </li>
                  <li>
                    <span className="font-bold">3.2 Atención al cliente y calidad:</span>{" "}
                    Responder consultas, reclamos, devoluciones y garantías,
                    registrar interacciones para trazabilidad.
                  </li>
                  <li>
                    <span className="font-bold">3.3 Cumplimiento legal y regulatorio:</span>{" "}
                    Cumplir obligaciones fiscales, contables y regulatorias,
                    atender requerimientos de autoridades competentes.
                  </li>
                  <li>
                    <span className="font-bold">3.4 Prevención de fraude y seguridad:</span>{" "}
                    Detectar operaciones sospechosas, abuso de la Plataforma o
                    accesos no autorizados, proteger al Usuario y a USA Shop Box.
                  </li>
                  <li>
                    <span className="font-bold">3.5 Marketing y comunicaciones:</span>{" "}
                    Enviar información operativa (confirmaciones, tracking).
                    Enviar comunicaciones comerciales solo si corresponde por
                    consentimiento o relación previa, y siempre con opción de
                    baja.
                  </li>
                  <li>
                    <span className="font-bold">3.6 Analítica y mejora del producto:</span>{" "}
                    Medir performance, entender navegación, mejorar UX,
                    estadísticas agregadas.
                  </li>
                </ul>
              </section>

              {/* ...tu resto del texto legal sigue igual... */}

              {/* 15) Contacto Final */}
              <section className="bg-[#0A2647] text-white p-8 rounded-2xl">
                <h3 className="text-lg font-black uppercase tracking-widest mb-4">
                  15) Contacto
                </h3>
                <p className="mb-4 text-white/80">
                  Para consultas sobre privacidad o ejercicio de derechos:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-bold text-emerald-400">Email:</span>{" "}
                    [email privacidad]
                  </li>
                  <li>
                    <span className="font-bold text-emerald-400">Domicilio:</span>{" "}
                    [●]
                  </li>
                  <li>
                    <span className="font-bold text-emerald-400">
                      Razón social / CUIT:
                    </span>{" "}
                    [●]
                  </li>
                </ul>
              </section>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}