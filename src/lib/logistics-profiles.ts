// ✅ USA SHOP BOX - Logistic Profiles & Estimation Engine (Courier)
// TS strict friendly. For Mongo products + eBay runtime items (black box).
// Strategy: protect margin via conservative defaults, buffers, and bucket rounding.

export type Confidence = "high" | "medium" | "low";
export type LogisticSource =
  | "measured"
  | "vendor"
  | "estimated_rule"
  | "estimated_ebay"
  | "manual_override";

export type DimensionsCm = { l: number; w: number; h: number };

export type LogisticProfile = {
  realWeightKg?: number;
  dimensionsCm?: DimensionsCm;
  volumetricWeightKg?: number;

  /** final billable weight used for pricing */
  billingWeightKg: number;

  /** bucketed billable weight (optional) */
  bucketKg?: number;

  source: LogisticSource;
  confidence: Confidence;

  /** buffer applied over estimated data (0.15 = 15%) */
  bufferPctApplied: number;

  /** human-readable reason for debugging */
  notes?: string;
};

export type CourierConfig = {
  volumetricDivisor: number; // default 5000 (cm)
  useBuckets: boolean;
  bucketsKg: number[];
  globalMinBillableKg: number;

  /** buffer used when missing data (no dims / no weight) */
  fallbackBufferPct: number;

  /** extra buffer on ebay items (black box risk) */
  ebayExtraBufferPct: number;
};

export const COURIER_CONFIG_DEFAULT: CourierConfig = {
  volumetricDivisor: 5000,
  useBuckets: true,
  bucketsKg: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7, 10, 12, 15, 20, 25, 30],
  globalMinBillableKg: 0.5,
  fallbackBufferPct: 0.2,
  ebayExtraBufferPct: 0.12, // ✅ default razonable para “caja negra”
};

export type LogisticType =
  | "electronics_small"
  | "electronics_medium"
  | "footwear"
  | "apparel"
  | "cooler_hard"
  | "drinkware"
  | "bags_luggage"
  | "home_small"
  | "home_bulky"
  | "tools"
  | "toys"
  | "beauty"
  | "sports"
  | "auto_parts"
  | "bulky_misc";

export type LogisticTypeProfile = {
  type: LogisticType;
  label: string;
  defaultRealKg: number;
  defaultDimsCm?: DimensionsCm;
  bufferPct: number;
  minBillableKg: number;
  bucketsKg?: number[];
  estimateConfidence: Confidence;
};

