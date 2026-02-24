"use client";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F7F9FC] to-white pt-16 pb-20 md:pt-20 md:pb-22 px-4">
      {/* Elemento decorativo de fondo (Blur sutil) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col items-center text-center">
        
        {/* Headline */}
        <h1 
          className="text-5xl md:text-7xl font-black text-[#0A2647] tracking-tight leading-[1.1] max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-forwards"
          style={{ animationDelay: "100ms" }}
        >
          Comprá en USA. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2647] to-[#22D3EE]">
            Recibí en Argentina.
          </span>
        </h1>

      </div>
    </section>
  );
}