// src/lib/pricing-engine.ts
import { getLogisticProfile, COURIER_CONFIG_DEFAULT } from "@/lib/logistics-profiles";

export const PRICING_CONFIG_DEFAULT = {
  // A) VARIABLES COBRADAS (UI)
  CHARGED_ADUANA: 40,
  CHARGED_LOCAL: 25,
  CHARGED_FREIGHT_KG: 15,
  BASE_FEE_PERCENT: 0.1,

  // B) COSTOS REALES INTERNOS
  REAL_ADUANA: 10,
  REAL_LOCAL: 10,
  REAL_FREIGHT_KG: 4.5,

  // C) GUARDRAILS FINANCIEROS
  PAYMENT_COST_PERCENT: 0.075,
  MIN_NET_MARGIN_PERCENT: 0.15,
  MIN_ORDER_TOTAL_USD: 50,
  LIMIT_ADJUST_LOW: 0.25,
  LIMIT_ADJUST_HIGH: 0.18,

  // D) POLÍTICA LEGACY DE PESOS (fallback)
  WEIGHT_DEFAULT_KG: 1.0,
  WEIGHT_CATEGORY_MAP: {
    ropa: 0.5,
    shirt: 0.5,
    dress: 0.5,
    pants: 0.6,
    zapatilla: 1.0,
    shoe: 1.0,
    sneaker: 1.2,
    reloj: 0.5,
    watch: 0.5,
    phone: 0.5,
    celular: 0.5,
    laptop: 2.5,
    notebook: 2.5,
    tablet: 0.8,
    ipad: 0.8,
    case: 0.2,
    funda: 0.2,
    cargador: 0.2,
  },
};

export const PRICING_CONFIG = PRICING_CONFIG_DEFAULT;

/**
 * ✅ NEW: Determina el peso cobrable PRIORITARIO desde logisticProfile.billingWeightKg
 * Si no existe, usa fallback legacy getChargeableWeight (keywords/default).
 *
 * Retorna { kg, isImputed, source }
 */
export const getBillingWeightKg = (item: any, config = PRICING_CONFIG_DEFAULT) => {
    // 1) Si viene logisticProfile válido -> usarlo
    const bw = item?.logisticProfile?.billingWeightKg;
    if (typeof bw === "number" && bw > 0) {
      const src = item?.logisticProfile?.source;
      const isImputed = src === "estimated_rule" || src === "estimated_ebay";
      return { kg: bw, isImputed, source: src ?? "logisticProfile" };
    }

    // 2) BACKSTOP: si NO viene logisticProfile, lo calculamos acá (con config del admin si existe)
    try {
      const courierConfig = {
        ...COURIER_CONFIG_DEFAULT,
        volumetricDivisor:
          Number(config.volumetricDivisor ?? config.VOLUMETRIC_DIVISOR) || COURIER_CONFIG_DEFAULT.volumetricDivisor,
        globalMinBillableKg:
          Number(config.globalMinBillableKg ?? config.GLOBAL_MIN_BILLABLE_KG) || COURIER_CONFIG_DEFAULT.globalMinBillableKg,
        fallbackBufferPct:
          Number(config.fallbackBufferPct ?? config.FALLBACK_BUFFER_PCT) || COURIER_CONFIG_DEFAULT.fallbackBufferPct,
        ebayExtraBufferPct:
          Number(config.ebayExtraBufferPct ?? config.EBAY_EXTRA_BUFFER_PCT) || COURIER_CONFIG_DEFAULT.ebayExtraBufferPct,
        bucketsKg: Array.isArray(config.bucketsKg ?? config.BUCKETS_KG)
          ? (config.bucketsKg ?? config.BUCKETS_KG)
          : COURIER_CONFIG_DEFAULT.bucketsKg,
      };

      const lp = getLogisticProfile(
        {
          title: item?.title,
          category: item?.category,
          brand: item?.brand ?? item?.store,
          weightKg: item?.weightKg ?? item?.weight,
          dimensionsCm: item?.dimensionsCm ?? item?.specs?.dimensionsCm ?? item?.specs?.dimensions,
          source: item?.source === "ebay" ? "ebay" : "mongo",
          ebayCategoryPath: item?.ebayCategoryPath,
        },
        { courierConfig }
      );

      if (typeof lp?.billingWeightKg === "number" && lp.billingWeightKg > 0) {
        const src = lp.source;
        const isImputed = src === "estimated_rule" || src === "estimated_ebay";
        return { kg: lp.billingWeightKg, isImputed, source: `runtime:${src}` };
      }
    } catch (e) {
      // swallow -> fallback legacy
    }

    // 3) Último recurso: legacy (DEBERÍA NO PASAR YA)
    const legacy = getChargeableWeight(item, config);
    return { kg: legacy.kg, isImputed: legacy.isImputed, source: legacy.source ?? "legacy" };
  };

