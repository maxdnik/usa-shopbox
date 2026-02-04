// scripts/fix-all-apple-prices.js
import mongoose from 'mongoose';

async function fixAllApplePrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Iniciando actualización masiva de precios por SKU...");

    // Reglas de precios basadas en tu JSON oficial
    const priceRules = {
      "iPhone 16": {
        "128GB": 799,
        "256GB": 899,
        "512GB": 1099
      },
      "iPhone 16 Pro": {
        "128GB": 999,
        "256GB": 1099,
        "512GB": 1299,
        "1TB": 1499
      },
      "iPhone 16 Pro Max": {
        "256GB": 1199,
        "512GB": 1399,
        "1TB": 1599
      },
      "iPhone 15": {
        "128GB": 699,
        "256GB": 799,
        "512GB": 999
      }
    };

    const productCollection = mongoose.connection.db.collection('products');
    const products = await productCollection.find({ store: /Apple/i }).toArray();

    for (const product of products) {
      const rule = priceRules[product.title];
      
      if (!rule) {
        console.log(`⚠️ No hay reglas para "${product.title}", se mantiene precio base.`);
        continue;
      }

      console.log(`\n📦 Procesando variantes de: ${product.title}`);

      // Mapeamos las variaciones para inyectar el precio correcto según la capacidad
      const updatedVariations = product.variations.map(v => {
        if (v.attribute === "Capacidad") {
          const variantPrice = rule[v.value.trim()];
          if (variantPrice) {
            return { ...v, price: variantPrice };
          }
        }
        // Si es un color u otra variante, le asignamos el precio base de la regla
        // o el precio actual si no hay match de capacidad aún.
        return { ...v, price: rule[product.attributes?.capacity] || product.priceUSD };
      });

      await productCollection.updateOne(
        { _id: product._id },
        { 
          $set: { 
            variations: updatedVariations,
            priceUSD: rule["128GB"] || rule["256GB"] || product.priceUSD // Asegura el precio base de entrada
          } 
        }
      );
      console.log(`✅ ${product.title} sincronizado con éxito.`);
    }

    console.log("\n✨ Base de datos actualizada. Los precios ahora son dinámicos.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fatal:", err.message);
    process.exit(1);
  }
}

fixAllApplePrices();