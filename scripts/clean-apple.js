// scripts/clean-apple.js
import mongoose from 'mongoose';

async function cleanAppleData() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("No se encontró MONGODB_URI en el archivo .env.local");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Conexión exitosa para limpieza...");

    // Filtramos por la tienda para no borrar todo el catálogo por error
    const result = await mongoose.connection.db.collection('products').deleteMany({ store: 'Apple' });
    
    console.log(`\n🧹 LIMPIEZA COMPLETADA`);
    console.log(`Se eliminaron ${result.deletedCount} productos de la tienda Apple.`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error durante la limpieza:", err.message);
    process.exit(1);
  }
}

cleanAppleData();