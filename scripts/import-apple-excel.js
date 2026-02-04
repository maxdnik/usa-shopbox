// scripts/import-apple-excel.js
import mongoose from 'mongoose';
import fs from 'fs';

async function importAppleData() {
  try {
    // Validamos la conexión
    if (!process.env.MONGODB_URI) {
      throw new Error("No se encontró MONGODB_URI. Usá: node --env-file=.env.local ...");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Conexión establecida con MongoDB.");

    // 1. Leemos el JSON que generamos del Excel
    const rawData = fs.readFileSync('apple_structured_data.json', 'utf8');
    const newProducts = JSON.parse(rawData);

    // 2. LIMPIEZA QUIRÚRGICA: Borramos solo lo de Apple para evitar basura
    console.log("🧹 Limpiando registros antiguos de la tienda Apple...");
    const deleteResult = await mongoose.connection.db.collection('products').deleteMany({ store: 'Apple' });
    console.log(`✅ Se eliminaron ${deleteResult.deletedCount} productos previos.`);

    // 3. INYECCIÓN DE ALTA DENSIDAD
    console.log(`📦 Insertando ${newProducts.length} Modelos Maestros (338 SKUs consolidados)...`);
    await mongoose.connection.db.collection('products').insertMany(newProducts);

    console.log("\n✨ MIGRACIÓN EXITOSA: Tu catálogo ahora es nivel profesional.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fatal:", err.message);
    process.exit(1);
  }
}

importAppleData();