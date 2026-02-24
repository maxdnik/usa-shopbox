import { Suspense } from "react";
import CartPageClient from "./CartPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f5]" />}>
      <CartPageClient />
    </Suspense>
  );
}