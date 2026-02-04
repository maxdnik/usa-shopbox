// src/lib/models/Product.ts
import mongoose, { Schema, models, model } from "mongoose";

const ProductSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: String,
  store: String,
  
  // 📂 REFORMULACIÓN: Estructura jerárquica tipo Mercado Libre
  category: {
    main: { type: String, required: true, index: true }, // Ej: "Tecnología"
    sub: { type: String, index: true },                  // Ej: "Computación"
    leaf: { type: String, index: true }                   // Ej: "Tablets y Accesorios"
  },
  
  description: String,
  priceUSD: Number,
  estimatedUSD: Number,
  
  /**
   * ⚖️ CAMPO DE PESO
   * Este campo es vital para el cálculo del flete internacional.
   * Se recomienda expresar el valor en kilogramos (ej: 0.5 para 500g).
   */
  weight: { 
    type: Number, 
    default: 0 
  }, 
  
  // CAMPOS CLAVE PARA APPLE Y GALERÍA
  images: [String], // Galería de fotos
  specs: { type: Map, of: String }, // Ficha técnica
  
  variations: [{
    sku: String,
    attribute: String,
    value: String,
    price: Number,
    stock: Number
  }],
}, { timestamps: true });

// Exportación del modelo
export const Product = models.Product || model("Product", ProductSchema);