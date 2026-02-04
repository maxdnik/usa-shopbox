import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: "pricing_config" },
  charged_aduana: { type: Number, default: 40 },
  charged_local: { type: Number, default: 25 },
  charged_freight_kg: { type: Number, default: 15 },
  base_fee_percent: { type: Number, default: 0.1 },
  real_aduana: { type: Number, default: 10 },
  real_local: { type: Number, default: 10 },
  real_freight_kg: { type: Number, default: 4.5 },
  payment_cost_percent: { type: Number, default: 0.075 },
  min_net_margin_percent: { type: Number, default: 0.15 },
  min_order_total_usd: { type: Number, default: 150 },
  limit_adjust_low: { type: Number, default: 0.25 },
  limit_adjust_high: { type: Number, default: 0.18 },
}, { timestamps: true });

export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);