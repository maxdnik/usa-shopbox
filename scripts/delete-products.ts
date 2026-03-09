import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Falta MONGODB_URI en .env.local");

  await mongoose.connect(uri);
  console.log("✅ Mongo conectado");

  // ✅ SOLO Backcountry
  const filter = { store: "Backcountry" };

  const count = await mongoose.connection.collection("products").countDocuments(filter);
  console.log("Backcountry a borrar:", count);

  const res = await mongoose.connection.collection("products").deleteMany(filter);
  console.log("✅ Deleted:", res.deletedCount);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Delete failed:", e);
  process.exit(1);
});