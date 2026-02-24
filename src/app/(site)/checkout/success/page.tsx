// src/app/checkout/success/page.tsx
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#061a33]" />}>
      <SuccessClient />
    </Suspense>
  );
}