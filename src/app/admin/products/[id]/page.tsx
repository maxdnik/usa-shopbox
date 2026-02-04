"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { PRODUCT_TEMPLATES } from "@/lib/config/templates";

const CATEGORY_STRUCTURE: Record<string, Record<string, string[]>> = {
  "Tecnología": {
    "Celulares y Teléfonos": [
      "Celulares y Smartphones", 
      "Accesorios para Celulares", 
      "Smartwatches",
      "iPhones" //  Apple vive aquí como hoja o subcategoría
    ],
    "Computación": [
      "Notebooks", 
      "Tablets", 
      "PC de Escritorio", 
      "Monitores",
      "MacBooks", //  Apple vive aquí
      "iPads"     //  Apple vive aquí
    ],
    "Audio": ["Auriculares", "Parlantes", "Equipos de Música"],
    "Electrónica, Audio y Video": ["Cámaras y Accesorios", "Televisores"],
    "Consolas y Videojuegos": ["Consolas", "Videojuegos", "Accesorios"]
  },
  "Ropa y Accesorios": {
    "Calzado": ["Zapatillas", "Zapatos", "Sandalias"],
    "Abrigos": ["Buzos y Camperas", "Tapados"],
    "Equipaje, Bolsos y Carteras": ["Mochilas", "Valijas", "Carteras"],
    "Ropa Interior y de Dormir": ["Medias", "Pijamas"]
  },
  "Hogar y Muebles": {
    "Cocina": ["Pequeños Electrodomésticos", "Vajilla"],
    "Iluminación": ["Lámparas de Techo", "Lámparas de Mesa"],
    "Decoración": ["Cuadros", "Espejos"]
  }
};

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🛠️ ESTADO PARA IMÁGENES: Mantenemos la lógica de la galería
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/products/${id}`)
      .then(res => res.json())
      .then(data => {
        // 🛠️ NORMALIZACIÓN: Convierte categorías viejas a objeto jerárquico
        const categoryData = typeof data.category === 'string' 
          ? { main: "Tecnología", sub: "Celulares y Teléfonos", leaf: data.category }
          : (data.category || { main: "Tecnología", sub: "", leaf: "" });

        setProduct({
          ...data,
          category: categoryData,
          images: data.images || [], // Persistimos la galería
          specs: data.specs || {},
          variations: data.variations || [],
          description: data.description || "",
          weight: data.weight || 0 // ⚖️ Cargamos el peso desde la DB
        });
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      alert("✅ Producto actualizado con peso y costeo.");
      router.push("/admin/products");
    }
    setSaving(false);
  };

  const addVariation = () => {
    setProduct({ ...product, variations: [...(product.variations || []), { attribute: "Color", value: "", stock: 1 }] });
  };

  const removeVariation = (index: number) => {
    setProduct({ ...product, variations: product.variations.filter((_: any, i: number) => i !== index) });
  };

  // 🛠️ FUNCIONES DE GALERÍA: No se modifica ninguna línea
  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setProduct({ ...product, images: [...(product.images || []), newImageUrl] });
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setProduct({
      ...product,
      images: product.images.filter((_: any, i: number) => i !== index)
    });
  };

  const updateImage = (index: number, val: string) => {
    const updated = [...product.images];
    updated[index] = val;
    setProduct({ ...product, images: updated });
  };

  if (loading) return <div className="min-h-screen bg-[#0A2647] flex items-center justify-center text-white font-black tracking-widest uppercase">Abriendo Editor Maestro...</div>;

  const fields = PRODUCT_TEMPLATES[product.category.main] || PRODUCT_TEMPLATES["Tecnología"] || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <AdminHeader />
      
      <form onSubmit={handleSave} className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="bg-[#0A2647] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                  {product.category.leaf || "Sin Categoría"}
               </span>
               <p className="text-[#0A2647] text-[10px] font-black uppercase tracking-widest opacity-40">Editor Maestro de Inventario</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{product.title}</h1>
          </div>
          <button type="submit" disabled={saving} className="bg-[#0A2647] text-white px-12 py-5 rounded-[24px] font-black shadow-2xl hover:scale-105 transition disabled:opacity-50">
            {saving ? "PROCESANDO..." : "GUARDAR CAMBIOS"}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            
            {/* 🛠️ JERARQUÍA DE CATEGORÍAS */}
            <section className="bg-white p-10 rounded-[48px] border shadow-sm space-y-8">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b pb-4">Configuración de Categorías</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Categoría Principal</label>
                  <select 
                    className="w-full border-b-2 py-2 text-sm font-bold text-[#0A2647] outline-none bg-transparent cursor-pointer"
                    value={product.category.main} 
                    onChange={e => setProduct({
                      ...product, 
                      category: { ...product.category, main: e.target.value, sub: "", leaf: "" }
                    })}
                  >
                    {Object.keys(CATEGORY_STRUCTURE).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subcategoría (Sub)</label>
                  <select 
                    className="w-full border-b-2 py-2 text-sm font-bold text-[#0A2647] outline-none bg-transparent cursor-pointer"
                    value={product.category.sub}
                    disabled={!product.category.main}
                    onChange={e => setProduct({
                      ...product, 
                      category: { ...product.category, sub: e.target.value, leaf: "" }
                    })}
                  >
                    <option value="">Seleccionar sub...</option>
                    {product.category.main && CATEGORY_STRUCTURE[product.category.main] && Object.keys(CATEGORY_STRUCTURE[product.category.main]).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Categoría Final (Leaf)</label>
                  <select 
                    className="w-full border-b-2 py-2 text-sm font-bold text-[#0A2647] outline-none bg-transparent cursor-pointer"
                    value={product.category.leaf}
                    disabled={!product.category.sub}
                    onChange={e => setProduct({
                      ...product, 
                      category: { ...product.category, leaf: e.target.value }
                    })}
                  >
                    <option value="">Seleccionar leaf...</option>
                    {product.category.main && product.category.sub && CATEGORY_STRUCTURE[product.category.main][product.category.sub]?.map(leaf => (
                      <option key={leaf} value={leaf}>{leaf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tienda Original</label>
                  <input className="w-full border-b py-2 text-sm font-bold text-slate-600 outline-none" value={product.store} onChange={e => setProduct({...product, store: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Título Público</label>
                  <input className="w-full border-b-2 py-2 text-xl font-bold text-slate-800 outline-none focus:border-[#0A2647]" value={product.title} onChange={e => setProduct({...product, title: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción</label>
                <textarea rows={5} className="w-full border border-slate-100 rounded-[24px] p-6 mt-4 text-sm text-slate-600 outline-none focus:border-[#0A2647] shadow-inner"
                  value={product.description} onChange={e => setProduct({...product, description: e.target.value})} />
              </div>
            </section>

            {/* 🖼️ SECCIÓN DE IMÁGENES: Mantenemos la funcionalidad */}
            <section className="bg-white p-10 rounded-[48px] border shadow-sm">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b pb-4 mb-8">Galería de Imágenes (Local / eBay)</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {product.images?.map((img: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-6 bg-slate-50/50 p-4 rounded-[24px] border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border flex-shrink-0">
                      <img src={img} alt={`preview-${idx}`} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Ruta / URL del archivo</label>
                      <input 
                        className="w-full bg-transparent border-b py-2 text-xs font-mono font-bold text-[#0A2647] outline-none" 
                        value={img} 
                        onChange={e => updateImage(idx, e.target.value)} 
                      />
                    </div>
                    <button type="button" onClick={() => removeImage(idx)} className="text-red-300 hover:text-red-500 transition px-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 items-end bg-[#0A2647]/5 p-8 rounded-[32px] border border-[#0A2647]/10">
                <div className="flex-1">
                   <label className="text-[10px] font-black text-[#0A2647] uppercase tracking-widest mb-2 block">Vincular Nueva Foto</label>
                   <input 
                      type="text" 
                      placeholder="Ej: /images/products/nike-air.jpg" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0A2647] outline-none focus:border-[#0A2647]"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                   />
                </div>
                <button 
                  type="button" 
                  onClick={addImage}
                  className="bg-[#0A2647] text-white px-8 py-3.5 rounded-xl font-black text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg"
                >
                  AÑADIR FOTO
                </button>
              </div>
            </section>

            {/* VARIANTES */}
            <section className="bg-white p-10 rounded-[48px] border shadow-sm">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Variantes (Talles y Colores)</h3>
                <button type="button" onClick={addVariation} className="bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black hover:bg-blue-100 transition tracking-widest">+ AGREGAR FILA</button>
              </div>
              <div className="space-y-4">
                {product.variations?.map((v: any, idx: number) => (
                  <div key={idx} className="flex gap-6 items-end bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                    <div className="w-1/3">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Atributo</label>
                      <select className="w-full bg-transparent border-b py-2 text-xs font-black text-[#0A2647]" value={v.attribute} onChange={e => {
                        const updated = [...product.variations];
                        updated[idx].attribute = e.target.value;
                        setProduct({...product, variations: updated});
                      }}>
                        <option value="Color">Color</option>
                        <option value="Capacidad">Capacidad</option>
                        <option value="Talle">Talle</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Valor</label>
                      <input className="w-full bg-transparent border-b py-2 text-xs font-bold" value={v.value} onChange={e => {
                        const updated = [...product.variations];
                        updated[idx].value = e.target.value;
                        setProduct({...product, variations: updated});
                      }} />
                    </div>
                    <button type="button" onClick={() => removeVariation(idx)} className="text-red-300 hover:text-red-500 transition mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* ⚖️ ECONOMÍA: BLOQUE DE COSTEO POR PESO INTEGRADO */}
            <section className="bg-emerald-600 p-10 rounded-[48px] text-white shadow-2xl shadow-emerald-200/50">
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-6">Costeo de Importación</h3>
               
               <div className="grid grid-cols-2 gap-4 mb-8">
                 <div>
                   <label className="text-[9px] font-black uppercase opacity-60 block mb-2">Precio Tienda USA</label>
                   <div className="flex items-center gap-1 border-b border-white/30 pb-2">
                     <span className="text-xl font-bold">$</span>
                     <input 
                       type="number" 
                       className="bg-transparent text-4xl font-black outline-none w-full" 
                       value={product.priceUSD} 
                       onChange={e => setProduct({...product, priceUSD: Number(e.target.value)})} 
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className="text-[9px] font-black uppercase opacity-60 block mb-2">Peso del Producto (Kg)</label>
                   <div className="flex items-center gap-1 border-b border-white/30 pb-2">
                     <input 
                       type="number" 
                       step="0.1"
                       placeholder="0.0"
                       className="bg-transparent text-4xl font-black outline-none w-full" 
                       value={product.weight || 0} 
                       onChange={e => setProduct({...product, weight: Number(e.target.value)})} 
                     />
                     <span className="text-xl font-bold">Kg</span>
                   </div>
                 </div>
               </div>

               <div className="pt-8 border-t border-white/20 space-y-4">
                 <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Costo Envío (U$D 15/Kg)</p>
                   <p className="text-lg font-bold">USD {( (product.weight || 0) * 15 ).toFixed(2)}</p>
                 </div>
                 
                 <div className="bg-white/10 p-4 rounded-2xl">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Final en Argentina (Estimado)</p>
                   <p className="text-4xl font-black">
                     USD {( (product.priceUSD * 1.35) + ((product.weight || 0) * 15) ).toFixed(2)}
                   </p>
                 </div>
               </div>
            </section>

            {/* FICHA TÉCNICA */}
            <section className="bg-white p-10 rounded-[48px] border shadow-sm">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b pb-4 mb-8">Ficha Técnica</h3>
              <div className="space-y-6">
                {fields.map((f: string) => (
                  <div key={f}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{f}</label>
                    <input className="w-full border-b py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition" 
                      value={product.specs[f] || ""} onChange={e => setProduct({...product, specs: {...product.specs, [f]: e.target.value}})} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}