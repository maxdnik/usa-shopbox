"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { HELP_CENTER_DATA } from "@/lib/help/help-data";
import { searchHelp } from "@/lib/help/help-search";

export default function HelpCenterInteractive() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchHelp(query, HELP_CENTER_DATA);
  }, [query]);

  return (
    <>
      {/* HERO azul con EL buscador real */}
      <div className="bg-[#0A2647] p-10 md:p-16 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tighter uppercase">
          ¿Cómo podemos ayudarte?
        </h1>
        <p className="text-white/60 text-sm mb-8 font-medium max-w-lg mx-auto">
          Encontrá respuestas rápidas sobre envíos, pagos, aduana y seguimiento de tus
          compras en USA.
        </p>

        {/* Input real */}
        <div className="max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-white/70 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar una pregunta (ej: aduana, tiempos...)"
          className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0A2647] text-white font-bold placeholder:font-medium placeholder:text-white/60 border border-white/60 outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-lg caret-white"
        />

          {/* ✅ Panel de resultados (solo si hay query) */}
          {query.trim() ? (
            <div className="absolute left-0 right-0 mt-3 z-20">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden text-left">
                {/* header mini (sin “Buscá una respuesta”, sin categorías) */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Resultados
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-xs font-black text-slate-400 hover:text-[#0A2647] uppercase tracking-widest transition-colors"
                  >
                    Limpiar
                  </button>
                </div>

                <div className="max-h-[420px] overflow-auto">
                  {results.length ? (
                    <div className="p-3 grid gap-2">
                      {results.slice(0, 8).map((r: any, idx: number) => {
                        const item = r?.item ?? r?.doc ?? r?.result ?? r;

                        const id =
                          item?.id ??
                          item?.slug ??
                          r?.id ??
                          r?.slug ??
                          `${idx}-${item?.title ?? "result"}`;

                        const title =
                          item?.title ??
                          item?.question ??
                          item?.q ??
                          item?.name ??
                          "Resultado";

                        const snippet =
                          item?.snippet ??
                          item?.answer ??
                          item?.description ??
                          item?.summary ??
                          "";

                        const link = item?.link ?? r?.link ?? null;

                        return (
                          <div
                            key={id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:border-slate-300 transition-colors"
                          >
                            <div className="font-black text-slate-900 text-sm md:text-base">
                              {title}
                            </div>

                            {snippet ? (
                              <div className="mt-1 text-sm text-slate-600 leading-relaxed">
                                {snippet}
                              </div>
                            ) : null}

                            {link ? (
                              <div className="mt-3">
                                <Link
                                  href={link.type === "internal" ? link.href : `/ayuda/${link.slug}`}
                                  className="inline-flex items-center gap-2 text-xs font-black text-[#0A2647] uppercase tracking-widest hover:text-emerald-600 transition-colors"
                                >
                                  {link.label ?? "Leer más"}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                  </svg>
                                </Link>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="text-sm font-black text-slate-900">
                        No encontramos resultados
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Probá con “aduana”, “seguimiento”, “cuotas” o “tiempos”.
                      </div>
                    </div>
                  )}
                </div>

                {/* footer mini */}
                <div className="px-4 py-3 border-t border-slate-100 bg-white">
                  <a
                    href="mailto:soporte@usashopbox.com"
                    className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#0A2647] uppercase tracking-widest transition-colors"
                  >
                    ¿No está? Escribinos a soporte
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 text-white/60 text-xs font-medium">
          Total final + seguimiento por etapas. Si algo requiere acción, te avisamos.
        </div>
      </div>

      {/* ✅ IMPORTANTE: eliminamos todo el bloque blanco de “Centro de Ayuda” */}
    </>
  );
}