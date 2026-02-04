import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    sku: { type: String }, // <--- Agregado para identificar la variante exacta
    title: { type: String, required: true },
    image: { type: String, default: "" },
    qty: { type: Number, default: 1 },
    priceUSD: { type: Number, required: true },
    // Campos dinámicos para capturar Color, Capacidad y detalles técnicos
    selections: { type: Schema.Types.Mixed, default: {} }, 
    specs: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    // Usuario dueño de la orden
    userId: { type: String, required: true, index: true },

    // Número de orden legible para el usuario (ej: AR000001)
    orderNumber: { type: String },

    // 🛠️ CAMPOS DE LOGÍSTICA LOCAL (SUMADOS PARA PERSISTENCIA REAL)
    localTrackingNumber: { type: String }, 
    localCourierName: { type: String },    

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

    // Items de la compra con soporte para specs y sku
    items: { type: [OrderItemSchema], default: [] },

    // Cantidad total de productos
    itemsCount: { type: Number, default: 0 },

    // Importes
    subtotalUSD: { type: Number, default: 0 },
    shippingUSD: { type: Number, default: 0 },
    otherFeesUSD: { type: Number, default: 0 },
    totalUSD: { type: Number, required: true },

    // Datos del comprador / entrega
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

    // Información de pago
    paymentProvider: { type: String }, 
    paymentId: { type: String }, 
    paymentStatus: { type: String }, 

    // Tracking por etapas
    tracking: {
      miamiAt: { type: Date }, 
      transitAt: { type: Date }, 
      deliveredAt: { type: Date }, 
    },

    // Notas internas opcionales
    adminNotes: { type: String },

    // Snapshot de ARCA (crédito / wallet)
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