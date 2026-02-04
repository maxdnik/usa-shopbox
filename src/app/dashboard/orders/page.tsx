"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Mismo mapeo que en la página de detalle de orden
function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending_payment: "Pendiente de pago",
    paid: "Pagado",
    processing: "Procesando",
    shipped: "En tránsito",
    delivered: "Entregado",
    cancelled: "Cancelado",
    pending_processing: "Pendiente de procesamiento",
    in_miami_warehouse: "En Miami",
    in_transit: "En tránsito",
  };
  return map[status] || status.replaceAll("_", " ");
}

export default function OrdersPage() {
  const { status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No pudimos cargar tus pedidos.");
        }

        const json = await res.json();
        setOrders(json.orders || []);
      } catch (e: any) {
        console.error("Error cargando /api/orders:", e);
        setError(e.message || "Error cargando pedidos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const totalEnvios = orders.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis envíos</h1>
          <p className="text-sm text-white/70 mt-1">
            Acá vas a ver el estado de todos tus paquetes USAShopBox.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
          >
            Buscar productos
          </Link>
          <Link
            href="/carrito"
            className="rounded-xl bg-[#ff3347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff4d63] transition shadow"
          >
            Ir al carrito
          </Link>
        </div>
      </div>

      {/* Línea roja superior como en el diseño */}
      <div className="h-[3px] bg-[#ff3347] w-full rounded-full" />

      {/* Card principal */}
      <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Envíos activos</h2>
          <span className="text-sm text-slate-500">
            {totalEnvios} {totalEnvios === 1 ? "envío" : "envíos"}
          </span>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm text-slate-600">
            Cargando tus pedidos...
          </div>
        )}

        {error && !loading && (
          <div className="py-8 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && totalEnvios === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">No hay envíos todavía</p>
              <p className="text-sm text-slate-600 max-w-md">
                Cuando hagas una compra, vas a poder seguir acá cada etapa:
                compra en USA, arribo a Miami, vuelo a Argentina y entrega
                final.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Explorar productos
              </Link>
              <Link
                href="/carrito"
                className="rounded-xl bg-[#ff3347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff4d63] transition shadow"
              >
                Finalizar compra
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && totalEnvios > 0 && (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const items = order.items || [];
              const itemsCount =
                order.itemsCount ?? (Array.isArray(items) ? items.length : 0);

              return (
                <Link
                  key={order._id}
                  href={`/dashboard/orders/${order._id}`}
                  className="block rounded-xl border border-slate-200 px-4 py-3 hover:border-[#ff3347] hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Orden {order.orderNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-slate-600">
                        {itemsCount}{" "}
                        {itemsCount === 1 ? "producto" : "productos"} ·{" "}
                        {statusLabel(order.status)}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold">
                        USD {Number(order.totalUSD || 0).toFixed(2)}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
