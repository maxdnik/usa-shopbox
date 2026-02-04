// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import mongoose from "mongoose";
import { sendOrderCreatedEmail } from "@/lib/email"; // 🛠️ Motor profesional de emails

/* -------------------------------------------
   Helpers: acceso directo al driver nativo
-------------------------------------------- */

function mongooseConnectionDb() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo not connected yet");
  }
  return mongoose.connection.db;
}

/* -------------------------------------------
   Generación del número tipo AR000001 (CORREGIDO)
-------------------------------------------- */

async function getNextOrderNumber() {
  const db = mongooseConnectionDb();

  type CounterDoc = { _id: string; seq: number };
  const counters = db.collection<CounterDoc>("counters");

  const counterResult = await counters.findOneAndUpdate(
    { _id: "order" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  // Driver puede devolver el doc directo o en .value (según versión)
  const seq =
    (counterResult as any)?.seq ||
    (counterResult as any)?.value?.seq ||
    1;

  return `AR${seq.toString().padStart(6, "0")}`;
}

/* -------------------------------------------
   Normaliza items: Captura precio e imagen correctamente
-------------------------------------------- */

function normalizeItems(body: any) {
  const itemsArr = Array.isArray(body.items) ? body.items : [];

  return itemsArr.map((it: any) => ({
    productId: it.productId ?? it.id ?? "unknown",
    sku: it.sku ?? "",
    title: it.title ?? it.name ?? "Producto",
    image: it.image || it.imageUrl || "",
    qty: Number(it.qty ?? it.quantity ?? 1),
    priceUSD: Number(it.priceUSD ?? it.price ?? it.estimatedUSD ?? 0),
    selections: it.selections ?? {},
    specs: it.specs ?? {},
  }));
}

/* -------------------------------------------
   Resolve userId from session (email -> User._id)
   (NextAuth default Session.user NO tiene id)
-------------------------------------------- */

async function resolveUserIdFromSession() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase() || null;

  if (!email) return { session, userId: null, user: null, email: null };

  const user = await User.findOne({ email }).lean();
  const userId = user?._id ? user._id.toString() : null;

  return { session, userId, user, email };
}

/* -------------------------------------------
   GET → devuelve las órdenes del usuario logueado
-------------------------------------------- */

export async function GET() {
  try {
    await dbConnect();

    const { userId } = await resolveUserIdFromSession();

    if (!userId) {
      return NextResponse.json(
        { ok: false, orders: [] },
        { status: 401 }
      );
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { ok: true, orders },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/orders", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------
   POST → Crear orden con Pesificación
-------------------------------------------- */

export async function POST(req: Request) {
  console.log("🟢 [API ORDERS] Iniciando creación de orden...");

  try {
    await dbConnect();

    const body = await req.json();

    // Resolver userId via email (si está logueado)
    const { userId, user } = await resolveUserIdFromSession();

    // Normalizamos items incluyendo la nueva data técnica e imagen
    const items = normalizeItems(body);

    const itemsCount = items.reduce((sum: number, i: any) => sum + i.qty, 0);
    const subtotalUSD = items.reduce(
      (sum: number, i: any) => sum + i.priceUSD * i.qty,
      0
    );
    const totalUSD = Number(body.totalUSD) || subtotalUSD;

    // Captura de datos de Pesificación
    const exchangeRateUsed = Number(body.exchangeRateUsed || 0);

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: "No items in cart" },
        { status: 400 }
      );
    }

    // 🔢 Generación de número incremental corregido
    const orderNumber = await getNextOrderNumber();
    console.log("🔢 Nuevo número incremental:", orderNumber);

    // Lógica de Snapshots (Dirección y ARCA)
    let addressSnapshot: any = {};
    let arcaSnapshot: any = {};

    if (userId && user) {
      const addr: any = (user as any)?.address || {};
      const arca: any = (user as any)?.arca || {};

      addressSnapshot = {
        streetName: addr.streetName,
        streetNumber: addr.streetNumber,
        floor: addr.floor,
        apartment: addr.apartment,
        city: addr.city,
        province: addr.province,
        postalCode: addr.postalCode,
      };

      arcaSnapshot = {
        enabled: arca.enabled,
        totalUSD: arca.totalUSD,
        usedUSD: arca.usedUSD,
      };
    } else if (body.buyer) {
      addressSnapshot = {
        streetName: body.buyer.streetName,
        streetNumber: body.buyer.streetNumber,
        floor: body.buyer.floor,
        apartment: body.buyer.apartment,
        city: body.buyer.city,
        province: body.buyer.province,
        postalCode: body.buyer.postalCode,
      };
    }

    /* ------------------------------------------
       Crear orden en mongoose
    ------------------------------------------- */

    const orderDoc = await Order.create({
      userId: userId ?? "guest",
      items,
      itemsCount,
      subtotalUSD,
      totalUSD,
      exchangeRateUsed, // Guardamos la cotización usada
      status: "pending_payment",
      addressSnapshot,
      arcaSnapshot,
      orderNumber,
      buyer: body.buyer ?? null,
      shippingUSD: Number(body.shippingUSD || 0),
      otherFeesUSD: Number(body.otherFeesUSD || 0),
    });

    const mongoId = orderDoc._id.toString();
    console.log("✅ [API ORDERS] Orden guardada satisfactoriamente:", mongoId);

    /* ------------------------------------------
       Notificación por Email
    ------------------------------------------- */

    try {
      await sendOrderCreatedEmail(orderDoc);
      console.log("✅ [API ORDERS] Email de confirmación enviado");
    } catch (e) {
      console.error("❌ [API ORDERS] Error enviando email:", e);
    }

    return NextResponse.json(
      {
        ok: true,
        orderNumber,
        mongoId,
        userId: userId ?? "guest",
        order: orderDoc,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ [API ORDERS] Error crítico:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
