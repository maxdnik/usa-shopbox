import Providers from "../providers";
import { PricingProvider } from "@/context/PricingContext";
import HeaderEcomWithSuspense from "@/components/home/HeaderEcomWithSuspense";
import Footer from "@/components/home/Footer";
import type { Metadata } from "next";
import Script from "next/script";

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
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1SQ78TJLDC"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1SQ78TJLDC');
        `}
      </Script>

      <Providers>
        <PricingProvider>
          <HeaderEcomWithSuspense />
          {children}
          <Footer />
        </PricingProvider>
      </Providers>
    </>
  );
}