/**
 * 🕵️‍♂️ LEGACY: Determina el peso cobrable (Real o Imputado) por keywords/default
 */
export const getChargeableWeight = (
  item: any,
  config = PRICING_CONFIG_DEFAULT
) => {
  if (item.weight && typeof item.weight === "number" && item.weight > 0) {
    return { kg: item.weight, isImputed: false };
  }

  const map =
    config.WEIGHT_CATEGORY_MAP || PRICING_CONFIG_DEFAULT.WEIGHT_CATEGORY_MAP;
  const cfgAny = config as any;
  const defaultKg =
    (config.WEIGHT_DEFAULT_KG ??
      cfgAny.weight_default_kg ??
      cfgAny.weightDefaultKg) ??
    PRICING_CONFIG_DEFAULT.WEIGHT_DEFAULT_KG;

  const textToSearch = `${item.category || ""} ${item.title || ""}`.toLowerCase();

  for (const [key, val] of Object.entries(map)) {
    if (textToSearch.includes(key)) {
      return { kg: Number(val), isImputed: true, source: "category" };
    }
  }

  return { kg: Number(defaultKg), isImputed: true, source: "default" };
};

/**
 * 🏷️ HELPER: Precio Visual (USA con Margen)
 */
export const getDisplayPriceUSA = (rawPrice: number, dynamicConfig?: any) => {
  const config = dynamicConfig || PRICING_CONFIG_DEFAULT;
  const margin = (config.base_fee_percent ?? config.BASE_FEE_PERCENT) ?? 0.1;
  return rawPrice * (1 + margin);
};

/**
 * 🧮 HELPER PRIVADO: Resuelve valores numéricos tratando null como 0 si es necesario
 */
const resolveVal = (valA: any, valB: any, defaultVal: number) => {
  if (valA !== undefined && valA !== null) return Number(valA);
  if (valB !== undefined && valB !== null) return Number(valB);
  return defaultVal;
};

const resolveValOrZero = (valA: any, valB: any, defaultVal: number) => {
  if (valA === null) return 0;
  if (valA !== undefined) return Number(valA);

  if (valB === null) return 0;
  if (valB !== undefined) return Number(valB);

  return defaultVal;
};

