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

function formatDateTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

type OrderItem = {
  title: string;
  qty: number;
  priceUSD: number;
  image?: string;
};

type AddressSnapshot = {
  streetName: string;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
};

type Tracking = {
  miamiAt?: string;
  transitAt?: string;
  deliveredAt?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  status: string;
  totalUSD: number;
  createdAt: string;
  items: OrderItem[];
  addressSnapshot?: AddressSnapshot;
  tracking?: Tracking;
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { status: sessionStatus } = useSession();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No se pudieron cargar tus pedidos.");
        }

        const json = await res.json();
        const found = (json.orders || []).find(
          (o: Order) => o._id === orderId
        );

        if (!found) {
          setOrder(null);
          setError("No encontramos esta orden.");
        } else {
          setOrder(found);
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "No pudimos cargar el detalle de tu pedido.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId, sessionStatus]);

  // --------- estados de carga / error ---------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061a33] text-white p-8">
        Cargando orden...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#061a33] text-white p-8">
        <div className="max-w-2xl mx-auto bg-white text-black rounded-2xl p-6">
          <p className="mb-4">
            {error || "No pudimos cargar el detalle de tu pedido."}
          </p>
          <p className="text-sm text-gray-600 mb-2">ID:</p>
          <div className="bg-gray-100 px-4 py-2 rounded font-mono text-gray-500 mb-4">
            {orderId}
          </div>
          <Link href="/dashboard/orders" className="text-blue-600 underline">
            Volver a Mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  // --------- datos derivados ---------

  const items = order.items || [];
  const tracking = order.tracking || {};
  const createdAt = formatDateTime(order.createdAt);
  const miamiDate = formatDateTime(tracking.miamiAt);
  const transitDate = formatDateTime(tracking.transitAt);
  const deliveredDate = formatDateTime(tracking.deliveredAt);

  return (
    <div className="min-h-screen bg-[#061a33] text-white p-6">
      <div className="max-w-3xl mx-auto bg-white text-black rounded-2xl p-8">
        <Link
          href="/dashboard/orders"
          className="text-blue-600 underline text-sm"
        >
          ← Volver a Mis pedidos
        </Link>

        <h1 className="text-2xl font-bold mt-2 mb-6">Orden</h1>

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
              {createdAt || new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Seguimiento de envío */}
        <div className="bg-gray-50 border rounded-2xl p-5 mb-6">
          <h2 className="text-base font-semibold mb-1">
            Seguimiento de tu envío
          </h2>
          <p className="text-xs text-gray-600 mb-4">
            Vamos actualizando las etapas a medida que tu paquete avanza desde
            USA hasta Argentina.
          </p>

          <div className="flex flex-col gap-3 text-sm">
            <TrackingStep
              done={true}
              title="Compra en USA"
              description="Tu compra fue confirmada en la tienda de Estados Unidos."
              dateLabel={createdAt ? `Realizada el ${createdAt}` : undefined}
            />
            <TrackingStep
              done={!!tracking.miamiAt}
              title="Depósito en Miami"
              description="Tu paquete llegó a nuestro warehouse en Miami."
              dateLabel={miamiDate ? `Registrado el ${miamiDate}` : undefined}
            />
            <TrackingStep
              done={!!tracking.transitAt}
              title="Vuelo a Argentina"
              description="Tu paquete está viajando desde Miami hacia Argentina."
              dateLabel={transitDate ? `Enviado el ${transitDate}` : undefined}
            />
            <TrackingStep
              done={!!tracking.deliveredAt}
              title="En Argentina / Entrega"
              description="Tu paquete está en Argentina, en proceso de entrega o ya entregado."
              dateLabel={
                deliveredDate ? `Entregado el ${deliveredDate}` : undefined
              }
            />
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
          {items.map((it: OrderItem, idx: number) => (
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
                USD {Number(order.totalUSD).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------- componente para cada paso del tracking -------- */

function TrackingStep(props: {
  done: boolean;
  title: string;
  description: string;
  dateLabel?: string;
}) {
  const { done, title, description, dateLabel } = props;
  return (
    <div className="flex gap-3 items-start">
      <div
        className={`mt-1 w-4 h-4 rounded-full ${
          done ? "bg-green-500" : "bg-gray-300"
        }`}
      />
      <div>
        <p
          className={`font-semibold ${
            done ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {title}
        </p>
        <p className="text-gray-600 text-xs">{description}</p>
        {dateLabel && (
          <p className="text-[11px] text-gray-400 mt-0.5">{dateLabel}</p>
        )}
      </div>
    </div>
  );
}

