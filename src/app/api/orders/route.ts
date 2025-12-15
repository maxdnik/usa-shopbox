import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

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
   Generación del número tipo AR000001
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

  const seq = counterResult?.value?.seq ?? 1;
  return `AR${seq.toString().padStart(6, "0")}`;
}

/* -------------------------------------------
   Normaliza items (v4/v5)
-------------------------------------------- */

function normalizeItems(body: any) {
  const itemsArr = Array.isArray(body.items) ? body.items : [];

  return itemsArr.map((it: any) => ({
    productId: it.productId ?? it.id ?? "unknown",
    title: it.title ?? it.name ?? "Producto",
    image: it.image ?? "",
    qty: Number(it.qty ?? it.quantity ?? 1),
    priceUSD: Number(it.priceUSD ?? it.price ?? 0),
  }));
}

/* -------------------------------------------
   GET → devuelve las órdenes del usuario logueado
-------------------------------------------- */

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, orders: [] },
        { status: 401 }
      );
    }

    const orders = await Order.find({ userId: session.user.id })
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
   POST → crear orden
-------------------------------------------- */

export async function POST(req: Request) {
  console.log("🟢 Entrando a /api/orders (unificado)");

  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const body = await req.json();

    const userId = session?.user?.id ?? null;

    console.log("📦 Nueva orden recibida:", body);

    const items = normalizeItems(body);

    const totalUSD =
      Number(body.totalUSD) ||
      items.reduce(
        (sum: number, i: any) => sum + i.priceUSD * i.qty,
        0
      );

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: "No items" },
        { status: 400 }
      );
    }

    /* ------------------------------------------
       Número secuencial
    ------------------------------------------- */

    const orderNumber = await getNextOrderNumber();
    console.log("🔢 Nuevo número:", orderNumber);

    /* ------------------------------------------
       Snapshots
    ------------------------------------------- */

    let addressSnapshot: any = {};
    let arcaSnapshot: any = {};

    if (userId) {
      // si está logueado
      const user = await User.findById(userId).lean();

      const addr = user?.address || {};
      const arca = user?.arca || {};

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
      // legacy guest
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
      totalUSD,
      status: "pending_payment",
      addressSnapshot,
      arcaSnapshot,
      orderNumber,
      buyer: body.buyer ?? null, // legacy
    });

    const mongoId = orderDoc._id.toString();
    console.log("✅ Orden guardada:", mongoId);

    /* ------------------------------------------
       EMAILS (Opcional)
    ------------------------------------------- */

    const canSendEmail =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM;

    if (canSendEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const buyerEmail =
          body?.buyer?.email || session?.user?.email;
        const buyerName =
          body?.buyer?.fullName || session?.user?.name || "Cliente";

        const itemsHtml = `
          <ul>
            ${items
              .map(
                (i: any) =>
                  `<li>${i.title} x ${i.qty}</li>`
              )
              .join("")}
          </ul>
        `;

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: buyerEmail,
          subject: `Tu orden ${orderNumber} fue creada`,
          html: `
            <h2>Hola ${buyerName}</h2>
            <p>Tu orden <b>${orderNumber}</b> fue creada correctamente.</p>
            <p><b>Total:</b> USD ${totalUSD}</p>
            <p><b>Productos:</b></p>
            ${itemsHtml}
          `,
        });

        console.log("✅ Email comprador enviado");
      } catch (e) {
        console.error("❌ Error enviando email:", e);
      }
    }

    /* ------------------------------------------
       RESPUESTA
    ------------------------------------------- */

    return NextResponse.json(
      {
        ok: true,
        orderNumber,
        mongoId,
        userId,
        order: orderDoc,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Error en /api/orders:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
