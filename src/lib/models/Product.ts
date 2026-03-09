// src/lib/models/Product.ts
import mongoose, { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    brand: String,
    store: String,

    // ✅ ORÍGENES
    source: { type: String, default: "manual", index: true }, // manual | filson | ebay | apple
    sourceId: { type: String, index: true }, // Shopify id como string
    sourceHandle: { type: String, index: true },
    sourceUrl: { type: String },
    sourceCollections: { type: [String], default: [], index: true }, // handles
    tags: { type: [String], default: [], index: true },
    productType: { type: String },
    vendor: { type: String },

    // ✅ WINTER DROP (para /winter?category=...)
    winterCategory: {
      type: String,
      enum: ["ski", ,"snowboard", "outdoor", "city"],
      index: true,
    },

    // ✅ METADATA DE SYNC
    sourcePublishedAt: { type: Date },
    sourceUpdatedAt: { type: Date },

    // 📂 Categorías
    category: {
      main: { type: String, required: true, index: true },
      sub: { type: String, index: true },
      leaf: { type: String, index: true },
    },

    description: String,
    priceUSD: Number,
    estimatedUSD: Number,

    weight: { type: Number, default: 0 },

    // Galería
    images: [String],
    specs: { type: Map, of: String },

    // ✅ Shopify-like options
    options: {
      type: [
        {
          name: String, // "Color", "Size"
          values: [String],
        },
      ],
      default: [],
    },

    // ✅ Variantes Shopify completas
    shopifyVariants: {
      type: [
        {
          sourceVariantId: String,
          title: String, // "Navy / M"
          sku: String,
          priceUSD: Number,
          available: Boolean,
          inventoryQuantity: Number,

          option1: String,
          option2: String,
          option3: String,
        },
      ],
      default: [],
    },

    // ✅ Tu estructura actual
    variations: [
      {
        sku: String,
        attribute: String,
        value: String,
        price: Number,
        stock: Number,
      },
    ],

    // ✅ Para debug / auditoría
    sourceRaw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// ✅ Índices anti-duplicados
ProductSchema.index({ source: 1, sourceId: 1 }, { unique: true, sparse: true });
ProductSchema.index({ source: 1, sourceHandle: 1 }, { unique: true, sparse: true });

// ✅ Índice optimizado para Winter
ProductSchema.index({ winterCategory: 1, createdAt: -1 });

export const Product =
  models.Product || model("Product", ProductSchema);