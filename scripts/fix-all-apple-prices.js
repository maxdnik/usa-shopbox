// scripts/fix-all-apple-prices.js
import mongoose from 'mongoose';

async function fixAllApplePrices() {
  try {
    // Usamos la variable de entorno que Node cargará con --env-file
    if (!process.env.MONGODB_URI) {
      throw new Error("No se encontró MONGODB_URI. Asegurate de usar el flag --env-file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Conexión exitosa. Sincronizando precios de SKUs Apple...");

    // Definimos las reglas de precios basadas en tu inventario real
    const priceRules = {
      "iPhone 16 Pro Max": { "256GB": 1199, "512GB": 1399, "1TB": 1599 },
      "iPhone 16 Pro": { "128GB": 999, "256GB": 1099, "512GB": 1299, "1TB": 1499 },
      "iPhone 16": { "128GB": 799, "256GB": 899, "512GB": 1099 },
      "iPhone 15": { "128GB": 699, "256GB": 799, "512GB": 999 }
    };

    const productCollection = mongoose.connection.db.collection('products');
    const products = await productCollection.find({ store: /Apple/i }).toArray();

    for (const product of products) {
      const rule = priceRules[product.title];
      
      if (!rule) {
        console.log(`⚠️  Saltando "${product.title}": No requiere variantes de precio.`);
        continue;
      }

      console.log(`\n📦 Actualizando variantes de: ${product.title}`);

      // Inyectamos el campo 'price' dentro de cada objeto del array variations
      const updatedVariations = (product.variations || []).map(v => {
        if (v.attribute === "Capacidad") {
          const variantPrice = rule[v.value.trim()];
          if (variantPrice) {
            return { ...v, price: variantPrice };
          }
        }
        // Si es color, le asignamos el precio base del modelo
        const basePrice = rule["128GB"] || rule["256GB"] || product.priceUSD;
        return { ...v, price: basePrice };
      });

      await productCollection.updateOne(
        { _id: product._id },
        { 
          $set: { 
            variations: updatedVariations,
            updatedAt: new Date()
          } 
        }
      );
      console.log(`✅ Precios inyectados en ${product.title}`);
    }

    console.log("\n✨ Sincronización terminada. Tu marketplace ya es dinámico.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fatal:", err.message);
    process.exit(1);
  }
}

fixAllApplePrices();