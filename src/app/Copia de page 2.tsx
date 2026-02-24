import HeaderEcom from "@/components/home/HeaderEcom";
import HeroCarousel from "@/components/home/HeroCarousel"; // ✅ Usamos el Carrusel
import OfficialStores from "@/components/home/OfficialStores";
import ProductGrid from "@/components/home/ProductGrid";
import Benefits from "@/components/home/Benefits";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-[#22D3EE] selection:text-[#0A2647]">
      {/* 1. Navbar Global (Incluye Categorías) */}
      <HeaderEcom />

      <main className="flex-1">
        {/* 2. Hero Carousel Premium (Full Width) */}
        <HeroCarousel />

        {/* 3. Tiendas Oficiales (Full Width) */}
        <OfficialStores />

        {/* 4. Productos Destacados (Container interno) */}
        <ProductGrid />

        {/* 5. Beneficios */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-16">
          <Benefits />
        </div>
      </main>

      {/* Footer al final */}
      <Footer />
    </div>
  );
}