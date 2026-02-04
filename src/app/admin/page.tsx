"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSession } from "next-auth/react";
import { mockProducts } from "@/lib/products";

// Iconos SVG
const Icons = {
  TrendingUp: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
  ),
  Box: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  ),
  ShoppingBag: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
  ),
  Clipboard: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
  ),
  DollarSign: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
  )
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    totalOperations: 0, 
  });

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. ÓRDENES
        const resOrders = await fetch("/api/admin/orders", { cache: "no-store" });
        const dataOrders = await resOrders.json();
        const orders = dataOrders.orders || [];

        // Ventas confirmadas (Revenue $$$) - Aquí SÍ filtramos para no sumar plata falsa
        const revenue = orders
          .filter((o: any) => o.status !== "cancelled" && o.status !== "pending_payment")
          .reduce((acc: number, curr: any) => acc + (curr.totalUSD || 0), 0);
        
        // Órdenes activas (Trabajo pendiente)
        const active = orders.filter((o: any) => 
          ["paid", "processing", "in_miami_warehouse", "in_transit", "shipped"].includes(o.status)
        ).length;

        // Total Operaciones (Volumen Bruto)
        // 🛠️ CAMBIO: Contamos TODAS (length), incluidas las pendientes de pago.
        const operations = orders.length;

        // 2. PRODUCTOS
        const resProducts = await fetch("/api/admin/products", { cache: "no-store" });
        const dataProducts = await resProducts.json();
        const dbProductsCount = Array.isArray(dataProducts) ? dataProducts.length : (dataProducts.products?.length || 0);
        const localProductsCount = mockProducts?.length || 0;
        const totalCount = dbProductsCount + localProductsCount;

        setMetrics({
          totalRevenue: revenue,
          activeOrders: active,
          totalProducts: totalCount,
          totalOperations: operations
        });

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0A2647] flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">
        Cargando Panel de Control...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-6 md:px-8 mt-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#0A2647] tracking-tighter uppercase mb-2">
            Panel de Control
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Bienvenido, {session?.user?.name?.split(" ")[0] || "Admin"}
          </p>
        </div>

        {/* === SECCIÓN DE KPIs === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* KPI 1: Ventas Totales */}
          <div className="bg-[#0A2647] text-white p-6 rounded-[24px] shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Icons.TrendingUp />
            </div>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Ventas Confirmadas</p>
            <p className="text-3xl font-black tracking-tighter">USD {metrics.totalRevenue.toLocaleString()}</p>
          </div>

          {/* KPI 2: Órdenes Activas */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 text-[#0A2647] opacity-10 group-hover:scale-110 transition-transform">
              <Icons.ShoppingBag />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Órdenes en Curso</p>
            <p className="text-3xl font-black text-[#0A2647] tracking-tighter">{metrics.activeOrders}</p>
          </div>

           {/* KPI 3: Inventario */}
           <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 text-[#0A2647] opacity-10 group-hover:scale-110 transition-transform">
              <Icons.Box />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Productos en Catálogo</p>
            <p className="text-3xl font-black text-[#0A2647] tracking-tighter">{metrics.totalProducts}</p>
          </div>

          {/* KPI 4: Total Operaciones */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-6 text-[#0A2647] opacity-10 group-hover:scale-110 transition-transform">
              <Icons.Clipboard />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Operaciones</p>
            <p className="text-3xl font-black text-[#0A2647] tracking-tighter">
              {metrics.totalOperations}
            </p>
          </div>
        </div>

        {/* === SECCIÓN DE NAVEGACIÓN === */}
        <h2 className="text-xl font-black text-[#0A2647] tracking-tighter uppercase mb-6 flex items-center gap-2">
          Accesos Rápidos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CARD 1: INVENTARIO */}
          <Link href="/admin/products" className="group relative bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#0A2647]/20 transition-all duration-300">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0A2647] mb-6 group-hover:bg-[#0A2647] group-hover:text-white transition-colors">
              <Icons.Box />
            </div>
            <h3 className="text-2xl font-black text-[#0A2647] uppercase tracking-tighter mb-2">Inventario</h3>
            <p className="text-xs font-bold text-slate-400 mb-8 leading-relaxed">
              Gestioná el catálogo de Apple y Sony. Agregá productos, editá precios base y pausá publicaciones sin stock.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A2647] group-hover:gap-4 transition-all">
              Administrar Productos <Icons.ArrowRight />
            </div>
          </Link>

          {/* CARD 2: ÓRDENES */}
          <Link href="/admin/orders" className="group relative bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#0A2647]/20 transition-all duration-300">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0A2647] mb-6 group-hover:bg-[#0A2647] group-hover:text-white transition-colors">
              <Icons.ShoppingBag />
            </div>
            <h3 className="text-2xl font-black text-[#0A2647] uppercase tracking-tighter mb-2">Órdenes</h3>
            <p className="text-xs font-bold text-slate-400 mb-8 leading-relaxed">
              Controlá el flujo de pedidos. Cambiá estados (Miami, Enviado), cargá trackings y auditá pagos.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A2647] group-hover:gap-4 transition-all">
              Ver Pedidos <Icons.ArrowRight />
            </div>
          </Link>

          {/* CARD 3: PRICING & CONFIG */}
          <Link href="/admin/pricing" className="group relative bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#0A2647]/20 transition-all duration-300">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0A2647] mb-6 group-hover:bg-[#0A2647] group-hover:text-white transition-colors">
              <Icons.DollarSign />
            </div>
            <h3 className="text-2xl font-black text-[#0A2647] uppercase tracking-tighter mb-2">Pricing Engine</h3>
            <p className="text-xs font-bold text-slate-400 mb-8 leading-relaxed">
              Ajustá las variables críticas: Valor del Dólar, Costo por Kilo, Tarifas de Aduana y Márgenes de Ganancia.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0A2647] group-hover:gap-4 transition-all">
              Configurar Motor <Icons.ArrowRight />
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
