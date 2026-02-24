"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { mockProducts } from "@/lib/products"; // 🛠️ IMPORTACIÓN DE PRODUCTOS LOCALES

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        // 🛠️ UNIFICACIÓN: Mezclamos productos de DB con los de lib/products.ts
        const dbItems = (data || []).map((p: any) => ({ ...p, isLocal: false }));
        const localItems = (mockProducts || []).map((p: any) => ({ 
          ...p, 
          _id: p.id, 
          isLocal: true 
        }));

        setProducts([...dbItems, ...localItems]);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string, title: string, isLocal: boolean) => {
    // 🛠️ SEGURIDAD: Impedimos borrar productos del archivo físico
    if (isLocal) {
      alert("Este producto es local (lib/products.ts) y no puede eliminarse desde el panel.");
      return;
    }

    if (confirm(`¿Eliminar "${title}" de forma permanente de USAShopBox?`)) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          setProducts(products.filter(p => p._id !== id));
        } else {
          alert("Error al eliminar el producto.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // 🛠️ AUDIT: Ahora cuenta categorías de ambas fuentes (DB + Local)
  const audit = products.reduce((acc: any, p) => {
    const cat = typeof p.category === 'object' 
      ? (p.category.leaf || p.category.main || "Sin Categoría") 
      : (p.category || "Sin Categoría");
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen bg-[#0A2647] flex items-center justify-center">
      <p className="text-white font-black tracking-widest animate-pulse uppercase">Sincronizando Inventario Global...</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-[#0A2647] tracking-tighter uppercase">Auditoría de Inventario</h1>
          <Link href="/admin/products/new" className="bg-[#0A2647] text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest hover:scale-105 transition shadow-xl">
             + NUEVO PRODUCTO
          </Link>
        </div>

        {/* INDICADORES DE AUDIT UNIFICADOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-6 rounded-[32px] border shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Global</p>
            <p className="text-3xl font-black text-[#0A2647]">{products.length}</p>
          </div>
          {Object.entries(audit).map(([cat, count]: any) => (
            <div key={cat} className="bg-white p-6 rounded-[32px] border shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{cat}</p>
              <p className="text-3xl font-black text-emerald-600">{count}</p>
            </div>
          ))}
        </div>

        {/* TABLA MAESTRA */}
        <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Producto</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Categoría</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Precio USA</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 group-hover:text-[#0A2647] transition-colors">{p.title}</span>
                        {p.isLocal && (
                          <span className="text-[7px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black tracking-tighter uppercase">Local</span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slate-300 uppercase">ID: {p._id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                      {typeof p.category === 'object' 
                        ? (p.category.leaf || p.category.main) 
                        : (p.category || "General")}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-emerald-600">USD {p.priceUSD}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link 
                        href={`/admin/products/${p._id}`}
                        className="bg-[#0A2647] text-white px-5 py-2 rounded-xl text-xs font-black hover:scale-105 transition shadow-md"
                      >
                        EDITAR
                      </Link>
                      <button 
                        onClick={() => handleDelete(p._id, p.title, p.isLocal)}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition shadow-sm ${p.isLocal ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white'}`}
                      >
                        ELIMINAR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}