export const LOGISTIC_TYPE_PROFILES: Record<LogisticType, LogisticTypeProfile> = {
  electronics_small: {
    type: "electronics_small",
    label: "Electrónica chica (teléfono/accesorio)",
    defaultRealKg: 0.6,
    defaultDimsCm: { l: 18, w: 12, h: 8 },
    bufferPct: 0.12,
    minBillableKg: 0.5,
    estimateConfidence: "medium",
  },
  electronics_medium: {
    type: "electronics_medium",
    label: "Electrónica mediana (notebook/tablet/consola)",
    defaultRealKg: 2.8,
    defaultDimsCm: { l: 40, w: 30, h: 10 },
    bufferPct: 0.15,
    minBillableKg: 1,
    estimateConfidence: "medium",
  },
  footwear: {
    type: "footwear",
    label: "Calzado (zapatillas/botas)",
    defaultRealKg: 1.7,
    defaultDimsCm: { l: 35, w: 25, h: 15 },
    bufferPct: 0.18,
    minBillableKg: 1,
    estimateConfidence: "medium",
  },
  apparel: {
    type: "apparel",
    label: "Indumentaria (ropa)",
    defaultRealKg: 0.9,
    defaultDimsCm: { l: 30, w: 25, h: 6 },
    bufferPct: 0.2,
    minBillableKg: 0.5,
    estimateConfidence: "low",
  },
  cooler_hard: {
    type: "cooler_hard",
    label: "Hielera rígida (hard cooler)",
    defaultRealKg: 10,
    defaultDimsCm: { l: 55, w: 40, h: 40 },
    bufferPct: 0.22,
    minBillableKg: 5,
    estimateConfidence: "low",
    bucketsKg: [5, 7, 10, 12, 15, 20, 25, 30, 40],
  },
  drinkware: {
    type: "drinkware",
    label: "Drinkware (botellas/tumblers)",
    defaultRealKg: 1.0,
    defaultDimsCm: { l: 25, w: 12, h: 12 },
    bufferPct: 0.15,
    minBillableKg: 0.5,
    estimateConfidence: "medium",
  },
  bags_luggage: {
    type: "bags_luggage",
    label: "Bolsos / Mochilas / Valijas",
    defaultRealKg: 2.3,
    defaultDimsCm: { l: 50, w: 35, h: 20 },
    bufferPct: 0.2,
    minBillableKg: 1,
    estimateConfidence: "low",
  },
  home_small: {
    type: "home_small",
    label: "Hogar chico (pequeños ítems)",
    defaultRealKg: 1.2,
    defaultDimsCm: { l: 28, w: 20, h: 12 },
    bufferPct: 0.2,
    minBillableKg: 0.5,
    estimateConfidence: "low",
  },
  home_bulky: {
    type: "home_bulky",
    label: "Hogar voluminoso",
    defaultRealKg: 6,
    defaultDimsCm: { l: 60, w: 45, h: 35 },
    bufferPct: 0.25,
    minBillableKg: 3,
    estimateConfidence: "low",
    bucketsKg: [3, 5, 7, 10, 12, 15, 20, 25, 30, 40],
  },
  tools: {
    type: "tools",
    label: "Herramientas",
    defaultRealKg: 3.5,
    defaultDimsCm: { l: 40, w: 25, h: 15 },
    bufferPct: 0.2,
    minBillableKg: 1,
    estimateConfidence: "low",
  },
  toys: {
    type: "toys",
    label: "Juguetes / Coleccionables",
    defaultRealKg: 1.5,
    defaultDimsCm: { l: 35, w: 25, h: 15 },
    bufferPct: 0.18,
    minBillableKg: 0.5,
    estimateConfidence: "low",
  },
  beauty: {
    type: "beauty",
    label: "Beauty / Cosmética",
    defaultRealKg: 0.8,
    defaultDimsCm: { l: 20, w: 15, h: 8 },
    bufferPct: 0.18,
    minBillableKg: 0.5,
    estimateConfidence: "medium",
  },
  sports: {
    type: "sports",
    label: "Deportes (equipamiento)",
    defaultRealKg: 3.0,
    defaultDimsCm: { l: 50, w: 30, h: 20 },
    bufferPct: 0.22,
    minBillableKg: 1,
    estimateConfidence: "low",
  },
  auto_parts: {
    type: "auto_parts",
    label: "Autopartes",
    defaultRealKg: 4.5,
    defaultDimsCm: { l: 45, w: 35, h: 25 },
    bufferPct: 0.25,
    minBillableKg: 2,
    estimateConfidence: "low",
    bucketsKg: [2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 40],
  },
  bulky_misc: {
    type: "bulky_misc",
    label: "Voluminoso / Misceláneo",
    defaultRealKg: 4,
    defaultDimsCm: { l: 50, w: 40, h: 25 },
    bufferPct: 0.25,
    minBillableKg: 2,
    estimateConfidence: "low",
  },
};

export const EBAY_KEYWORD_RULES: Array<{ type: LogisticType; keywords: string[] }> = [
  { type: "cooler_hard", keywords: ["cooler", "hard cooler", "ice chest", "yeti", "roadie", "tundra"] },
  { type: "drinkware", keywords: ["tumbler", "bottle", "rambler", "mug", "cup", "thermos", "stanley"] },
  {
    type: "electronics_medium",
    keywords: [
      "laptop","notebook","macbook","thinkpad","dell xps","gaming laptop",
      "ipad","tablet","ps5","playstation","xbox","nintendo switch","console",
      "graphics card","gpu",
    ],
  },
  {
    type: "electronics_small",
    keywords: [
      "iphone","samsung","galaxy","pixel","smartphone","phone",
      "airpods","earbuds","headphones","smartwatch","apple watch",
      "charger","cable","power bank",
    ],
  },
  {
    type: "footwear",
    keywords: [
      "sneaker","sneakers","shoe","shoes","nike","adidas","new balance",
      "asics","dunk","jordan","air max","yeezy","boot","boots",
    ],
  },
  {
    type: "apparel",
    keywords: ["jacket","hoodie","sweater","tshirt","t-shirt","shirt","pants","jeans","shorts","coat","parka","patagonia","filson","tee"],
  },
  { type: "bags_luggage", keywords: ["backpack", "bag", "luggage", "suitcase", "carry-on", "duffel"] },
  { type: "auto_parts", keywords: ["car part", "auto part", "bumper", "headlight", "taillight", "brake", "rotor", "caliper", "oil filter", "spark plug", "radiator"] },
  { type: "tools", keywords: ["tool", "drill", "saw", "wrench", "socket", "dewalt", "milwaukee"] },
  { type: "beauty", keywords: ["perfume", "eau de", "fragrance", "skincare", "makeup", "cosmetic"] },
  { type: "toys", keywords: ["lego", "toy", "figure", "collectible", "funko", "pokemon", "cards"] },
  { type: "sports", keywords: ["helmet", "gloves", "golf", "tennis", "skate", "surf", "snowboard", "ski", "bike", "bicycle"] },
];

