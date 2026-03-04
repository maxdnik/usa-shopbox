"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminPricingPage() {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Estado local para editar el JSON de categorías como texto
  const [categoriesJson, setCategoriesJson] = useState("{}"); // ✅ Inicializamos con llaves vacías por defecto

  // ✅ Courier buckets (JSON array)
  const [bucketsJson, setBucketsJson] = useState(
    "[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7, 10, 12, 15, 20, 25, 30]"
  );

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);

        // ✅ Corrección: Si no existe el mapa, usamos objeto vacío {} para evitar error de JSON.parse
        setCategoriesJson(JSON.stringify(data.WEIGHT_CATEGORY_MAP || {}, null, 2));

        // ✅ Buckets courier
        setBucketsJson(
          JSON.stringify(
            data.courier_buckets_kg || [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7, 10, 12, 15, 20, 25, 30],
            null,
            2
          )
        );

        // ✅ Defaults courier si no existen
        setConfig((prev: any) => ({
          ...prev,
          courier_volumetric_divisor: data.courier_volumetric_divisor ?? 5000,
          courier_use_buckets: typeof data.courier_use_buckets === "boolean" ? data.courier_use_buckets : true,
          courier_fallback_buffer_pct: data.courier_fallback_buffer_pct ?? 0.2,
          courier_ebay_extra_buffer_pct: data.courier_ebay_extra_buffer_pct ?? 0.12,
          courier_global_min_billable_kg: data.courier_global_min_billable_kg ?? 0.5,
        }));
      })
      .catch((err) => console.error("Error cargando configuración:", err));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // 1) Parse JSON categorías
      let parsedMap = {};
      try {
        const jsonToParse = categoriesJson.trim() === "" ? "{}" : categoriesJson;
        parsedMap = JSON.parse(jsonToParse);
      } catch (e) {
        alert(
          "Error en el formato JSON de categorías. Verifica la sintaxis (comillas, comas, llaves)."
        );
        setSaving(false);
        return;
      }

      // 2) Parse JSON buckets courier
      let parsedBuckets: number[] = [];
      try {
        const jsonToParse = bucketsJson.trim() === "" ? "[]" : bucketsJson;
        parsedBuckets = JSON.parse(jsonToParse);

        if (!Array.isArray(parsedBuckets)) throw new Error("Buckets must be array");

        parsedBuckets = parsedBuckets
          .map((n) => Number(n))
          .filter((n) => typeof n === "number" && !Number.isNaN(n) && n > 0);

        if (parsedBuckets.length === 0) throw new Error("Buckets empty");
      } catch (e) {
        alert(
          "Error en el JSON de Buckets (Courier). Debe ser un array de números. Ej: [0.5, 1, 2, 5]"
        );
        setSaving(false);
        return;
      }

      const payload = {
        ...config,

        // ✅ pesos legacy
        WEIGHT_CATEGORY_MAP: parsedMap,

        // ✅ courier config
        courier_volumetric_divisor: Number(config.courier_volumetric_divisor ?? 5000),
        courier_use_buckets: !!config.courier_use_buckets,
        courier_buckets_kg: parsedBuckets,
        courier_fallback_buffer_pct: Number(config.courier_fallback_buffer_pct ?? 0.2),
        courier_ebay_extra_buffer_pct: Number(config.courier_ebay_extra_buffer_pct ?? 0.12),
        courier_global_min_billable_kg: Number(config.courier_global_min_billable_kg ?? 0.5),
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Configuración actualizada. El motor de pricing ya está usando los nuevos valores.");
      } else {
        alert("Error al guardar la configuración.");
      }
    } catch (err) {
      alert("Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0A2647] flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">
        Iniciando Motor de Pricing...
      </div>
    );
  }

    const InputField = ({ label, field, step = 1, helper }: any) => {
      const raw = config?.[field];

      // ✅ Nunca devolver NaN al input
      const safeValue =
        typeof raw === "number" && Number.isFinite(raw) ? raw : 0;

      return (
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
            {label}
          </label>

          <input
            type="number"
            step={step}
            className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-[#0A2647] focus:border-[#1E3A8A] focus:bg-white outline-none transition-all shadow-inner"
            value={safeValue}
            onChange={(e) => {
              const v = e.target.value;
              // si el usuario borra el input, evitamos NaN
              const next = v === "" ? 0 : Number(v);
              setConfig({ ...config, [field]: Number.isFinite(next) ? next : 0 });
            }}
          />

          {helper && (
            <p className="text-[9px] font-bold text-slate-300 uppercase ml-1">
              {helper}
            </p>
          )}
        </div>
      );
    };

  const ToggleField = ({ label, field, helper }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
        {label}
      </label>
      <button
        type="button"
        className={`px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition shadow-inner border-2 ${
          config[field]
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-slate-50 border-slate-100 text-slate-500"
        }`}
        onClick={() => setConfig({ ...config, [field]: !config[field] })}
      >
        {config[field] ? "ACTIVO" : "INACTIVO"}
      </button>
      {helper && <p className="text-[9px] font-bold text-slate-300 uppercase ml-1">{helper}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-8 mt-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#0A2647] tracking-tighter uppercase">
              Configuración de Pricing
            </h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
              Ajuste de variables de negocio y guardrails de rentabilidad
            </p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-[#ff3347] text-white px-10 py-5 rounded-[20px] font-black uppercase text-xs tracking-widest hover:scale-105 transition active:scale-95 shadow-xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? "PROCESANDO..." : "APLICAR CAMBIOS GLOBALES"}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SECCIÓN A: VARIABLES COBRADAS */}
          <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h2 className="text-xs font-black text-[#0A2647] uppercase tracking-widest">
                Variables Cobradas (Frontend)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Aduana por Orden" field="charged_aduana" helper="USD fijos por pedido" />
              <InputField label="Logística Nacional" field="charged_local" helper="Envío última milla" />
              <InputField label="Flete Internacional" field="charged_freight_kg" helper="USD por Kilogramo" />
              <InputField label="Margen Gestión Base" field="base_fee_percent" step={0.01} helper="Ej: 0.10 = 10%" />
            </div>
          </section>

          {/* SECCIÓN B: COSTOS REALES */}
          <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h2 className="text-xs font-black text-[#0A2647] uppercase tracking-widest">
                Costos Reales Operativos
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Costo Aduana Real" field="real_aduana" helper="Costo interno por orden" />
              <InputField label="Costo Logística Real" field="real_local" helper="Costo interno despacho" />
              <InputField label="Costo Flete Real" field="real_freight_kg" step={0.1} helper="Costo real por KG" />
              <InputField label="Costo de Pasarela" field="payment_cost_percent" step={0.005} helper="Ej: 0.075 = 7.5%" />
            </div>
          </section>

          {/* SECCIÓN C: GUARDRAILS */}
          <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <h2 className="text-xs font-black text-[#0A2647] uppercase tracking-widest">
                Guardrails Financieros
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <InputField label="Margen Neto Mínimo" field="min_net_margin_percent" step={0.01} helper="Target: 0.15 (15%)" />
              <InputField label="Pedido Mínimo" field="min_order_total_usd" helper="Total USD para checkout" />
              <InputField label="Máx Ajuste < 150" field="limit_adjust_low" step={0.01} helper="Tope para órdenes bajas" />
              <InputField label="Máx Ajuste >= 150" field="limit_adjust_high" step={0.01} helper="Tope para órdenes altas" />
            </div>
          </section>

          {/* SECCIÓN D: POLÍTICA DE PESOS (NUEVO) */}
          <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <h2 className="text-xs font-black text-[#0A2647] uppercase tracking-widest">
                Política de Pesos Imputados (eBay / Scraping)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <InputField
                  label="Peso Default (Emergencia)"
                  field="WEIGHT_DEFAULT_KG"
                  step={0.1}
                  helper="Se usa si no hay peso real ni categoría conocida."
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Mapa de Categorías (JSON)
                </label>
                <textarea
                  rows={8}
                  className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-mono text-xs text-[#0A2647] focus:border-[#1E3A8A] focus:bg-white outline-none transition-all shadow-inner leading-relaxed"
                  value={categoriesJson}
                  onChange={(e) => setCategoriesJson(e.target.value)}
                  placeholder='{ "ropa": 0.5, "celular": 0.5 }'
                />
                <p className="text-[9px] font-bold text-slate-300 uppercase ml-1">
                  Edita las reglas de peso por palabra clave. Formato JSON estricto.
                </p>
              </div>
            </div>
          </section>

          {/* ✅ SECCIÓN E: COURIER / VOLUMÉTRICO (NUEVO) */}
          <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div>
              <h2 className="text-xs font-black text-[#0A2647] uppercase tracking-widest">
                Configuración Courier (Volumétrico / Buckets)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InputField
                label="Volumetric Divisor"
                field="courier_volumetric_divisor"
                step={100}
                helper="Default 5000 (cm). Volumetric = L*W*H / divisor"
              />

              <InputField
                label="Min Billable Kg Global"
                field="courier_global_min_billable_kg"
                step={0.1}
                helper="Mínimo cobrable por ítem"
              />

              <ToggleField
                label="Usar Buckets"
                field="courier_use_buckets"
                helper="Redondea peso cobrable al bucket inmediato superior."
              />

              <InputField
                label="Fallback Buffer %"
                field="courier_fallback_buffer_pct"
                step={0.01}
                helper="Se aplica cuando faltan datos. Ej: 0.20 = 20%"
              />

              <InputField
                label="eBay Extra Buffer %"
                field="courier_ebay_extra_buffer_pct"
                step={0.01}
                helper="Extra de riesgo para items eBay. Ej: 0.12 = 12%"
              />

              <div className="md:col-span-3 flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Buckets Kg (JSON)
                </label>
                <textarea
                  rows={4}
                  className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-mono text-xs text-[#0A2647] focus:border-[#1E3A8A] focus:bg-white outline-none transition-all shadow-inner leading-relaxed"
                  value={bucketsJson}
                  onChange={(e) => setBucketsJson(e.target.value)}
                  placeholder="[0.5, 1, 1.5, 2, 3, 4, 5, 7, 10]"
                />
                <p className="text-[9px] font-bold text-slate-300 uppercase ml-1">
                  Array de números. Se usa para redondear el peso cobrable.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}