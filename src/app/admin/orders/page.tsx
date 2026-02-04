"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
// 🎯 INTEGRACIÓN DEL HEADER UNIFICADO
import AdminHeader from "@/components/admin/AdminHeader";

type Order = {
  _id: string;
  orderNumber?: string;
  status?: string;
  totalUSD?: number;
  createdAt?: string;
  localTrackingNumber?: string;
  localCourierName?: string;
  buyer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    dni?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  items?: {
    productId: string;
    sku?: string;
    title: string;
    store: string;
    imageUrl?: string;
    image?: string;
    images?: string[];
    quantity: number;
    qty?: number; 
    priceUSD?: number; 
    estimatedUSD?: number;
    selections?: Record<string, string>; 
    specs?: Record<string, string>;
  }[];
};

const ADMIN_EMAILS = ["maxidimnik@gmail.com"];

// 🛡️ REVISIÓN DE ESTADOS: Ajustado según tu instrucción
const ORDER_STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pendiente de pago" },
  { value: "paid", label: "Pagado" },
  { value: "processing", label: "Procesando (En camino a Miami)" }, // 🎯 Notificación de producto hacia Warehouse
  { value: "in_miami_warehouse", label: "Recibido en Miami" },
  { value: "in_transit", label: "En tránsito a Argentina" },
  { value: "shipped", label: "Enviado (Correo Local)" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending_payment: "Pendiente de pago",
    paid: "Pagado",
    processing: "En camino a Miami",
    in_miami_warehouse: "Recibido en Miami",
    in_transit: "En tránsito",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return map[status] || status.replaceAll("_", " ");
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); 
  const [error, setError] = useState<string | null>(null);

  const [localTracking, setLocalTracking] = useState("");
  const [localCourier, setLocalCourier] = useState("");

  const isAdmin = !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    if (selectedOrder) {
      setLocalTracking(selectedOrder.localTrackingNumber || "");
      setLocalCourier(selectedOrder.localCourierName || "");
    } else {
      setLocalTracking("");
      setLocalCourier("");
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError("Error al cargar órdenes.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [status, isAdmin]);

  const stats = {
    total: orders.length,
    revenue: orders.reduce((acc, o) => acc + (o.totalUSD || 0), 0),
    pendingPayment: orders.filter(o => o.status === "pending_payment").length,
    processing: orders.filter(o => o.status === "processing").length,
    inTransit: orders.filter(o => o.status === "in_transit").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)));
    if (selectedOrder?._id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleSave = async (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;
    try {
      setSavingId(orderId);
      // 🚀 NOTIFICACIÓN: Usamos el endpoint administrativo para disparar el mail
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: order._id,
          newStatus: order.status, 
          localTrackingNumber: localTracking,
          localCourierName: localCourier
        }),
      });

      if (res.ok) {
        alert(`Estado actualizado a "${statusLabel(order.status || "")}" y cliente notificado.`);
      }
    } catch (err) {
      alert("Error al actualizar la orden.");
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading") return <div className="min-h-screen bg-[#0A2647] flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">Cargando Órdenes...</div>;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20 relative">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-8 mt-12">
        <h1 className="text-4xl font-black text-[#0A2647] tracking-tighter uppercase mb-10">Gestión de Órdenes</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-2xl font-black text-[#0A2647] tracking-tighter">
                {typeof val === 'number' && key === 'revenue' ? `USD ${val.toLocaleString()}` : val}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Orden</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => (
                <tr key={order._id} onClick={() => setSelectedOrder(order)} className="hover:bg-slate-50 transition-all cursor-pointer group">
                  <td className="px-8 py-6">
                    <p className="font-black text-[#0A2647] tracking-tighter uppercase group-hover:text-[#1E3A8A] transition-colors">#{order.orderNumber || order._id.slice(-6)}</p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase">{statusLabel(order.status || "")}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-700 text-sm">{order.buyer?.fullName || "N/A"}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{new Date(order.createdAt || "").toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-[#1E3A8A] tracking-tighter">USD {(order.totalUSD || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-[#0A2647]">Ver Todo →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL DE DETALLE PROFUNDO */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-[#0A2647]/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white px-10 py-8 border-b border-slate-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-3xl font-black text-[#0A2647] tracking-tighter uppercase">Orden #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha: {new Date(selectedOrder.createdAt || "").toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all font-black text-xl">×</button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <section>
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6 border-b pb-2">Datos del Comprador</h3>
                <div className="space-y-4 text-sm">
                  <p><b className="text-[10px] font-black text-[#0A2647] uppercase mr-2 tracking-widest">Nombre:</b> {selectedOrder.buyer?.fullName}</p>
                  <p><b className="text-[10px] font-black text-[#0A2647] uppercase mr-2 tracking-widest">Email:</b> {selectedOrder.buyer?.email}</p>
                  <p><b className="text-[10px] font-black text-[#0A2647] uppercase mr-2 tracking-widest">Dirección:</b> {selectedOrder.buyer?.address}, {selectedOrder.buyer?.city}</p>
                </div>
              </section>

              <section className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 h-fit">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Logística</h3>
                <div className="flex flex-col gap-4">
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-[#0A2647] uppercase shadow-sm outline-none"
                  >
                    {ORDER_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {selectedOrder.status === "shipped" && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <input 
                        type="text" 
                        placeholder="Correo (Ej: Andreani)..."
                        value={localCourier}
                        onChange={(e) => setLocalCourier(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0A2647] outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Tracking Local..."
                        value={localTracking}
                        onChange={(e) => setLocalTracking(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0A2647] outline-none"
                      />
                    </div>
                  )}

                  <button 
                    onClick={() => handleSave(selectedOrder._id)} 
                    disabled={!!savingId}
                    className="w-full bg-[#0A2647] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl disabled:opacity-50"
                  >
                    {savingId === selectedOrder._id ? "GUARDANDO..." : "ACTUALIZAR ESTADO"}
                  </button>
                </div>
              </section>

              <section className="md:col-span-2">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6 border-b pb-2">Productos Comprados</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between bg-white border border-slate-50 p-6 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-6">
                        <div className="w-28 h-28 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative p-2 shadow-inner flex-shrink-0">
                          <Image 
                            src={item.image || (item.images && item.images[0]) || item.imageUrl || "https://placehold.co/400x400/f8fafc/0A2647?text=Apple"} 
                            alt={item.title} 
                            fill 
                            className="object-contain" 
                            unoptimized={true}
                          />
                        </div>
                        <div>
                          <p className="font-black text-[#1E3A8A] text-xl uppercase tracking-tighter leading-none mb-2">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tienda: {item.store}</p>
                          
                          <div className="mt-4 border-t border-slate-50 pt-3 space-y-2">
                             <div className="grid grid-cols-1 gap-1">
                                {Object.entries({ ...(item.selections || {}), ...(item.specs || {}) }).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-[#0A2647] uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-md">{key}:</span>
                                    <span className="text-[11px] font-bold text-slate-700 uppercase">{String(value)}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#0A2647] text-2xl tracking-tighter">
                          USD {(item.priceUSD || item.estimatedUSD || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Cant: {item.qty || item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}