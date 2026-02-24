"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, PanInfo, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";

// --- FUENTES ---
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "700"] });

// --- CONFIGURACIÓN & DATOS ---

interface SlideData {
  id: "filson" | "running" | "ross";
  image: string;
  logo?: string;
  logoWidth?: number;
  logoHeight?: number;
  preTitle?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
}

const slides: SlideData[] = [
  {
    id: "running",
    image: "/hero/run.jpg", // Asegúrate de que estas rutas existan o usa placeholders
    title: "RUN\nFASTER",
    subtitle: "Productos técnicos de alto rendimiento",
    buttonText: "Ver productos",
    href: "/running",
  },
  {
    id: "ross",
    image: "/hero/ross.jpg",
    logo: "/hero/ross-logo.png",
    logoWidth: 100,
    logoHeight: 26,
    title: "El Lujo\ndel Hallazgo",
    subtitle: "Designer finds seleccionados en USA",
    buttonText: "Explorar colección",
    href: "/tienda/ross",
  },
  {
    id: "filson",
    image: "/hero/filson.jpg",
    title: "FILSON: FOR THE LONG HAUL",
    subtitle: "Equipamiento diseñado para durar décadas",
    buttonText: "Explorar colección",
    href: "/tienda/filson",
  },
];

const AUTOPLAY_DELAY = 6000;
const TRANSITION_DURATION = 0.8;

// ✅ TIPADO CORRECTO: bezier como tupla (no number[])
const APPLE_EASE = [0.22, 1, 0.36, 1] as const;

// --- COMPONENTE PRINCIPAL ---

