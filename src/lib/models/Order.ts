import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    qty: { type: Number, default: 1 },
    priceUSD: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    // Usuario dueño de la orden
    userId: { type: String, required: true, index: true },

    // Número de orden legible para el usuario (ej: 6B3838)
    orderNumber: { type: String },

    // Estado general de la orden
    status: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "pending_processing",
        "processing",
        "in_miami_warehouse",
        "in_transit",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending_payment",
      index: true,
    },

    // Items de la compra
    items: { type: [OrderItemSchema], default: [] },

    // Cantidad total de productos
    itemsCount: { type: Number, default: 0 },

    // Importes
    subtotalUSD: { type: Number, default: 0 },
    shippingUSD: { type: Number, default: 0 },
    otherFeesUSD: { type: Number, default: 0 },
    totalUSD: { type: Number, required: true },

    // Datos del comprador / entrega (coinciden con lo que venimos usando)
    buyer: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      dni: { type: String },
      province: { type: String },
      city: { type: String },
      address: { type: String },
      postalCode: { type: String },
    },

    // Información de pago (MP / Stripe / etc.)
    paymentProvider: { type: String }, // ej: "mercadopago"
    paymentId: { type: String }, // id de pago del gateway
    paymentStatus: { type: String }, // approved, pending, rejected, etc.

    // Tracking por etapas (nuevo)
    tracking: {
      miamiAt: { type: Date }, // cuando se marca "in_miami_warehouse"
      transitAt: { type: Date }, // cuando se marca "in_transit"
      deliveredAt: { type: Date }, // cuando se marca "delivered"
    },

    // Notas internas opcionales
    adminNotes: { type: String },

    // Snapshot de ARCA (crédito / wallet), que ya tenías
    arcaSnapshot: {
      enabled: Boolean,
      totalUSD: Number,
      usedUSD: Number,
    },
  },
  { timestamps: true }
);

export type OrderType = InferSchemaType<typeof OrderSchema>;

export const Order: Model<OrderType> =
  (mongoose.models.Order as Model<OrderType>) ||
  mongoose.model<OrderType>("Order", OrderSchema);
