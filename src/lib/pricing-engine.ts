/**
 * 📘 MOTOR DE PRICING - USA SHOP BOX (VERSIÓN DINÁMICA & CENTRALIZADA)
 */

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

  // D) POLÍTICA DE PESOS (NUEVO: Integrado aquí para ser editable)
  WEIGHT_DEFAULT_KG: 1.0, // Ante duda, 1kg
  WEIGHT_CATEGORY_MAP: {  // Mapa de palabras clave -> kg
    "ropa": 0.5, "shirt": 0.5, "dress": 0.5, "pants": 0.6,
    "zapatilla": 1.0, "shoe": 1.0, "sneaker": 1.2,
    "reloj": 0.5, "watch": 0.5,
    "phone": 0.5, "celular": 0.5,
    "laptop": 2.5, "notebook": 2.5,
    "tablet": 0.8, "ipad": 0.8,
    "case": 0.2, "funda": 0.2, "cargador": 0.2
  }
};

export const PRICING_CONFIG = PRICING_CONFIG_DEFAULT;

/**
 * 🕵️‍♂️ HELPER: Determina el peso cobrable (Real o Imputado)
 * Ahora acepta 'config' para usar las reglas dinámicas del Admin.
 */
export const getChargeableWeight = (item: any, config = PRICING_CONFIG_DEFAULT) => {
  // 1. Si tiene peso real válido (> 0), es sagrado.
  if (item.weight && typeof item.weight === 'number' && item.weight > 0) {
    return { kg: item.weight, isImputed: false };
  }

  // 2. Usar configuración dinámica o defaults
  const map = config.WEIGHT_CATEGORY_MAP || PRICING_CONFIG_DEFAULT.WEIGHT_CATEGORY_MAP;
  const defaultKg = config.WEIGHT_DEFAULT_KG || PRICING_CONFIG_DEFAULT.WEIGHT_DEFAULT_KG;

  // 3. Buscamos imputar por categoría (match simple)
  const textToSearch = `${item.category || ''} ${item.title || ''}`.toLowerCase();
  
  for (const [key, val] of Object.entries(map)) {
    if (textToSearch.includes(key)) {
      return { kg: Number(val), isImputed: true, source: 'category' };
    }
  }

  // 4. Último recurso: Default General
  return { kg: Number(defaultKg), isImputed: true, source: 'default' };
};

/**
 * 🏷️ HELPER: Precio Visual
 */
export const getDisplayPriceUSA = (rawPrice: number) => {
  return rawPrice * (1 + PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT);
};

export const calculateCartPricing = (items: any[], dynamicConfig?: any) => {
  const config = dynamicConfig || PRICING_CONFIG_DEFAULT;

  // 1. ANÁLISIS DE PESOS (Pasamos la config dinámica al helper)
  let weightTotal = 0;
  let isWeightImputed = false;

  const analyzedItems = items.map(item => {
    const { kg, isImputed } = getChargeableWeight(item, config);
    if (isImputed) isWeightImputed = true;
    weightTotal += kg * (item.quantity ?? 1);
    return { ...item, chargeableWeight: kg };
  });

  const rawPriceUSA = items.reduce((acc, item) => acc + (item.priceUSD || 0) * (item.quantity ?? 1), 0);

  if (items.length === 0) return { totalFinal: 0, breakdown: [], checkoutEnabled: false, reason: "Carrito vacío" };

  // 2. CÁLCULO DE COSTOS
  const baseFeePercent = (config.BASE_FEE_PERCENT || PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT);
  const publicPriceUSA = rawPriceUSA * (1 + baseFeePercent);

  const iva = rawPriceUSA * 0.21;
  const freight = weightTotal * (config.CHARGED_FREIGHT_KG || PRICING_CONFIG_DEFAULT.CHARGED_FREIGHT_KG);
  const aduana = (config.CHARGED_ADUANA || PRICING_CONFIG_DEFAULT.CHARGED_ADUANA);
  const local = (config.CHARGED_LOCAL || PRICING_CONFIG_DEFAULT.CHARGED_LOCAL);

  let gestionLine = rawPriceUSA * baseFeePercent;

  // 3. VALIDACIÓN FINANCIERA
  const totalRealCost = rawPriceUSA + 
                        (weightTotal * (config.REAL_FREIGHT_KG || PRICING_CONFIG_DEFAULT.REAL_FREIGHT_KG)) + 
                        (config.REAL_ADUANA || PRICING_CONFIG_DEFAULT.REAL_ADUANA) + 
                        (config.REAL_LOCAL || PRICING_CONFIG_DEFAULT.REAL_LOCAL);

  const evaluate = (g: number) => {
    const total = publicPriceUSA + iva + freight + aduana + local + g;
    const paymentFee = (config.PAYMENT_COST_PERCENT || PRICING_CONFIG_DEFAULT.PAYMENT_COST_PERCENT);
    const netProfit = (total * (1 - paymentFee)) - totalRealCost;
    const marginPercent = total > 0 ? netProfit / total : 0;
    return { total, marginPercent };
  };

  let current = evaluate(gestionLine);
  
  // Ajuste de margen
  const minMargin = (config.MIN_NET_MARGIN_PERCENT || PRICING_CONFIG_DEFAULT.MIN_NET_MARGIN_PERCENT);
  if (current.marginPercent < minMargin) {
    const limitLow = (config.LIMIT_ADJUST_LOW || PRICING_CONFIG_DEFAULT.LIMIT_ADJUST_LOW);
    const limitHigh = (config.LIMIT_ADJUST_HIGH || PRICING_CONFIG_DEFAULT.LIMIT_ADJUST_HIGH);
    const limit = rawPriceUSA < 150 ? limitLow : limitHigh;
    const maxAllowed = rawPriceUSA * limit;

    const paymentFee = (config.PAYMENT_COST_PERCENT || PRICING_CONFIG_DEFAULT.PAYMENT_COST_PERCENT);
    const targetTotal = totalRealCost / (1 - paymentFee - minMargin);
    const requiredGestion = targetTotal - (publicPriceUSA + iva + freight + aduana + local);
    
    gestionLine = Math.min(Math.max(gestionLine, requiredGestion), maxAllowed);
    current = evaluate(gestionLine);
  }

  let checkoutEnabled = true;
  let reason = "";
  const minOrder = (config.MIN_ORDER_TOTAL_USD || PRICING_CONFIG_DEFAULT.MIN_ORDER_TOTAL_USD);

  if (current.total < minOrder) {
    checkoutEnabled = false;
    reason = `Pedido mínimo USD ${minOrder}`;
  } else if (current.marginPercent < minMargin) {
    checkoutEnabled = false;
    reason = "Carrito no rentable";
  }

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
      { label: "Logística Nacional", amount: local }
    ]
  };
};