export default function HeroCarousel() {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const index = Math.abs(page % slides.length);
  const currentSlide = slides[index];

  // --- NAVEGACIÓN ---
  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    },
    [page]
  );

  const goToSlide = (idx: number) => {
    const direction = idx > index ? 1 : -1;
    setPage([idx, direction]);
  };

  // --- AUTOPLAY & PRELOAD ---
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    if (isPaused) return;
    resetTimeout();
    timeoutRef.current = setTimeout(() => paginate(1), AUTOPLAY_DELAY);
    return () => resetTimeout();
  }, [index, isPaused, paginate]);

  useEffect(() => {
    const nextIndex = (index + 1) % slides.length;
    const prevIndex = (index - 1 + slides.length) % slides.length;
    const preloadImage = (src: string) => {
      const img = new window.Image();
      img.src = src;
    };
    if (slides[nextIndex].image.startsWith("/")) preloadImage(slides[nextIndex].image);
    if (slides[prevIndex].image.startsWith("/")) preloadImage(slides[prevIndex].image);
  }, [index]);

  // --- SWIPE ---
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

  const handleDragEnd = (_e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) paginate(1);
    else if (swipe > swipeConfidenceThreshold) paginate(-1);
    setIsPaused(false);
  };

  // --- ESTILOS DINÁMICOS ---
  const getSlideStyles = (id: string) => {
    switch (id) {
      case "filson":
        return {
          overlay: "bg-gradient-to-r from-black/65 via-black/25 to-transparent",
          fontTitle: playfair.className,
          textClass: "text-white",
          titleSize: "text-[34px] md:text-[56px] font-medium tracking-tight leading-[1.1]",
          subClass: "text-white/85 font-normal",
          btnClass:
            "bg-white/10 border border-white/25 backdrop-blur-md text-white hover:bg-white/20 rounded-full px-8 py-4 font-medium flex items-center gap-2 group",
          align: "items-start",
        };
      case "running":
        return {
          overlay: "bg-gradient-to-r from-white/98 via-white/85 to-transparent",
          fontTitle: inter.className,
          textClass: "text-[#111]",
          titleSize: "text-[38px] md:text-[64px] font-extrabold tracking-tight leading-[0.95]",
          subClass: "text-gray-800 font-medium",
          btnClass:
            "bg-[#E85D2A] text-white hover:bg-[#d14f22] rounded-full px-8 py-4 font-bold shadow-[0_20px_40px_-10px_rgba(232,93,42,0.4)] text-[15px] flex items-center gap-2 group transform hover:-translate-y-1 transition-all",
          align: "items-start",
        };
      case "ross":
        return {
          overlay: "bg-gradient-to-r from-white/95 via-white/70 to-transparent",
          fontTitle: playfair.className,
          textClass: "text-[#1A1A1A]",
          titleSize: "text-[32px] md:text-[52px] font-medium leading-[1.1]",
          subClass: "text-gray-700 font-medium",
          btnClass:
            "bg-transparent border-2 border-black/10 text-[#1A1A1A] hover:bg-black/5 hover:border-black/20 rounded-full px-8 py-4 font-bold text-[14px] flex items-center gap-2 group",
          align: "items-start",
        };
      default:
        return {
          overlay: "bg-gradient-to-r from-black/40 via-black/10 to-transparent",
          fontTitle: inter.className,
          textClass: "text-white",
          titleSize: "text-[34px] md:text-[56px] font-semibold tracking-tight leading-[1.1]",
          subClass: "text-white/85",
          btnClass:
            "bg-white/10 border border-white/25 backdrop-blur-md text-white hover:bg-white/20 rounded-full px-8 py-4 font-medium flex items-center gap-2 group",
          align: "items-start",
        };
    }
  };

  const styles = getSlideStyles(currentSlide.id);

  // --- ANIMACIONES ---
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.05,
      zIndex: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.05,
    }),
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.7,
        ease: APPLE_EASE, // ✅ ahora es tupla tipada
      },
    },
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-gray-900 group"
      style={{ height: "clamp(550px, 75vh, 700px)" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") paginate(-1);
        if (e.key === "ArrowRight") paginate(1);
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: TRANSITION_DURATION },
            scale: { duration: TRANSITION_DURATION * 1.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        >
          <div className="relative w-full h-full">
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              priority={index === 0}
              className="object-cover pointer-events-none select-none"
              sizes="100vw"
              draggable={false}
            />
            <div className={`absolute inset-0 pointer-events-none ${styles.overlay}`} />
          </div>

          <div className={`absolute inset-0 flex items-center ${inter.className}`}>
            <div className="max-w-[1440px] mx-auto w-full px-6 md:px-20">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={contentVariants}
                className={`max-w-2xl flex flex-col gap-6 ${styles.align} ${styles.textClass}`}
              >
                {currentSlide.logo ? (
                  <div className="relative h-[28px] md:h-[32px] mb-2 w-auto">
                    <Image
                      src={currentSlide.logo}
                      alt={`${currentSlide.id} logo`}
                      height={32}
                      width={currentSlide.logoWidth || 120}
                      className="object-contain object-left h-full w-auto"
                    />
                  </div>
                ) : currentSlide.preTitle ? (
                  <span
                    className={`${inter.className} text-[#2A4E7A] font-bold tracking-[0.1em] text-sm uppercase mb-[-5px] block`}
                  >
                    {currentSlide.preTitle}
                  </span>
                ) : null}

                <h2 className={`whitespace-pre-line ${styles.fontTitle} ${styles.titleSize}`}>
                  {currentSlide.title}
                </h2>

                <p className={`text-lg md:text-xl max-w-lg leading-relaxed ${styles.subClass}`}>
                  {currentSlide.subtitle}
                </p>

                <Link
                  href={currentSlide.href}
                  className={`mt-4 ${styles.btnClass}`}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {currentSlide.buttonText}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none max-w-[1500px] mx-auto">
        <button
          onClick={() => paginate(-1)}
          className="pointer-events-auto w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all opacity-0 md:group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="pointer-events-auto w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all opacity-0 md:group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
              index === idx ? "w-8 bg-[#D72638]" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir a slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}