export const calculateCartPricing = (items: any[], dynamicConfig?: any) => {
  const config = dynamicConfig || PRICING_CONFIG_DEFAULT;

  const BASE_FEE = resolveVal(config.base_fee_percent, config.BASE_FEE_PERCENT, 0.1);
  const FREIGHT_COST = resolveVal(
    config.charged_freight_kg,
    config.CHARGED_FREIGHT_KG,
    15
  );

  const ADUANA_COST = resolveValOrZero(
    config.charged_aduana,
    config.CHARGED_ADUANA,
    40
  );
  const LOCAL_COST = resolveValOrZero(
    config.charged_local,
    config.CHARGED_LOCAL,
    25
  );

  const REAL_FREIGHT = resolveVal(
    config.real_freight_kg,
    config.REAL_FREIGHT_KG,
    4.5
  );
  const REAL_ADUANA = resolveVal(config.real_aduana, config.REAL_ADUANA, 10);
  const REAL_LOCAL = resolveVal(config.real_local, config.REAL_LOCAL, 10);
  const PAYMENT_COST = resolveVal(
    config.payment_cost_percent,
    config.PAYMENT_COST_PERCENT,
    0.075
  );
  const MIN_MARGIN = resolveVal(
    config.min_net_margin_percent,
    config.MIN_NET_MARGIN_PERCENT,
    0.15
  );
  const MIN_ORDER = resolveVal(
    config.min_order_total_usd,
    config.MIN_ORDER_TOTAL_USD,
    50
  );

  if (!items || items.length === 0) {
    return {
      totalFinal: 0,
      breakdown: [],
      checkoutEnabled: false,
      reason: "Carrito vacío",
    };
  }

  // 1) PESOS (nuevo: billingWeightKg prioritario)
  let weightTotal = 0;
  let isWeightImputed = false;

  const analyzedItems = items.map((item) => {
    const qty = item.quantity ?? 1;
    const { kg, isImputed } = getBillingWeightKg(item, config);
    if (isImputed) isWeightImputed = true;
    weightTotal += kg * qty;

    // compat UI vieja (CartPageContent)
    return { ...item, chargeableWeight: kg };
  });

  const rawPriceUSA = analyzedItems.reduce(
    (acc: number, item: any) => acc + (item.priceUSD || 0) * (item.quantity ?? 1),
    0
  );

  // 2) COSTOS
  const publicPriceUSA = rawPriceUSA * (1 + BASE_FEE);
  const iva = rawPriceUSA * 0.21;
  const freight = weightTotal * FREIGHT_COST;
  const aduana = ADUANA_COST;
  const local = LOCAL_COST;

  let gestionLine = rawPriceUSA * BASE_FEE;

  // 3) PROFITABILITY CHECK (igual que antes)
  const totalRealCost = rawPriceUSA + weightTotal * REAL_FREIGHT + REAL_ADUANA + REAL_LOCAL;

  const evaluate = (g: number) => {
    const total = publicPriceUSA + iva + freight + aduana + local + g;
    if (total <= 0) return { total: 0, marginPercent: 0 };

    const netProfit = total * (1 - PAYMENT_COST) - totalRealCost;
    const marginPercent = netProfit / total;
    return { total, marginPercent };
  };

  let current = evaluate(gestionLine);

  if (current.marginPercent < MIN_MARGIN) {
    const limitLow = resolveVal(config.limit_adjust_low, config.LIMIT_ADJUST_LOW, 0.25);
    const limitHigh = resolveVal(config.limit_adjust_high, config.LIMIT_ADJUST_HIGH, 0.18);
    const limit = rawPriceUSA < 150 ? limitLow : limitHigh;
    const maxAllowed = rawPriceUSA * limit; // (lo dejás para futuro)

    const targetTotal = totalRealCost / (1 - PAYMENT_COST - MIN_MARGIN);
    const requiredGestion = targetTotal - (publicPriceUSA + iva + freight + aduana + local);

    const newGestion = Math.max(0, requiredGestion);

    // ✅ tu regla actual: no cobramos menos que base
    gestionLine = Math.max(gestionLine, newGestion);

    // (si querés activar tope duro, descomentá)
    // gestionLine = Math.min(Math.max(gestionLine, newGestion), maxAllowed);

    current = evaluate(gestionLine);
  }

  let checkoutEnabled = true;
  let reason = "";

  /*
  if (current.total < MIN_ORDER) {
    checkoutEnabled = false;
    reason = `Pedido mínimo USD ${MIN_ORDER}`;
  }
  */

  return {
    totalFinal: Number(current.total.toFixed(2)),
    checkoutEnabled,
    reason,
    isWeightImputed,
    totalWeightKg: Number(weightTotal.toFixed(2)),
    breakdown: [
      { label: "Precio Productos USA", amount: publicPriceUSA },
      { label: "IVA Importación (21%)", amount: iva },
      { label: `Flete Internacional (${weightTotal.toFixed(2)} Kg)`, amount: freight },
      { label: "Aduana y Tasas", amount: aduana },
      { label: "Gestión y Seguro USA SHOP BOX", amount: gestionLine },
      { label: "Logística Nacional", amount: local },
    ],
  };
};