import Hero from "@/components/home/Hero";
import HeroCarousel from "@/components/home/HeroCarousel";
import OfficialStores from "@/components/home/OfficialStores";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Benefits from "@/components/home/Benefits";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/usa.png",
    shortcut: "/usa.png",
    apple: "/usa.png",
  },
};
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-[#22D3EE] selection:text-[#0A2647]">
      <main className="flex-1">
        <Hero />
        <OfficialStores />
        <div className="w-full">
          <HeroCarousel />
        </div>
        <FeaturedProducts />
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-16">
          <Benefits />
        </div>
      </main>
    </div>
  );
}