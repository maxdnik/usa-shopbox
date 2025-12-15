// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Falta MONGODB_URI en .env.local");
}

// cache global para hot-reload en Next dev
let cached = (global as any)._mongoose;
if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // importante para evitar buffering infinito
    mongoose.set("bufferCommands", false);

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "usashopbox",            // 👈 fuerza la DB correcta
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log("✅ Mongo conectado:", m.connection.name);
        return m;
      })
      .catch((err) => {
        console.error("❌ Mongo connect error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
