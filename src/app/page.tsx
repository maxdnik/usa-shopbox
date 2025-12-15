// src/app/page.tsx
import HeaderEcom from "@/components/home/HeaderEcom";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryBar from "@/components/home/CategoryBar";
import FeaturedStores from "@/components/home/FeaturedStores";
import ProductGrid from "@/components/home/ProductGrid";
import Benefits from "@/components/home/Benefits";

export default function HomePage() {
  return (
    <>
      <HeaderEcom />
      <main className="bg-[#f5f5f5] min-h-screen">
        <HeroBanner />
        <CategoryBar />
        <div className="max-w-6xl mx-auto px-4 pb-6">
          <FeaturedStores />
          <ProductGrid />
          <Benefits />
        </div>
      </main>
      <footer className="bg-[#0A2647] text-white mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} USAShopBox. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#ayuda" className="hover:underline">Ayuda</a>
            <a href="#terminos" className="hover:underline">Términos y condiciones</a>
            <a href="#contacto" className="hover:underline">Contacto</a>
          </div>
        </div>
      </footer>
    </>
  );
}
