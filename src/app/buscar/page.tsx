// src/app/buscar/page.tsx
import { Suspense } from "react";
import BuscarClient from "./BuscarClient";

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#061a33]" />}>
      <BuscarClient />
    </Suspense>
  );
}