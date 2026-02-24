"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { PRICING_CONFIG_DEFAULT } from "@/lib/pricing-engine";

const PricingContext = createContext<any>(PRICING_CONFIG_DEFAULT);

export const PricingProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState(PRICING_CONFIG_DEFAULT);

  useEffect(() => {
    // Obtenemos la configuración real desde la API al cargar la web
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setConfig(data);
        }
      })
      .catch((err) => console.error("Error cargando pricing config:", err));
  }, []);

  return (
    <PricingContext.Provider value={config}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => useContext(PricingContext);