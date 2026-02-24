// src/components/home/HeaderEcom.tsx
import { Suspense } from "react";
import HeaderEcomClient from "./HeaderEcomClient";

export default function HeaderEcom() {
  return (
    <Suspense fallback={null}>
      <HeaderEcomClient />
    </Suspense>
  );
}