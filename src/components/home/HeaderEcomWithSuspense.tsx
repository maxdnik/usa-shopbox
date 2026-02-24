"use client";

import { Suspense } from "react";
import HeaderEcom from "@/components/home/HeaderEcom";

function HeaderEcomFallback() {
  // Fallback minimal (no rompe layout). Si querés lo hago más lindo.
  return (
    <div className="sticky top-0 z-50 w-full">
      <div
        className="w-full backdrop-blur-md"
        style={{
          background:
            "linear-gradient(180deg, #0A2647 0%, #0E2F57 60%, #0A2647 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.18)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 py-3 md:px-8">
          <div className="h-[52px] md:h-[56px]" />
        </div>
      </div>
    </div>
  );
}

export default function HeaderEcomWithSuspense() {
  return (
    <Suspense fallback={<HeaderEcomFallback />}>
      <HeaderEcom />
    </Suspense>
  );
}