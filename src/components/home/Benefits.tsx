"use client";

import Image from "next/image";

type Step = {
  title: string;
  icon: string;
};

const STEPS: Step[] = [
  { title: "Elegís\n tu producto", icon: "/icons/how/bag.png" },
  { title: "Lo compramos\n en USA", icon: "/icons/how/usa-box.png" },
  { title: "Lo traemos\n a Argentina", icon: "/icons/how/van.png" },
  { title: "Lo recibís\n en tu casa", icon: "/icons/how/home.png" },
];

export default function HowItWorksInline() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Contenedor principal (más aire + gradiente sutil, Apple-ish) */}
        <div className="rounded-[28px] bg-gradient-to-b from-[#f7f9fc] to-white shadow-[0_14px_40px_rgba(2,12,27,0.08)]">
          <div className="px-6 py-14 sm:px-14 sm:py-20">
            {/* Título (más impacto, menos “bloque”) */}
            <h2 className="text-center text-[28px] font-extrabold tracking-tight text-[#0f2b46] sm:text-[40px]">
              <span className="block">Sin sorpresas.</span>
            </h2>

            {/* Steps */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-4 sm:gap-6">
              {STEPS.map((s, idx) => (
                <div key={idx} className="relative">
                  {/* Card (sin borde, más premium + hover microinteracción) */}
                  <div className="relative z-0 flex items-center gap-4 rounded-2xl bg-white px-5 py-5 shadow-[0_10px_30px_rgba(2,12,27,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(2,12,27,0.10)] sm:flex-col sm:gap-4 sm:px-6 sm:py-8">
                    <div className="relative mt-1 h-16 w-16 shrink-0 sm:h-[72px] sm:w-[72px]">
                      <Image
                        src={s.icon}
                        alt={s.title.replace(/\n/g, " ")}
                        fill
                        className="object-contain"
                        sizes="72px"
                        priority={idx === 0}
                      />
                    </div>

                    <div className="text-left sm:text-center">
                      <p className="whitespace-pre-line text-[16px] font-semibold leading-snug text-[#0f2b46] sm:text-[16px]">
                        {s.title}
                      </p>
                    </div>
                  </div>

                  {/* Conector (más premium que flecha: línea sutil) */}
                  {idx < STEPS.length - 1 ? (
                    <div className="pointer-events-none absolute right-[-20px] top-1/2 hidden -translate-y-1/2 sm:flex items-center">
                      <div className="h-px w-10 bg-[#e3e8f0]" />
                      <div className="ml-2 h-2 w-2 rounded-full bg-[#cfd8e3]" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Beneficios (más editorial, sin “caja pesada”) */}
            <div className="mt-12 flex justify-center">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-10">
                {/* Envíos */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex items-center justify-center rounded-full bg-[#e6eef8] text-[#0f2b46]">
                    {/* calendario */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-[#0f2b46] font-semibold text-[18px]">
                    Envíos en 5–10 días
                  </span>
                </div>

                {/* Separador tipo Apple */}
                <div className="hidden sm:block h-5 w-px bg-[#e3e8f0]" />

                {/* Precio final */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex items-center justify-center rounded-full bg-[#e6eef8] text-[#0f2b46]">
                    {/* check */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-[#0f2b46] font-semibold text-[18px]">
                    Precio final a la puerta de tu casa
                  </span>
                </div>
              </div>
            </div>

            {/* (Opcional) microcopy: si lo querés, lo dejamos muy sutil */}
            {/* <p className="mt-6 text-center text-sm text-slate-500">
              Operación propia en Miami y Argentina para reducir tiempos.
            </p> */}
          </div>
        </div>
      </div>
    </section>
  );
}