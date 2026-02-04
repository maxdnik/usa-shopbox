// src/lib/models/mongodb.ts
import mongoose from "mongoose";

// ======================================================
// MongoDB connection (singleton safe for Next.js)
// ======================================================

const MONGODB_URI: string = (() => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ Missing MONGODB_URI (set it in env vars)");
  }
  return uri;
})();

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongoose ?? { conn: null, promise: null };
globalThis.mongoose = cached;

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "usashopbox",
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Devuelve la DB nativa SIN importar `Db` desde `mongodb`
 * (evita el conflicto mongoose/node_modules/mongodb vs mongodb root)
 */
export async function getDb() {
  const conn = await dbConnect();
  const db = conn.connection.db;

  if (!db) {
    throw new Error("❌ Mongo native db is undefined (connection not ready)");
  }

  return db;
}