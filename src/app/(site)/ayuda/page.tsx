import type { Metadata } from "next";
import { Suspense } from "react";
import HelpPageClient from "./HelpPageClient";

export const metadata: Metadata = {
  title: "Centro de Ayuda | USA Shop Box",
  description: "Respuestas a tus preguntas frecuentes sobre envíos, aduana y compras.",
};

function PageFallback() {
  return <div className="min-h-screen bg-[#f5f5f5]" />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <HelpPageClient />
    </Suspense>
  );
}