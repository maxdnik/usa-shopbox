"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone } from "lucide-react";

/**
 * ✅ Payment logos (URLs externas)
 * Nota: si querés usar next/image, tendrías que whitelistear dominios en next.config.js.
 */
const paymentMethods = [
  {
    name: "Visa",
    src: "https://cdn.simpleicons.org/visa/1A1F71",
    css: "object-contain",
  },
  {
    name: "Mastercard",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
    css: "object-contain",
  },
  {
    name: "Amex",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg",
    css: "object-contain scale-110",
  },
  {
    name: "Mercado Pago",
    src: "https://cdn.simpleicons.org/mercadopago/009EE3",
    css: "object-contain scale-90",
  },
];

// ✅ Links con rutas reales
const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Buscar Productos", href: "/buscar-productos" },
  { label: "Mi Carrito", href: "/carrito" },
  { label: "Seguimiento", href: "/seguimiento" },
];

const helpLinks = [
  { label: "Centro de Ayuda", href: "/ayuda" },
  { label: "Términos y Condiciones", href: "/terminos" },
  { label: "Política de Privacidad", href: "/privacidad" },
  { label: "Política de Reembolsos", href: "/reembolsos" },
];

export default function Footer() {
  const easePremium = "cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <footer className="relative w-full pt-1 pb-1 overflow-hidden font-sans bg-[#041226]">
      {/* ================= 1) FONDO GLOBAL CINEMATIC ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06172E] via-[#0A2647] to-[#041226]" />

        {/* Grain Texture (SVG inline) */}
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Light streaks globales (muy sutiles) */}
        <div className="absolute top-[25%] left-0 w-full h-[1px] bg-white/[0.12] blur-[16px]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
        <div className="absolute bottom-[25%] left-0 w-full h-[1px] bg-white/[0.12] blur-[16px]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        </div>
      </div>

      {/* ================= 2) GLASS PANEL CONTAINER (más ancho) ================= */}
      <div className="relative z-10 mx-auto w-[calc(100%-16px)] md:w-[calc(100%-32px)] lg:w-[calc(100%-40px)] max-w-[1600px]">
        <div
          className="relative overflow-hidden transition-all duration-500 w-full"
          style={{
            background: "rgba(255,255,255,0.035)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
            borderRadius: "22px",
          }}
        >
          {/* ================= LIGHT STREAKS ANCLADOS AL CARD (TOP / BOTTOM) ================= */}
          {/* TOP */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]">
            <div
              className="absolute inset-0 opacity-70 blur-[10px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.20) 35%, rgba(180,220,255,0.60) 50%, rgba(255,255,255,0.20) 65%, rgba(255,255,255,0) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.40) 50%, rgba(255,255,255,0.10) 60%, rgba(255,255,255,0) 100%)",
              }}
            />
          </div>

          {/* BOTTOM */}
          <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px]">
            <div
              className="absolute inset-0 opacity-60 blur-[10px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 35%, rgba(180,220,255,0.55) 50%, rgba(255,255,255,0.18) 65%, rgba(255,255,255,0) 100%)",
              }}
            />
          </div>

          {/* ================= CONTENIDO ================= */}
          <div className="px-6 py-8 md:px-8 md:py-9 lg:px-10 lg:py-10">
            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 md:gap-y-8 md:gap-x-6 lg:gap-x-10">
              {/* --- COLUMNA 1: BRAND --- */}
              <div className="flex flex-col gap-5 md:pr-4">
                <div>
                  <h2 className="text-[26px] md:text-[28px] font-extrabold text-white tracking-tight leading-none mb-4 drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
                    USA SHOP BOX
                  </h2>
                  <p className="text-[14px] md:text-[15px] leading-relaxed text-white/70 font-medium max-w-[280px]">
                    Tu puerta de acceso a las mejores tiendas de Estados Unidos
                    desde la comodidad de tu hogar.
                  </p>
                </div>

                {/* SOCIAL BUTTONS */}
                <div className="flex gap-3">
                  {[
                    { Icon: Instagram, href: "#" },
                    { Icon: Facebook, href: "#" },
                    { Icon: Twitter, href: "#" },
                  ].map(({ Icon, href }, i) => (
                    <Link
                      key={i}
                      href={href}
                      className="group relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 hover:-translate-y-1"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        borderColor: "rgba(255,255,255,0.10)",
                        backdropFilter: "blur(10px)",
                        transitionTimingFunction: easePremium,
                      }}
                    >
                      <span className="sr-only">Social Link</span>
                      <Icon
                        className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-300"
                        strokeWidth={1.5}
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)]" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* --- COLUMNA 2: NAVEGACIÓN --- */}
              <div className="flex flex-col gap-5 md:pl-8 md:border-l border-white/[0.05]">
                <h3 className="text-[12px] font-bold text-white/[0.38] tracking-[0.2em] uppercase">
                  Navegación
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {navLinks.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-[14px] md:text-[15px] font-medium text-white/[0.78] transition-all duration-300 block w-fit hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* --- COLUMNA 3: AYUDA --- */}
              <div className="flex flex-col gap-5 md:pl-8 md:border-l border-white/[0.05]">
                <h3 className="text-[12px] font-bold text-white/[0.38] tracking-[0.2em] uppercase">
                  Ayuda
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {helpLinks.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-[14px] md:text-[15px] font-medium text-white/[0.78] transition-all duration-300 block w-fit hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* --- COLUMNA 4: CONTACTO --- */}
              <div className="flex flex-col gap-5 md:pl-8 md:border-l border-white/[0.05]">
                <h3 className="text-[12px] font-bold text-white/[0.38] tracking-[0.2em] uppercase">
                  Contacto
                </h3>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 group">
                    <MapPin className="w-4 h-4 mt-0.5 text-[#22D3EE] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] shrink-0" />
                    <span className="text-[14px] text-white/[0.78] font-medium leading-relaxed group-hover:text-white transition-colors">
                      Miami, FL - USA
                      <br />
                      Buenos Aires - ARG
                    </span>
                  </li>
                  <li className="flex items-center gap-3 group">
                    <Mail className="w-4 h-4 text-[#22D3EE] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] shrink-0" />
                    <a
                      href="mailto:hola@usashopbox.com"
                      className="text-[14px] text-white/[0.78] font-medium group-hover:text-white transition-colors"
                    >
                      hola@usashopbox.com
                    </a>
                  </li>
                  <li className="flex items-center gap-3 group">
                    <Phone className="w-4 h-4 text-[#22D3EE] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] shrink-0" />
                    <a
                      href="tel:+15551234567"
                      className="text-[14px] text-white/[0.78] font-medium group-hover:text-white transition-colors"
                    >
                      +1 (555) 123-4567
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* ================= FILA INFERIOR ================= */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[12px] md:text-[13px] text-white/[0.35] font-medium text-center md:text-left tracking-wide">
                © 2026 USA Shop Box. Todos los derechos reservados.
              </p>

              {/* Payment logos group + glow base */}
              <div className="relative flex items-center gap-3 flex-wrap justify-center">
                {/* glow “suelo” bajo los logos */}
                <div
                  className="pointer-events-none absolute -inset-x-10 -bottom-8 h-14 opacity-30 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle at 70% 50%, rgba(180,220,255,0.40), transparent 65%)",
                  }}
                />

                {paymentMethods.map((p) => (
                  <div
                    key={p.name}
                    className="relative h-10 w-[64px] rounded-[10px] flex items-center justify-center p-2 overflow-visible transition-transform duration-300 hover:-translate-y-1"
                    title={p.name}
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Top highlight */}
                    <div
                      className="pointer-events-none absolute left-1 right-1 top-1 h-[10px] rounded-[8px] opacity-60"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0))",
                      }}
                    />

                    {/* Logo */}
                    <img
                      src={p.src}
                      alt={p.name}
                      className={`w-full h-full ${p.css}`}
                    />

                    {/* Mirror reflection (sutil) */}
                    <div
                      className="pointer-events-none absolute left-1 right-1 -bottom-[14px] h-[14px] rounded-[10px] opacity-25 blur-[1px]"
                      style={{ background: "rgba(255,255,255,0.28)" }}
                    />
                    <div
                      className="pointer-events-none absolute left-1 right-1 -bottom-[18px] h-[18px] opacity-35"
                      style={{
                        transform: "scaleY(-1)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0))",
                        maskImage:
                          "linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0))",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0))",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}