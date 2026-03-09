"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type FacetItem = { _id: string; count: number };

function splitCSV(v?: string | null) {
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function toggleInCSV(csv: string | null, value: string) {
  const arr = splitCSV(csv);
  const has = arr.includes(value);
  const next = has ? arr.filter((x) => x !== value) : [...arr, value];
  return next.length ? next.join(",") : null;
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="py-8 border-b border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-[13px] font-bold tracking-[0.2em] text-[#0A2647] uppercase">
          {title}
        </h3>
        <span className="text-slate-300 text-2xl leading-none select-none">
          {open ? "—" : "+"}
        </span>
      </button>

      {open && <div className="mt-6">{children}</div>}
    </div>
  );
}

export default function OutdoorFiltersClient({ facets }: any) {
  const router = useRouter();
  const sp = useSearchParams();

  const selected = useMemo(() => {
    return {
      brand: splitCSV(sp.get("brand")),
      activity: splitCSV(sp.get("activity")),
      waterproof: splitCSV(sp.get("waterproof")),
      insulation: splitCSV(sp.get("insulation")),
      size: splitCSV(sp.get("size")),
      min: sp.get("min") ?? "",
      max: sp.get("max") ?? "",
    };
  }, [sp]);

  const push = (params: URLSearchParams) => {
    params.set("category", "outdoor"); // asegurar outdoor
    router.push(`/winter?${params.toString()}`);
  };

  const toggleFacet = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    const nextCSV = toggleInCSV(params.get(key), value);
    if (nextCSV) params.set(key, nextCSV);
    else params.delete(key);
    push(params);
  };

  const setPricePresetMax = (maxValue: number) => {
    const params = new URLSearchParams(sp.toString());
    params.delete("min");
    params.set("max", String(maxValue));
    push(params);
  };

  const clearPrice = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("min");
    params.delete("max");
    push(params);
  };

  const rowClass = "flex items-center justify-between gap-4 text-sm";
  const leftClass = "flex items-center gap-3";
  const checkboxClass = "w-5 h-5 border-slate-300 rounded";
  const labelClass = "text-slate-600";
  const countClass = "text-slate-400 text-xs";

  return (
    // ✅ sidebar scrolleable (para ver todos los filtros)
    <div className="max-h-[calc(100vh-140px)] overflow-auto pr-2">
      {/* TIENDA */}
      <Section title="Tienda" defaultOpen>
        <div className="space-y-3">
          {(facets?.brands as FacetItem[] | undefined)?.map((b) => (
            <label key={b._id} className={rowClass}>
              <div className={leftClass}>
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={selected.brand.includes(b._id)}
                  onChange={() => toggleFacet("brand", b._id)}
                />
                <span className={labelClass}>{b._id}</span>
              </div>
              <span className={countClass}>{b.count}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* PRECIO */}
      <Section title="Precio" defaultOpen={false}>
        <div className="space-y-3">
          {[
            { label: "Hasta USD 500", value: 500 },
            { label: "Hasta USD 1000", value: 1000 },
            { label: "Hasta USD 2000", value: 2000 },
          ].map((p) => (
            <label key={p.value} className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={selected.max === String(p.value)}
                onChange={() => setPricePresetMax(p.value)}
              />
              <span className={labelClass}>{p.label}</span>
            </label>
          ))}

          {(selected.min || selected.max) && (
            <button
              type="button"
              onClick={clearPrice}
              className="text-xs font-bold text-[#0A2647] hover:underline mt-2"
            >
              Limpiar precio
            </button>
          )}
        </div>
      </Section>

      {/* ACTIVITY */}
      <Section title="Activity" defaultOpen={false}>
        <div className="space-y-3">
          {(facets?.activity as FacetItem[] | undefined)?.map((a) => (
            <label key={a._id} className={rowClass}>
              <div className={leftClass}>
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={selected.activity.includes(a._id)}
                  onChange={() => toggleFacet("activity", a._id)}
                />
                <span className={labelClass}>{a._id}</span>
              </div>
              <span className={countClass}>{a.count}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* WATERPROOF */}
      <Section title="Waterproof" defaultOpen={false}>
        <div className="space-y-3">
          {(facets?.waterproof as FacetItem[] | undefined)?.map((w) => (
            <label key={w._id} className={rowClass}>
              <div className={leftClass}>
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={selected.waterproof.includes(w._id)}
                  onChange={() => toggleFacet("waterproof", w._id)}
                />
                <span className={labelClass}>{w._id}</span>
              </div>
              <span className={countClass}>{w.count}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* INSULATION */}
      <Section title="Insulation" defaultOpen={false}>
        <div className="space-y-3">
          {(facets?.insulation as FacetItem[] | undefined)?.map((i) => (
            <label key={i._id} className={rowClass}>
              <div className={leftClass}>
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={selected.insulation.includes(i._id)}
                  onChange={() => toggleFacet("insulation", i._id)}
                />
                <span className={labelClass}>{i._id}</span>
              </div>
              <span className={countClass}>{i.count}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* SIZE */}
      <Section title="Size" defaultOpen={false}>
        <div className="space-y-3">
          {(facets?.sizes as FacetItem[] | undefined)?.map((s) => (
            <label key={s._id} className={rowClass}>
              <div className={leftClass}>
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={selected.size.includes(s._id)}
                  onChange={() => toggleFacet("size", s._id)}
                />
                <span className={labelClass}>{s._id}</span>
              </div>
              <span className={countClass}>{s.count}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}