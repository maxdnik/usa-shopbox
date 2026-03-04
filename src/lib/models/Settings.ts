import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    // Identificador del documento de settings
    key: { type: String, default: "pricing_config", index: true },

    // =========================
    // A) VARIABLES COBRADAS (Frontend)
    // =========================
    charged_aduana: { type: Number, default: 40 },
    charged_local: { type: Number, default: 25 },
    charged_freight_kg: { type: Number, default: 15 },
    base_fee_percent: { type: Number, default: 0.1 },

    // =========================
    // B) COSTOS REALES OPERATIVOS
    // =========================
    real_aduana: { type: Number, default: 10 },
    real_local: { type: Number, default: 10 },
    real_freight_kg: { type: Number, default: 4.5 },

    // =========================
    // C) GUARDRAILS FINANCIEROS
    // =========================
    payment_cost_percent: { type: Number, default: 0.075 },
    min_net_margin_percent: { type: Number, default: 0.15 },
    min_order_total_usd: { type: Number, default: 150 },
    limit_adjust_low: { type: Number, default: 0.25 },
    limit_adjust_high: { type: Number, default: 0.18 },

    // =========================
    // D) POLÍTICA LEGACY / FALLBACK PESOS (eBay / Scraping)
    // =========================
    WEIGHT_DEFAULT_KG: { type: Number, default: 1.0 },

    // Mapa keyword -> kg (objeto flexible)
    WEIGHT_CATEGORY_MAP: { type: mongoose.Schema.Types.Mixed, default: {} },

    // =========================
    // E) COURIER CONFIG (volumétrico / buckets / buffers)
    // (usado por src/lib/logistics-profiles.ts)
    // =========================
    courier_volumetric_divisor: { type: Number, default: 5000 },
    courier_use_buckets: { type: Boolean, default: true },

    // Array de buckets (kg)
    courier_buckets_kg: {
      type: [Number],
      default: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7, 10, 12, 15, 20, 25, 30],
    },

    courier_global_min_billable_kg: { type: Number, default: 0.5 },
    courier_fallback_buffer_pct: { type: Number, default: 0.2 },
    courier_ebay_extra_buffer_pct: { type: Number, default: 0.12 },
  },
  {
    timestamps: true,
    strict: false, // ✅ CLAVE: permite guardar campos nuevos sin que se descarten
  }
);

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);