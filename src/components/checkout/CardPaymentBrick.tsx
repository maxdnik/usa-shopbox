"use client";
import { useEffect, useRef, useState } from "react";

interface BrickProps {
  amount: number;
  payerEmail: string;
  // ✅ FIX 1: Definimos que onPaySuccess recibe un objeto (la respuesta del backend)
  onPaySuccess: (paymentResult: any) => void; 
  onError: (msg: string) => void;
  paymentData: any; 
}

export default function CardPaymentBrick({ amount, payerEmail, onPaySuccess, onError, paymentData }: BrickProps) {
  const controllerRef = useRef<any>(null);
  const [loadingBrick, setLoadingBrick] = useState(true);

  useEffect(() => {
    // 1. Intervalo para esperar a que window.MercadoPago exista
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.MercadoPago) {
        clearInterval(interval);
        initBrick();
      }
    }, 200);

    // Timeout de seguridad (5 seg)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.MercadoPago) {
        setLoadingBrick(false);
        onError("No se pudo cargar Mercado Pago. Revisa tu conexión.");
      }
    }, 5000);

    const initBrick = async () => {
      try {
        // Limpieza de instancia previa si existe
        if (controllerRef.current) {
          try { controllerRef.current.unmount(); } catch (e) {}
        }

        // ✅ USAMOS TU PUBLIC KEY ESPECÍFICA AQUÍ
        const mp = new window.MercadoPago(
          "APP_USR-b0c78531-504a-4a73-ad56-78c99032fc8a", 
          { locale: "es-AR" }
        );

        const bricksBuilder = mp.bricks();

        console.log("Iniciando Brick con monto:", amount);

        controllerRef.current = await bricksBuilder.create(
          "cardPayment",
          "paymentBrick_container",
          {
            initialization: {
              amount: amount,
              payer: {
                email: payerEmail,
              },
            },
            customization: {
              visual: {
                style: {
                  theme: "default", 
                },
              },
              paymentMethods: {
                maxInstallments: 6,
              },
            },
            callbacks: {
              onReady: () => {
                console.log("✅ Brick listo");
                setLoadingBrick(false);
              },
              onSubmit: async (cardFormData: any) => {
                console.log("Procesando pago...");
                try {
                  const res = await fetch("/api/process-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...cardFormData,
                      ...paymentData 
                    }),
                  });

                  const result = await res.json();

                  if (result.status === "approved" || result.ok) {
                    // ✅ FIX 2: Pasamos 'result' (que tiene orderId y orderNumber) al padre
                    onPaySuccess(result);
                  } else {
                    onError(`Pago rechazado: ${result.message || "Intente con otra tarjeta"}`);
                  }
                } catch (error) {
                  console.error(error);
                  onError("Error de conexión al procesar el pago.");
                }
              },
              onError: (error: any) => {
                console.error("Error en Brick:", error);
                onError("Error interno en la pasarela de pagos.");
              },
            },
          }
        );
      } catch (e) {
        console.error("Error fatal al crear Brick:", e);
        onError("Error de configuración de pagos.");
      }
    };

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (controllerRef.current) {
        try { controllerRef.current.unmount(); } catch (e) {}
      }
    };
  }, [amount, payerEmail, onPaySuccess, onError, paymentData]);

  return (
    <div className="w-full">
      {loadingBrick && (
        <div className="text-center py-4 text-slate-400 text-xs font-bold uppercase animate-pulse">
          Cargando pasarela de pagos...
        </div>
      )}
      <div id="paymentBrick_container" />
    </div>
  );
}