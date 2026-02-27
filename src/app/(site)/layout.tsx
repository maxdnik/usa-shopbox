import Providers from "../providers";
import { PricingProvider } from "@/context/PricingContext";
import HeaderEcomWithSuspense from "@/components/home/HeaderEcomWithSuspense";
import Footer from "@/components/home/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/usa.png",
    shortcut: "/usa.png",
    apple: "/usa.png",
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <Providers>
    <PricingProvider>
      <HeaderEcomWithSuspense />
      {children}
      <Footer />
    </PricingProvider>
  </Providers>
  );
}