export type MinimalProductLike = {
  title?: string;
  category?: string;
  brand?: string;

  weightKg?: number;
  dimensionsCm?: DimensionsCm;

  weightGrams?: number;
  weightLbs?: number;

  ebayCategoryPath?: string;
  source?: "mongo" | "ebay" | "other";
};

export function roundUpToBucket(valueKg: number, bucketsKg: number[]): number {
  for (const b of bucketsKg) {
    if (valueKg <= b) return b;
  }
  return Math.ceil(valueKg);
}

export function calcVolumetricKg(dims: DimensionsCm, divisor: number): number {
  const raw = (dims.l * dims.w * dims.h) / divisor;
  return Math.round(raw * 100) / 100;
}

export function normalizeWeightKg(input: MinimalProductLike): number | undefined {
  if (typeof input.weightKg === "number" && input.weightKg > 0) return input.weightKg;
  if (typeof input.weightGrams === "number" && input.weightGrams > 0) return Math.round((input.weightGrams / 1000) * 1000) / 1000;
  if (typeof input.weightLbs === "number" && input.weightLbs > 0) return Math.round((input.weightLbs * 0.45359237) * 1000) / 1000;
  return undefined;
}

export function inferLogisticTypeFromText(p: MinimalProductLike): LogisticType {
  const hay = [p.title, p.category, p.brand, p.ebayCategoryPath].filter(Boolean).join(" ").toLowerCase();

  for (const rule of EBAY_KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (hay.includes(kw.toLowerCase())) return rule.type;
    }
  }

  const cat = (p.category || "").toLowerCase();
  if (cat.includes("phone") || cat.includes("celular") || cat.includes("smart")) return "electronics_small";
  if (cat.includes("notebook") || cat.includes("laptop") || cat.includes("comput")) return "electronics_medium";
  if (cat.includes("shoe") || cat.includes("zapat") || cat.includes("calzado")) return "footwear";
  if (cat.includes("ropa") || cat.includes("apparel") || cat.includes("clothing")) return "apparel";

  return "bulky_misc";
}

function applyEbayExtra(bufferPct: number, isEbay: boolean, cfg: CourierConfig): number {
  if (!isEbay) return bufferPct;
  return bufferPct + cfg.ebayExtraBufferPct;
}

