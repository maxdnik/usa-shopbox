"use client";

import Image from "next/image";
import Link from "next/link";

export default function WinterSection() {
  return (
    <section className="w-full py-20">
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* 1️⃣ SNOWBOARD / SKI */}
        <div className="relative rounded-2xl overflow-hidden group">
          <Image
            src="/winter/ski.jpg"
            alt="Snowboard Ski"
            width={800}
            height={1000}
            className="object-cover w-full h-[520px] group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8">
            <h2 className="text-white text-3xl font-bold mb-2">
              SNOWBOARD / SKI
            </h2>
            <p className="text-white/90 mb-6">
              Conquer the mountain.
            </p>

            <Link href="/winter?category=ski">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full 
              bg-white text-[#0f2b46] font-semibold text-[16px] 
              shadow-sm hover:shadow-md transition-all duration-200">
                Explorar Snowboard & Ski
                <span>→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 2️⃣ OUTDOOR GEAR */}
        <div className="relative rounded-2xl overflow-hidden group">
          <Image
            src="/winter/outdoor.jpg"
            alt="Outdoor Gear"
            width={800}
            height={1000}
            className="object-cover w-full h-[520px] group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
            <h2 className="text-white text-3xl font-bold mb-2">
              OUTDOOR GEAR
            </h2>
            <p className="text-white/90 mb-6">
              Adventure-ready apparel.
            </p>

            <Link href="/winter?category=outdoor">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full 
              border border-white text-white font-semibold text-[16px]
              hover:bg-white hover:text-[#0f2b46] transition-all duration-200">
                Ver equipamiento outdoor
                <span>→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 3️⃣ CITY WINTER */}
        <div className="relative rounded-2xl overflow-hidden group">
          <Image
            src="/winter/city.jpg"
            alt="City Winter"
            width={800}
            height={1000}
            className="object-cover w-full h-[520px] group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-8">
            <h2 className="text-white text-3xl font-bold mb-2">
              CITY WINTER
            </h2>
            <p className="text-white/90 mb-6">
              Style for the urban cold.
            </p>

            <Link href="/winter?category=city-winter-women">
              <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full 
              bg-[#0f2b46] text-white font-semibold text-[16px]
              hover:bg-[#0c2136] transition-all duration-200">
                Descubrir colección invierno
                <span>→</span>
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}