"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import { calculateCartPricing, getDisplayPriceUSA } from "@/lib/pricing-engine";
import type {
  ProductVariation,
  VariationMatrixEntry,
  VariationSelection,
} from "@/lib/ebay";

type ProductViewData = {
  id?: string;
  _id?: string;
  slug?: string;
  title: string;
  description?: string;
  priceUSD?: number;
  price?: number;
  weight?: number;
  image?: string;
  imageUrl?: string;
  images?: string[];
  sku?: string;

  // ✅ AJUSTE: specs en tu DB ya no es estrictamente Record<string,string>
  // (TNF te trae arrays/objetos como {colors, sizes, fitSelected, styleSelected})
  specs?: Record<string, any>;

  variations?: ProductVariation[];
  variationMatrix?: VariationMatrixEntry[];
  category?: any;
};

type VariationGroups = Record<string, string[]>;

function buildSelectionKey(selections: VariationSelection): string {
  return Object.keys(selections)
    .sort()
    .map((key) => `${key}:${selections[key]}`)
    .join("|");
}

function lower(s?: string) {
  return (s || "").toLowerCase();
}

function detectVariationMode(variations: ProductVariation[] = []) {
  const attrs = variations.map((v) => lower(v.attribute));

  // Detección de Calzado (Inglés y Español)
  const hasShoe =
    attrs.some((a) => a.includes("shoe size")) ||
    attrs.some((a) => a.includes("shoe width")) ||
    attrs.some((a) => a.includes("mens shoe size")) ||
    attrs.some((a) => a.includes("women") && a.includes("shoe size")) ||
    attrs.some((a) => a.includes("us shoe size")) ||
    // Agregamos detección simple de Talle para calzado implícito
    attrs.some((a) => a === "size" || a === "talle" || a === "talla");

  // Detección de Tecnología
  const hasTechCapacity =
    attrs.some((a) => a.includes("storage")) ||
    attrs.some((a) => a.includes("capacidad")) ||
    attrs.some((a) => a.includes("capacity")) ||
    attrs.some((a) => a.includes("gb")) ||
    attrs.some((a) => a.includes("tb")) ||
    attrs.some((a) => a.includes("memory")) ||
    attrs.some((a) => a.includes("ram"));

  if (hasShoe && !hasTechCapacity) return "footwear";
  if (hasTechCapacity) return "tech";
  return "generic";
}

function normalizeAttrName(
  mode: "footwear" | "tech" | "generic",
  attr: string
) {
  const k = lower(attr).trim();

  // Normalización de Color
  if (k === "color" || k === "colour" || k.includes("color")) return "Color";

  // Normalización Calzado
  if (mode === "footwear") {
    if (k.includes("shoe width") || k === "width" || k === "ancho")
      return "Shoe Width";
    // Unificamos todo lo que sea Talle/Size bajo un mismo nombre para la UI
    if (
      k.includes("shoe size") ||
      k.includes("us shoe size") ||
      k.includes("mens shoe size") ||
      k.includes("women") ||
      k === "size" ||
      k === "talle" ||
      k === "talla"
    ) {
      // Preferimos "Size" genérico o "Shoe Size (US)" si queremos ser específicos
      return "Size";
    }
  }

  // Normalización Tecnología
  if (mode === "tech") {
    if (k.includes("storage") || k.includes("capacity") || k.includes("capacidad"))
      return "Capacity";
    if (k.includes("memory") || k.includes("ram")) return "Memory";
    if (k.includes("model") || k.includes("modelo")) return "Model";
    if (k.includes("carrier")) return "Carrier";
    if (k.includes("network")) return "Network";
  }

  // Normalización Genérica (Ropa, etc)
  if (mode === "generic") {
    if (k === "size" || k.includes("size") || k === "talle" || k === "talla")
      return "Size";
  }

  return attr.trim();
}

