// src/lib/models/Shipment.ts
import { Schema, model, models, Types } from "mongoose";

const ShipmentSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    trackingCode: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: [
        "created",
        "received_miami",
        "consolidated",
        "in_flight",
        "customs_ar",
        "in_local_delivery",
        "delivered",
      ],
      default: "created",
    },
    weightKg: Number,
    priceUSD: Number,
    miamiNotes: String,
    arNotes: String,
  },
  { timestamps: true }
);

export const Shipment = models.Shipment || model("Shipment", ShipmentSchema);
