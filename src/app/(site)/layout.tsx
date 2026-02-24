import Providers from "../providers";
import { PricingProvider } from "@/context/PricingContext";
import HeaderEcomWithSuspense from "@/components/home/HeaderEcomWithSuspense";
import Footer from "@/components/home/Footer";

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