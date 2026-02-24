import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Reembolsos | USA Shop Box",
  description: "Política completa de reembolsos, cancelaciones y devoluciones.",
};

export default function RefundsPage() {
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
              {/* SVG Nativo */}
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
            {/* Encabezado */}
            <div className="bg-[#0A2647]/5 p-8 md:p-12 border-b border-slate-100">
              <h1 className="text-3xl md:text-4xl font-black text-[#0A2647] mb-4 tracking-tighter uppercase">
                POLÍTICA DE REEMBOLSOS
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                USA Shop Box
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Última actualización: [completar fecha]
              </p>
            </div>

            {/* Cuerpo del Texto Legal */}
            <div className="p-8 md:p-12 text-slate-700 leading-relaxed text-sm md:text-base space-y-10">
              <p className="italic font-medium text-slate-500 border-l-4 border-[#0A2647] pl-4">
                Esta Política complementa los Términos y Condiciones y aplica a
                todas las compras realizadas en USA Shop Box.
              </p>

              {/* 1) Principios clave */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  1) Principios clave del servicio
                </h3>
                <ul className="space-y-4">
                  <li>
                    <span className="font-bold text-slate-900">
                      Compra internacional inmediata:
                    </span>{" "}
                    una vez acreditado el pago, USA Shop Box procesa la compra
                    del producto en el exterior de forma inmediata.
                  </li>
                  <li>
                    <span className="font-bold text-slate-900">
                      No hay derecho de arrepentimiento:
                    </span>{" "}
                    el Usuario reconoce y acepta que USA Shop Box no ofrece
                    arrepentimiento ni cancelación “sin causa” posterior al
                    pago, atento a la naturaleza del servicio (compra
                    internacional + logística) y los costos que se generan de
                    manera inmediata.
                  </li>
                  <li>
                    <span className="font-bold text-slate-900">
                      Reembolsos en ARS por monto exacto cobrado:
                    </span>{" "}
                    cualquier reembolso se realiza en pesos argentinos por el
                    monto exacto cobrado en la orden, sin ajustes por variación
                    de tipo de cambio.
                  </li>
                </ul>
              </section>

              {/* 2) Cuándo corresponde */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  2) Cuándo corresponde un reembolso
                </h3>
                <p className="mb-4 text-slate-500">
                  USA Shop Box podrá otorgar reembolso (total o parcial)
                  únicamente en los siguientes supuestos:
                </p>
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      2.1 Imposibilidad de compra por causa externa
                    </h4>
                    <p>
                      Si el producto no puede comprarse en el exterior por falta
                      de stock, cancelación del vendedor o imposibilidad
                      operativa objetiva, USA Shop Box reembolsará al Usuario el
                      monto correspondiente, aplicando las deducciones del punto
                      4 si existieran costos ya incurridos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      2.2 Cancelación por USA Shop Box por razones operativas o
                      de seguridad
                    </h4>
                    <p>
                      Por ejemplo: validaciones antifraude, restricciones del
                      producto, imposibilidad logística, error material evidente
                      en la publicación o precio que impida la operación. En
                      estos casos se aplica reembolso según estado y costos
                      incurridos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      2.3 Doble cobro o cobro incorrecto comprobable
                    </h4>
                    <p>
                      Si se verifica un error de cobro atribuible a la
                      Plataforma, se reembolsa el excedente.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      2.4 No entrega por pérdida confirmada
                    </h4>
                    <p>
                      Si el paquete se declara perdido y el caso queda cerrado
                      por el operador logístico / carrier, USA Shop Box
                      reembolsará o compensará conforme a la cobertura aplicable
                      (ver punto 6).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      2.5 Producto incorrecto / faltantes / daño en tránsito
                    </h4>
                    <p>
                      Si el Usuario recibe un producto distinto al ordenado, con
                      faltantes o con daños atribuibles al transporte, USA Shop
                      Box evaluará el caso y podrá reembolsar o compensar según
                      corresponda y conforme evidencia y plazos (ver punto 5 y
                      6).
                    </p>
                  </div>
                </div>
              </section>

              {/* 3) Cuándo NO corresponde */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  3) Cuándo NO corresponde reembolso
                </h3>
                <p className="mb-4 text-slate-500">
                  No corresponde reembolso en los siguientes casos:
                </p>
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      3.1 Arrepentimiento o cambio de opinión
                    </h4>
                    <p>
                      El Usuario no tiene derecho a reembolso por
                      arrepentimiento, cambio de talle/color, preferencia
                      personal, o cualquier motivo no atribuible a un
                      incumplimiento o falla verificable.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      3.2 Imposibilidad o demora atribuible a Aduana/autoridades
                    </h4>
                    <p>
                      Demoras, inspecciones, aforos, retenciones, verificación
                      de mercadería o medidas administrativas de autoridades no
                      generan por sí solas derecho a reembolso.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      3.3 Datos incorrectos provistos por el Usuario
                    </h4>
                    <p>
                      Dirección errónea/incompleta, datos de contacto
                      incorrectos, rechazo de entrega o ausencia reiterada. Si
                      esto genera retorno, almacenaje o pérdida, los costos se
                      imputarán al Usuario y puede no haber reembolso.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      3.4 Uso indebido, apertura o falta de condiciones del
                      producto
                    </h4>
                    <p>
                      No aplica reembolso por productos usados, sin accesorios,
                      con embalaje faltante o con daños por mal uso.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      3.5 Productos no reembolsables por su naturaleza
                    </h4>
                    <p>
                      Ciertas categorías pueden ser no reembolsables por
                      higiene/seguridad o por políticas de origen (ver Anexo de
                      Productos No Reembolsables [LISTA]).
                    </p>
                  </div>
                </div>
              </section>

              {/* 4) Qué se reembolsa */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  4) Qué se reembolsa y qué puede deducirse
                </h3>
                <p className="mb-4 text-sm text-slate-500">
                  El precio de una orden puede estar compuesto por: Precio
                  Producto USA, IVA Importación, Flete Internacional, Aduana y
                  Tasas, Gestión y Seguro, Logística Nacional.
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900">4.1 Regla general</h4>
                    <p>
                      Se reembolsa solo lo que no haya sido efectivamente
                      ejecutado/incurrido.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      4.2 Conceptos no reembolsables si ya fueron
                      incurridos/pagados
                    </h4>
                    <ul className="list-disc list-inside pl-4 space-y-1 mt-2">
                      <li>
                        <span className="font-semibold">Aduana y Tasas:</span>{" "}
                        NO se reembolsan si los gastos de aduana/tasas ya fueron
                        pagados o generados.
                      </li>
                      <li>
                        <span className="font-semibold">IVA Importación:</span>{" "}
                        NO se reembolsa si el IVA de importación ya fue abonado
                        o generado.
                      </li>
                      <li>
                        <span className="font-semibold">Flete Internacional:</span>{" "}
                        si el envío internacional ya fue despachado o contratado
                        sin posibilidad de recuperación, puede no reembolsarse
                        total o parcialmente.
                      </li>
                      <li>
                        <span className="font-semibold">Logística Nacional:</span>{" "}
                        si el tramo nacional ya se ejecutó (o hubo reintentos
                        imputables al Usuario), puede no reembolsarse.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      4.3 Costos no recuperables
                    </h4>
                    <p>
                      USA Shop Box podrá deducir costos no recuperables tales
                      como: comisiones no reintegrables del procesador de pago,
                      retornos, almacenajes, reexpediciones, costos
                      administrativos extraordinarios, y/o cargos del
                      vendedor/transportista no reembolsables.
                    </p>
                  </div>
                </div>
              </section>

              {/* 5) Plazos */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  5) Plazos para reportar incidentes
                </h3>
                <p className="mb-3">
                  Para que el reclamo sea válido, el Usuario debe notificar:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2 mb-4">
                  <li>
                    <span className="font-bold">Daño visible / faltantes:</span>{" "}
                    dentro de 72 horas de la entrega, con fotos/video del
                    producto y del embalaje.
                  </li>
                  <li>
                    <span className="font-bold">Producto incorrecto:</span>{" "}
                    dentro de 72 horas de la entrega.
                  </li>
                  <li>
                    <span className="font-bold">No entrega / entrega fallida:</span>{" "}
                    dentro de 7 días desde la fecha estimada de entrega o desde
                    el último evento relevante de tracking.
                  </li>
                </ul>
                <p className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-sm font-medium">
                  Si el Usuario no reporta dentro de estos plazos, USA Shop Box
                  puede rechazar el reclamo por imposibilidad de verificación.
                </p>
              </section>

              {/* 6) Gestión y Seguro */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  6) Gestión y Seguro (cobertura por pérdida/daño + gestión)
                </h3>
                <p className="mb-3">
                  Cuando la orden incluya el concepto “Gestión y Seguro”, USA
                  Shop Box brindará asistencia en la gestión del reclamo y
                  aplicará la cobertura según las condiciones del servicio y/o
                  del operador logístico.
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2 mb-3">
                  <li>
                    La cobertura puede contemplar pérdida o daño en tránsito,
                    sujeto a: evidencia, validación del caso, y cierre por parte
                    del carrier/operador.
                  </li>
                  <li>
                    <span className="font-bold">Tope de cobertura:</span>{" "}
                    [TOPE / CONDICIÓN].
                  </li>
                  <li>
                    USA Shop Box podrá optar por: (i) reembolso, (ii) reposición,
                    o (iii) crédito, según disponibilidad y viabilidad
                    operativa.
                  </li>
                </ul>
              </section>

              {/* 7) Forma de reembolso */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  7) Forma de reembolso
                </h3>
                <ul className="list-disc list-inside pl-4 space-y-2">
                  <li>
                    Los reembolsos se realizan en ARS, por el monto exacto
                    cobrado en la orden (neto de deducciones aplicables).
                  </li>
                  <li>
                    Se reembolsa al mismo medio de pago utilizado, o como crédito
                    en cuenta si se ofrece y el Usuario lo acepta.
                  </li>
                  <li>
                    Los tiempos de acreditación dependen del procesador de pago
                    y del banco/emisor.
                  </li>
                </ul>
              </section>

              {/* 8) Solicitud */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  8) Cómo solicitar un reembolso
                </h3>
                <p className="mb-3">
                  El Usuario debe contactar a soporte: [email soporte] /
                  [whatsapp] e indicar:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1 mb-3">
                  <li>número de orden,</li>
                  <li>motivo del reclamo,</li>
                  <li>fotos/video y documentación,</li>
                  <li>dirección y datos actualizados.</li>
                </ul>
                <p>USA Shop Box puede pedir información adicional para verificar.</p>
              </section>

              {/* 9) Prevención de fraude */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  9) Prevención de fraude
                </h3>
                <p>
                  USA Shop Box puede rechazar, suspender o demorar un reembolso
                  ante indicios razonables de fraude, abuso de políticas o
                  inconsistencias con tracking/evidencia.
                </p>
              </section>

              {/* 10) Actualizaciones */}
              <section>
                <h3 className="text-lg font-black text-[#0A2647] mb-4 uppercase tracking-tight border-b border-slate-100 pb-2">
                  10) Actualizaciones
                </h3>
                <p>
                  USA Shop Box puede modificar esta Política. La versión vigente
                  será la publicada en la Plataforma.
                </p>
              </section>

              {/* Anexo A */}
              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-8">
                <h3 className="text-base font-black text-[#0A2647] uppercase tracking-widest mb-4">
                  Anexo A – Productos No Reembolsables [LISTA]
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    higiene personal / cosmética abierta
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    perfumes y aerosoles (si aplica)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    consumibles (alimentos, suplementos)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    ropa interior / trajes de baño sin precinto
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    productos personalizados o a medida
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    tarjetas/regalos digitales
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    software / licencias activadas
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