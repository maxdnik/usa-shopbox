"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

type Order = {
  _id: string;
  orderNumber?: string;
  status?: string;
  totalUSD?: number;
  createdAt?: string;
  buyer?: {
    fullName?: string;
    email?: string;
  };
  items?: any[];
};

const ADMIN_EMAILS = ["maxidimnik@gmail.com"];

// Opciones de estado
const ORDER_STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pendiente de pago" },
  { value: "paid", label: "Pagado" },
  { value: "pending_processing", label: "Pendiente de procesamiento" },
  { value: "processing", label: "Procesando" },
  { value: "in_miami_warehouse", label: "En Miami" },
  { value: "in_transit", label: "En tránsito" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

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

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin =
    !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        if (!res.ok) throw new Error("No se pudieron cargar las órdenes.");

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err: any) {
        console.error("Error /api/admin/orders:", err);
        setError(err?.message || "Error al cargar órdenes.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, isAdmin]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev =>
      prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    setSuccess(null);
    setError(null);
  };

  const handleSave = async (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    try {
      setSavingId(orderId);
      setError(null);
      setSuccess(null);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: order.status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo actualizar el estado.");
      }

      const json = await res.json();

      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, ...json.order } : o))
      );

      setSuccess(
        `Orden ${order.orderNumber || order._id.slice(-6)} actualizada correctamente.`
      );
    } catch (err: any) {
      console.error("Error al actualizar orden:", err);
      setError(err?.message || "Error al actualizar el estado.");
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Estado de carga de sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#061a33] text-white flex items-center justify-center">
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  // No logueado
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-[#061a33] text-white flex items-center justify-center">
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-sm max-w-md w-full text-center">
          <h1 className="text-lg font-semibold mb-2">Panel de administración</h1>
          <p className="text-sm text-slate-600 mb-4">
            Necesitás iniciar sesión para acceder al panel de órdenes.
          </p>
          <button
            onClick={() => signIn()}
            className="rounded-xl bg-[#ff3347] text-white px-4 py-2 text-sm font-semibold hover:bg-[#ff4d63]"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  // Logueado pero no admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#061a33] text-white flex items-center justify-center">
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-sm max-w-md w-full text-center">
          <h1 className="text-lg font-semibold mb-2">Acceso restringido</h1>
          <p className="text-sm text-slate-600">
            Tu usuario no tiene permisos para ver este panel.
          </p>
        </div>
      </div>
    );
  }

  // Admin OK
  return (
    <div className="min-h-screen bg-[#061a33] text-white p-6">
      <div className="max-w-5xl mx-auto bg-white text-slate-900 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Panel de órdenes</h1>
        <p className="text-sm text-slate-500 mb-4">
          Acá podés ver todas las órdenes y actualizar su estado logístico.
        </p>

        {loading && (
          <p className="text-sm text-slate-600">Cargando órdenes...</p>
        )}

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <p className="text-sm text-slate-600">
            No hay órdenes registradas todavía.
          </p>
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-4 space-y-3">
            {orders.map(order => {
              const itemsCount = order.items?.length ?? 0;

              return (
                <div
                  key={order._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-xl px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      Orden {order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatDate(order.createdAt)} · {itemsCount}{" "}
                      {itemsCount === 1 ? "producto" : "productos"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Cliente:{" "}
                      <span className="font-medium">
                        {order.buyer?.fullName || "-"}
                      </span>{" "}
                      · {order.buyer?.email}
                    </p>

                    <p className="text-xs text-slate-600">
                      Total:{" "}
                      <span className="font-semibold">
                        USD {Number(order.totalUSD || 0).toFixed(2)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Estado actual:
                      </span>
                      <span className="text-xs font-semibold">
                        {statusLabel(order.status || "")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs border rounded-lg px-2 py-1 bg-white"
                        value={order.status || "pending_payment"}
                        onChange={e =>
                          handleStatusChange(order._id, e.target.value)
                        }
                      >
                        {ORDER_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleSave(order._id)}
                        disabled={savingId === order._id}
                        className="text-xs rounded-lg bg-[#ff3347] text-white px-3 py-1 font-semibold hover:bg-[#ff4d63] disabled:opacity-60"
                      >
                        {savingId === order._id ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
