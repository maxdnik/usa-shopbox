"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

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

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { status } = useSession();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      setLoading(true);
      const res = await fetch("/api/orders", { cache: "no-store" });
      const json = await res.json();
      const found = (json.orders || []).find((o: any) => o._id === orderId);
      setOrder(found || null);
      setLoading(false);
    })();
  }, [orderId, status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061a33] text-white p-8">
        Cargando orden...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#061a33] text-white p-8">
        <div className="max-w-2xl mx-auto bg-white text-black rounded-2xl p-6">
          <p>No encontramos esta orden.</p>
          <Link href="/dashboard/orders" className="text-blue-600 underline">
            Volver a Mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="min-h-screen bg-[#061a33] text-white p-6">
      <div className="max-w-3xl mx-auto bg-white text-black rounded-2xl p-8">
        <Link href="/dashboard/orders" className="text-blue-600 underline text-sm">
          ← Volver a Mis pedidos
        </Link>

        <h1 className="text-2xl font-bold mt-2 mb-6">
          Orden {order.orderNumber}
        </h1>

        {/* Datos principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-xs uppercase text-gray-500">Estado</p>
            <p className="font-semibold">{statusLabel(order.status)}</p>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-xs uppercase text-gray-500">Total</p>
            <p className="font-semibold text-green-700">
              USD {Number(order.totalUSD).toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-xs uppercase text-gray-500">Fecha</p>
            <p className="font-semibold">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Dirección snapshot */}
        {order.addressSnapshot && (
          <>
            <h2 className="text-lg font-semibold mb-2">Dirección de entrega</h2>
            <div className="bg-gray-50 border rounded-xl p-4 mb-6 text-sm">
              <p>
                {order.addressSnapshot.streetName}{" "}
                {order.addressSnapshot.streetNumber}
                {order.addressSnapshot.floor
                  ? `, Piso ${order.addressSnapshot.floor}`
                  : ""}
                {order.addressSnapshot.apartment
                  ? `, Depto ${order.addressSnapshot.apartment}`
                  : ""}
              </p>
              <p>
                {order.addressSnapshot.city},{" "}
                {order.addressSnapshot.province} (
                {order.addressSnapshot.postalCode})
              </p>
            </div>
          </>
        )}

        {/* Items */}
        <h2 className="text-lg font-semibold mb-3">Productos</h2>
        <div className="space-y-4">
          {items.map((it: any, idx: number) => (
            <div key={idx} className="flex justify-between border-b pb-3">
              <div className="flex gap-3">
                {it.image && (
                  <img
                    src={it.image}
                    alt={it.title}
                    className="w-14 h-14 object-contain bg-gray-50 border rounded"
                  />
                )}
                <div>
                  <p className="font-semibold">{it.title}</p>
                  <p className="text-sm text-gray-600">Cantidad: {it.qty}</p>
                </div>
              </div>
              <p className="font-semibold">
                USD {(it.priceUSD * it.qty).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
