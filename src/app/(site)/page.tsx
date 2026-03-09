import type { Metadata } from "next";
import WinterSection from "@/components/home/WinterSection";
import Hero from "@/components/home/Hero";
import HeroCarousel from "@/components/home/HeroCarousel";
import OfficialStores from "@/components/home/OfficialStores";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Benefits from "@/components/home/Benefits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-16">
        <WinterSection /> 
          <OfficialStores />
          <div className="w-full">
            <HeroCarousel />
          </div>
          <FeaturedProducts />
          <Benefits />
        </div>
      </main>
    </div>
  );
}