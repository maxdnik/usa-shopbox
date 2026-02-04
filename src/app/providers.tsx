"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// ajustá el path si tu CartContext está en otro lugar
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