function isBannedAttr(attrNormalized: string) {
  const k = lower(attrNormalized);
  return (
    k.includes("brand") ||
    k.includes("style code") ||
    k === "department" ||
    k === "type" ||
    k === "character" ||
    k === "product line" ||
    k === "performance/activity" ||
    k === "style" ||
    k === "model"
  );
}

function shouldKeepValue(attrNormalized: string, value: string) {
  const v = String(value ?? "").trim();
  if (!v) return false;
  const k = lower(attrNormalized);
  if ((k.includes("shoe size") || k === "size") && (v === "0" || v === "0.0"))
    return false;
  if (k === "capacity" && (v === "0" || v === "0gb" || v === "0 tb"))
    return false;
  return true;
}

// ✅ AJUSTE CRÍTICO: nunca renderizar objetos como children.
// Esto es lo que te explotaba con TNF: { colors, sizes, fitSelected, styleSelected }
function renderSpecValue(value: any): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    // Arrays de strings/números
    return value
      .map((v) => {
        if (v == null) return "";
        if (typeof v === "string") return v;
        if (typeof v === "number" || typeof v === "boolean") return String(v);
        // Objetos dentro de arrays
        try {
          return JSON.stringify(v);
        } catch {
          return String(v);
        }
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    // Caso típico TNF: {colors:[], sizes:[], fitSelected:"", styleSelected:""}
    // Lo dejamos legible:
    const keys = Object.keys(value);
    if (
      keys.includes("colors") ||
      keys.includes("sizes") ||
      keys.includes("fitSelected") ||
      keys.includes("styleSelected")
    ) {
      const parts: string[] = [];

      if (Array.isArray(value.colors) && value.colors.length > 0) {
        parts.push(`Colors: ${value.colors.join(", ")}`);
      }
      if (Array.isArray(value.sizes) && value.sizes.length > 0) {
        parts.push(`Sizes: ${value.sizes.join(", ")}`);
      }
      if (typeof value.fitSelected === "string" && value.fitSelected.trim()) {
        parts.push(`Fit: ${value.fitSelected}`);
      }
      if (typeof value.styleSelected === "string" && value.styleSelected.trim()) {
        parts.push(`Style: ${value.styleSelected}`);
      }

      if (parts.length > 0) return parts.join(" · ");
    }

    // Fallback genérico seguro:
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}


function expandVariationsToFlat(input: any): any[] {
  const variations = Array.isArray(input) ? input : [];

  if (!variations.length) return [];

  // Caso 1: ya viene "plano" estilo eBay/Nike: { attribute, value }
  const first = variations[0];
  if (first && typeof first === "object" && "attribute" in first && "value" in first) {
    return variations;
  }

  // Caso 2: viene "agrupado" TNF: { name, values: [] }
  // Lo expandimos a { attribute, value }
  const looksGrouped =
    first &&
    typeof first === "object" &&
    ("name" in first || "values" in first) &&
    Array.isArray((first as any).values);

  if (looksGrouped) {
    const out: any[] = [];
    for (const g of variations) {
      const attr = String((g as any)?.name || "").trim();
      const vals = Array.isArray((g as any)?.values) ? (g as any).values : [];
      for (const v of vals) {
        const value = String(v ?? "").trim();
        if (!attr || !value) continue;
        out.push({ attribute: attr, value });
      }
    }
    return out;
  }

  return [];
}

function pickTNFOptionsFromSpecs(specs: any): { colors: string[]; sizes: string[] } {
  const out = { colors: [] as string[], sizes: [] as string[] };

  if (!specs || typeof specs !== "object") return out;

  // Tu import guarda specs.thenorthface.colors/sizes
  const tnf = (specs as any)?.thenorthface;
  if (tnf && typeof tnf === "object") {
    if (Array.isArray(tnf.colors)) out.colors = tnf.colors.map((x: any) => String(x || "").trim()).filter(Boolean);
    if (Array.isArray(tnf.sizes)) out.sizes = tnf.sizes.map((x: any) => String(x || "").trim()).filter(Boolean);
  }

  // En algunos scrapeos TNF también viene como strings tipo "XS, S, M..."
  const sizesAll = (specs as any)?.sizesAll;
  if (!out.sizes.length && typeof sizesAll === "string") {
    out.sizes = sizesAll.split(",").map((x) => x.trim()).filter(Boolean);
  }

  return out;
}

function renderSpecValueSafe(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map((x) => String(x ?? "").trim()).filter(Boolean).join(", ");
  if (typeof v === "object") return JSON.stringify(v); // evita crash
  return String(v);
}

function shouldHideSpecRow(key: string, value: any): boolean {
  const k = (key || "").toLowerCase();

  // Ocultamos “opciones” y cosas internas que NO son ficha técnica
  if (
    k.includes("color") ||
    k.includes("size") ||
    k.includes("variant") ||
    k.includes("pricing") ||
    k.includes("styleoptions") ||
    k.includes("fitselected") ||
    k.includes("styleselected") ||
    k === "thenorthface"
  ) return true;

  // Si es un objeto grande, tampoco lo mostramos como “ficha”
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return true;

  return false;
}

export default function ProductView({ product }: { product: ProductViewData }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const config = usePricing();
    const normalizedVariations = useMemo(() => {
    const flat = expandVariationsToFlat(product.variations);

    // Si no hay variaciones “plano”, intentamos levantar opciones desde specs TNF
    if (!flat.length) {
      const tnf = pickTNFOptionsFromSpecs((product as any)?.specs);
      const out: any[] = [];
      for (const c of tnf.colors) out.push({ attribute: "Color", value: c });
      for (const s of tnf.sizes) out.push({ attribute: "Size", value: s });
      return out;
    }

    return flat;
  }, [product.variations, (product as any)?.specs]);

  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return [product.imageUrl || product.image].filter(Boolean) as string[];
  }, [product]);

  const [activeImg, setActiveImg] = useState(productImages[0] || "");

  const variationMode = useMemo(
    () => detectVariationMode(normalizedVariations || []),
    [normalizedVariations]
  );

  // ✅ AQUÍ ESTABA EL PROBLEMA: Agregamos "size", "talle", "talla" a las listas permitidas
  const allowedKeys = useMemo(() => {
    if (variationMode === "footwear") {
      return [
        "shoe size",
        "us shoe size",
        "mens shoe size",
        "women",
        "shoe width",
        "width",
        "ancho",
        "color",
        "colour",
        "size",
        "talle",
        "talla", // ✅ CRÍTICO: Permitir Size y Talle simple
      ];
    }
    if (variationMode === "tech") {
      return [
        "color",
        "colour",
        "storage",
        "capacity",
        "capacidad",
        "memory",
        "ram",
        "carrier",
        "network",
        "size",
        "talle", // A veces tech tiene size (ej: Apple Watch)
      ];
    }
    // Genérico
    return ["color", "colour", "size", "talle", "talla", "dimensiones"];
  }, [variationMode]);