export function getLogisticProfile(
  product: MinimalProductLike,
  opts?: {
    courierConfig?: Partial<CourierConfig>;
    forcedType?: LogisticType;
    manualBillingWeightKg?: number;
    vendorProvided?: boolean;
  }
): LogisticProfile {
  const cfg: CourierConfig = { ...COURIER_CONFIG_DEFAULT, ...(opts?.courierConfig || {}) };
  const isEbay = product.source === "ebay";

  if (typeof opts?.manualBillingWeightKg === "number" && opts.manualBillingWeightKg > 0) {
    const bw = Math.max(opts.manualBillingWeightKg, cfg.globalMinBillableKg);
    const bucket = cfg.useBuckets ? roundUpToBucket(bw, cfg.bucketsKg) : undefined;
    return {
      billingWeightKg: bucket ?? bw,
      bucketKg: bucket,
      source: "manual_override",
      confidence: "high",
      bufferPctApplied: 0,
      notes: "manual override billing weight",
    };
  }

  const realWeightKg = normalizeWeightKg(product);
  const dims = product.dimensionsCm;

  if (typeof realWeightKg === "number" && realWeightKg > 0 && dims) {
    const vol = calcVolumetricKg(dims, cfg.volumetricDivisor);
    const rawBilling = Math.max(realWeightKg, vol, cfg.globalMinBillableKg);
    const bucket = cfg.useBuckets ? roundUpToBucket(rawBilling, cfg.bucketsKg) : undefined;

    return {
      realWeightKg,
      dimensionsCm: dims,
      volumetricWeightKg: vol,
      billingWeightKg: bucket ?? rawBilling,
      bucketKg: bucket,
      source: opts?.vendorProvided ? "vendor" : "measured",
      confidence: opts?.vendorProvided ? "medium" : "high",
      bufferPctApplied: 0,
      notes: "computed from real weight + dimensions",
    };
  }

  if (typeof realWeightKg === "number" && realWeightKg > 0 && !dims) {
    const base = Math.max(realWeightKg, cfg.globalMinBillableKg);
    const buffer = applyEbayExtra(cfg.fallbackBufferPct, isEbay, cfg);
    const buffered = base * (1 + buffer);
    const bucket = cfg.useBuckets ? roundUpToBucket(buffered, cfg.bucketsKg) : undefined;

    return {
      realWeightKg,
      billingWeightKg: bucket ?? buffered,
      bucketKg: bucket,
      source: opts?.vendorProvided ? "vendor" : (isEbay ? "estimated_ebay" : "estimated_rule"),
      confidence: "medium",
      bufferPctApplied: buffer,
      notes: isEbay
        ? "weight only; applied fallback buffer + ebay extra (no dimensions)"
        : "weight only; applied fallback buffer (no dimensions)",
    };
  }

  if (!realWeightKg && dims) {
    const vol = calcVolumetricKg(dims, cfg.volumetricDivisor);
    const buffer = applyEbayExtra(cfg.fallbackBufferPct, isEbay, cfg);
    const buffered = vol * (1 + buffer);
    const rawBilling = Math.max(buffered, cfg.globalMinBillableKg);
    const bucket = cfg.useBuckets ? roundUpToBucket(rawBilling, cfg.bucketsKg) : undefined;

    return {
      dimensionsCm: dims,
      volumetricWeightKg: vol,
      billingWeightKg: bucket ?? rawBilling,
      bucketKg: bucket,
      source: isEbay ? "estimated_ebay" : "estimated_rule",
      confidence: "low",
      bufferPctApplied: buffer,
      notes: isEbay
        ? "dimensions only; volumetric + fallback buffer + ebay extra (no real weight)"
        : "dimensions only; used volumetric + fallback buffer (no real weight)",
    };
  }

  const type: LogisticType = opts?.forcedType ?? inferLogisticTypeFromText(product);
  const profile = LOGISTIC_TYPE_PROFILES[type];

  const baseReal = Math.max(profile.defaultRealKg, profile.minBillableKg, cfg.globalMinBillableKg);
  const baseDims = profile.defaultDimsCm;

  const vol = baseDims ? calcVolumetricKg(baseDims, cfg.volumetricDivisor) : undefined;
  const baseBilling = Math.max(baseReal, vol ?? 0, profile.minBillableKg, cfg.globalMinBillableKg);

  // base buffer from profile + ebay extra
  const buffer = applyEbayExtra(profile.bufferPct, isEbay, cfg);

  const buffered = baseBilling * (1 + buffer);

  const buckets =
    profile.bucketsKg && profile.bucketsKg.length > 0 ? profile.bucketsKg : cfg.bucketsKg;

  const rawBilling = Math.max(buffered, profile.minBillableKg, cfg.globalMinBillableKg);
  const bucket = cfg.useBuckets ? roundUpToBucket(rawBilling, buckets) : undefined;

  return {
    dimensionsCm: baseDims,
    volumetricWeightKg: vol,
    billingWeightKg: bucket ?? rawBilling,
    bucketKg: bucket,
    source: isEbay ? "estimated_ebay" : "estimated_rule",
    confidence: profile.estimateConfidence,
    bufferPctApplied: buffer,
    notes: `estimated via type=${type} (${profile.label}) using defaults + buffer`,
  };
}

export function sumBillingWeightKg(items: Array<{ logisticProfile?: LogisticProfile; quantity?: number }>): number {
  let total = 0;
  for (const it of items) {
    const qty = it.quantity ?? 1;
    const bw = it.logisticProfile?.billingWeightKg;
    if (typeof bw === "number" && bw > 0) total += bw * qty;
  }
  return Math.round(total * 10) / 10;
}

export function explainProfile(lp: LogisticProfile): string {
  const parts = [
    `billing=${lp.billingWeightKg}kg`,
    lp.bucketKg ? `bucket=${lp.bucketKg}kg` : null,
    lp.realWeightKg ? `real=${lp.realWeightKg}kg` : null,
    lp.volumetricWeightKg ? `vol=${lp.volumetricWeightKg}kg` : null,
    lp.dimensionsCm ? `dims=${lp.dimensionsCm.l}x${lp.dimensionsCm.w}x${lp.dimensionsCm.h}cm` : null,
    `src=${lp.source}`,
    `conf=${lp.confidence}`,
    lp.bufferPctApplied ? `buffer=${Math.round(lp.bufferPctApplied * 100)}%` : null,
    lp.notes ? `notes=${lp.notes}` : null,
  ].filter(Boolean);

  return parts.join(" | ");
}