const groups = useMemo<VariationGroups>(() => {
  const out: VariationGroups = {};

  // 1) ✅ Tu lógica actual (variations -> groups)
  for (const v of normalizedVariations || []) {
    if (!v.attribute || !v.value) continue;
    const rawAttr = v.attribute.trim();
    const rawVal = String(v.value).trim();

    const attrKey = lower(rawAttr);
    const isAllowed = allowedKeys.some((k) => attrKey.includes(k) || attrKey === k);
    if (!isAllowed) continue;

    const attr = normalizeAttrName(variationMode, rawAttr);
    if (isBannedAttr(attr)) continue;
    if (!shouldKeepValue(attr, rawVal)) continue;

    out[attr] = out[attr] || [];
    if (!out[attr].includes(rawVal)) out[attr].push(rawVal);
  }

  // 2) ✅ Fallback TNF: si NO hay variaciones, armamos opciones desde specs
  //    (esto hace que colores/talles aparezcan como selectores como Nike)
  const specs: any = (product as any)?.specs || {};
  const hasNoVariationOptions = Object.keys(out).length === 0;

  if (hasNoVariationOptions && specs && typeof specs === "object") {
    // Colors (TNF)
    const specColors =
      Array.isArray(specs.colors) ? specs.colors :
      typeof specs.colors === "string" ? specs.colors.split(",").map((s: string) => s.trim()) :
      [];

    // Sizes (TNF) - puede venir como sizesAll o sizes
    const specSizesRaw =
      Array.isArray(specs.sizesAll) ? specs.sizesAll :
      Array.isArray(specs.sizes) ? specs.sizes :
      typeof specs.sizesAll === "string" ? specs.sizesAll :
      typeof specs.sizes === "string" ? specs.sizes :
      "";

    const specSizes =
      Array.isArray(specSizesRaw)
        ? specSizesRaw.map((s: any) => String(s).trim()).filter(Boolean)
        : String(specSizesRaw)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    if (specColors.length > 0) {
      out["Color"] = Array.from(new Set(specColors));
    }
    if (specSizes.length > 0) {
      out["Size"] = Array.from(new Set(specSizes));
    }

    // Opcional: si tenés fitSelected / styleSelected y querés que sean opciones
    // (si preferís que queden en Ficha Técnica, dejalo comentado)
    const fit = typeof specs.fitSelected === "string" ? specs.fitSelected.trim() : "";
    const style = typeof specs.styleSelected === "string" ? specs.styleSelected.trim() : "";
    if (fit) out["Fit"] = [fit];
    if (style) out["Style"] = [style];
  }

  // 3) ✅ Ordenamiento (igual que ya tenías)
  const sortNumeric = (arr: string[]) =>
    arr.sort((a, b) => {
      const na = Number.parseFloat(a.replace(/[^0-9.]/g, ""));
      const nb = Number.parseFloat(b.replace(/[^0-9.]/g, ""));
      if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
      return na - nb;
    });

  if (out["Shoe Size (US)"]) sortNumeric(out["Shoe Size (US)"]);
  if (out["Size"]) sortNumeric(out["Size"]);

  if (out["Capacity"]) {
    out["Capacity"].sort((a, b) => {
      const pa = Number.parseFloat(a.replace(/[^0-9.]/g, ""));
      const pb = Number.parseFloat(b.replace(/[^0-9.]/g, ""));
      if (Number.isNaN(pa) || Number.isNaN(pb)) return a.localeCompare(b);
      return pa - pb;
    });
  }
  if (out["Color"]) out["Color"].sort((a, b) => a.localeCompare(b));

  return out;
}, [normalizedVariations, allowedKeys, variationMode]);

  const [selected, setSelected] = useState<VariationSelection>({});

  useEffect(() => {
    if (productImages.length > 0) setActiveImg(productImages[0]);
    const initialSelection: VariationSelection = {};
    Object.keys(groups).forEach((attr) => {
      const first = groups[attr]?.[0];
      if (first) initialSelection[attr] = first;
    });
    setSelected(initialSelection);
  }, [product.slug, product.id, productImages, groups]);

  // Resto de lógica de combinación y precios
  const currentCombination = useMemo(() => {
    if (!product.variationMatrix?.length) return undefined;
    const selectionKey = buildSelectionKey(selected);
    if (!selectionKey) return undefined;
    return product.variationMatrix.find(
      (entry) => buildSelectionKey(entry.selections) === selectionKey
    );
  }, [product.variationMatrix, selected]);

  const currentVariation = useMemo(() => {
    return (normalizedVariations || []).find(
      (v) =>
        normalizeAttrName(variationMode, v.attribute) === Object.keys(selected)[0] && // Aproximación
        v.value === Object.values(selected)[0]
    );
  }, [selected, normalizedVariations, variationMode]);

  const currentPrice = useMemo(() => {
    return currentCombination?.price || currentVariation?.price || product.priceUSD || product.price || 0;
  }, [currentCombination?.price, currentVariation?.price, product.priceUSD, product.price]);

  const pricingResult = useMemo(() => {
    const tempItem = {
      priceUSD: currentPrice,
      weight: product.weight || 0,
      quantity: 1,
    };
    const calc = calculateCartPricing([tempItem], config);
    const marketPriceUSA = getDisplayPriceUSA(currentPrice, config);
    return {
      finalPrice: calc.totalFinal,
      marketPriceUSA,
    };
  }, [currentPrice, product.weight, config]);

  const estimatedArg = pricingResult.finalPrice;

  const isSelectionComplete = useMemo(() => {
    const requiredAttributes = Object.keys(groups);
    if (requiredAttributes.length === 0) return true;
    return requiredAttributes.every((attr) => selected[attr] && selected[attr] !== "");
  }, [selected, groups]);

  const handleAddToCart = () => {
      if (!isSelectionComplete) return;

      // ✅ FIX TS: id SIEMPRE string (CartItem.id es obligatorio)
        const cartId =
          (product?._id && String(product._id)) ||
          (product?.id && String(product.id)) ||
          (product?.slug && String(product.slug)) ||
          `tmp-${Date.now()}`;

        addToCart({
          id: cartId,
          sku: currentCombination?.sku || currentVariation?.sku || product.sku || "",
          slug: product.slug || cartId,
          title: product.title,
          priceUSD: currentPrice,
          weight: product.weight || 0,
          estimatedUSD: estimatedArg,
          netMargin: 0,
          image: activeImg,
          quantity: 1,
          selections: selected,
          specs: product.specs,
        });

        router.push("/carrito");
        };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mb-0">
        {/* GALERÍA */}
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-8 h-[450px] flex items-center justify-center shadow-sm relative overflow-hidden">
            {activeImg ? (
              <Image
                src={activeImg}
                alt={product.title}
                fill
                className="object-contain p-6 transition-all duration-500"
                unoptimized
                priority
              />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-20">
                <span className="text-6xl font-black">📷</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">
                  Sin Imagen
                </span>
              </div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              {productImages.map((img: string, idx: number) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setActiveImg(img)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-white transition-all ${
                    activeImg === img
                      ? "border-[#0A2647] scale-105 shadow-md"
                      : "border-slate-100 opacity-50 hover:opacity-100"
                  }`}
                  type="button"
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="object-contain w-full h-full p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* INFO Y SELECCIÓN */}
        <section className="rounded-xl bg-white border border-slate-200 p-6 flex flex-col gap-4 h-full shadow-sm">
          {/* PRICE CARD */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const brandLabel =
                    (product as any)?.brand || (product as any)?.vendor || (product as any)?.store;
                  return brandLabel ? (
                    <span className="inline-flex items-center rounded-full px-3 py-1 bg-white/60 border border-white/50 backdrop-blur-sm shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0A2647]/80">
                        {brandLabel}
                      </span>
                    </span>
                  ) : null;
                })()}
                <span className="hidden sm:inline-block h-4 w-px bg-emerald-900/10" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/85">
                  Puesto en Argentina
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full px-3 py-1 bg-emerald-900/[0.06] border border-emerald-900/[0.08]">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/60">
                  Final All-in
                </span>
              </span>
            </div>

            <p className="text-4xl font-black text-emerald-700 leading-none">
              USD{" "}
              {estimatedArg?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mt-2 text-emerald-700/70">
              Flete Internacional, Aduana y Gestión incluidos
            </p>
          </div>

          {/* SELECTORES DE VARIACIONES */}
          {Object.entries(groups).map(([attr, values]: any) => {
            const lowerAttr = attr.toLowerCase();
            // Lógica visual: Si es Color o Talle con pocas opciones -> Botones. Si son muchas opciones -> Dropdown
            const isDropdown = values.length > 8;

            return (
              <div key={attr}>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  {attr}
                </p>

                {isDropdown ? (
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border-2 border-slate-200 text-slate-800 text-sm font-bold py-3 px-4 rounded-xl focus:outline-none focus:border-[#0A2647] focus:ring-1 focus:ring-[#0A2647] transition-all cursor-pointer shadow-sm"
                      value={selected[attr] || ""}
                      onChange={(e) => setSelected({ ...selected, [attr]: e.target.value })}
                    >
                      <option value="" disabled>
                        Seleccionar {attr}
                      </option>
                      {values.map((val: string) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {values.map((val: string) => (
                      <button
                        key={`${attr}-${val}`}
                        onClick={() => setSelected({ ...selected, [attr]: val })}
                        className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                          selected[attr] === val
                            ? "bg-[#0A2647] text-white border-[#0A2647] shadow-lg scale-105"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                        type="button"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={!isSelectionComplete}
              className={`w-full rounded-2xl font-black py-4 shadow-xl transition active:scale-95 uppercase text-sm tracking-widest ${
                isSelectionComplete
                  ? "bg-[#E02020] text-white hover:bg-red-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-dashed border-slate-200"
              }`}
              type="button"
            >
              {isSelectionComplete ? "Agregar al carrito" : "Seleccione las opciones"}
            </button>
          </div>

          {/* Iconos de confianza (Pagos, Entrega, Garantía) */}
          <div className="mt-2 space-y-3">
            {/* ... (Tus iconos se mantienen igual) ... */}
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-emerald-100">
                <span className="text-lg">💳</span>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">
                  Pagos
                </p>
                <p className="text-sm font-black text-emerald-800 tracking-tight">
                  Pagá con Mercado Pago o MODO
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-lg">🚚</span>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Entrega
                </p>
                <p className="text-sm font-black text-[#0A2647] tracking-tight">
                  Llega en 8-12 días <span className="text-red-600 font-black">Express</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white border border-slate-200 p-8 mt-2 mb-2 mx-auto shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
          {product.title}
        </h1>
        <p className="text-sm leading-relaxed text-slate-700 mb-4 whitespace-pre-line font-medium">
          {product.description || "Descripción disponible en la tienda oficial."}
        </p>

    {product.specs && Object.keys(product.specs).length > 0 && (
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Ficha Técnica
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries((product as any).specs || {})
            // ✅ NO mostrar cosas que en realidad son opciones (colores/talles) o blobs/objetos internos
            .filter(([key, value]) => {
              const k = String(key || "").toLowerCase();

              // Ocultamos “opciones” y cosas internas (TNF y variantes)
              if (
                k.includes("color") ||
                k.includes("size") ||
                k.includes("talle") ||
                k.includes("talla") ||
                k.includes("variant") ||
                k.includes("pricing") ||
                k.includes("styleoptions") ||
                k.includes("fitselected") ||
                k.includes("styleselected") ||
                k === "thenorthface"
              ) return false;

              // Si es un objeto (no array) lo ocultamos para no “ensuciar” ni romper render
              if (typeof value === "object" && value !== null && !Array.isArray(value)) return false;

              return true;
            })
            .map(([key, value]: any) => {
              // ✅ render seguro: nunca renderizar un objeto directo
              const safeValue = (() => {
                if (value == null) return "";
                if (typeof value === "string") return value;
                if (typeof value === "number") return String(value);
                if (Array.isArray(value)) return value.map((x) => String(x ?? "").trim()).filter(Boolean).join(", ");
                if (typeof value === "object") return JSON.stringify(value);
                return String(value);
              })();

              return (
                <div key={key} className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                    {key}
                  </span>
                  <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                    {safeValue}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    )}
      </section>
    </div>
  );
}