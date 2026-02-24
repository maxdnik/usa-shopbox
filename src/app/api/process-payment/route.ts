import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { sendOrderCreatedEmail } from "@/lib/email"; // ✅ Email centralizado
import mongoose from "mongoose"; // ✅ Necesario para el contador

type CounterDoc = { _id: string; seq: number };

// ✅ Type guards TS-safe para soportar diferentes typings de Mongo/Mongoose
function hasValueProperty(
  x: unknown
): x is { value?: CounterDoc | null } {
  return typeof x === "object" && x !== null && "value" in x;
}

function isCounterDoc(x: unknown): x is CounterDoc {
  return typeof x === "object" && x !== null && "seq" in x;
}

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

/* -------------------------------------------
   Helpers para Numeración Secuencial (AR000001)
-------------------------------------------- */

function mongooseConnectionDb() {
  if (!mongoose.connection?.db) {
    throw new Error("Mongo not connected yet");
  }
  return mongoose.connection.db;
}

async function getNextOrderNumber() {
  const db = mongooseConnectionDb();

  const counters = db.collection<CounterDoc>("counters");

  // 👇 OJO: según versiones, esto puede tiparse distinto:
  // - a veces devuelve { value: ... }
  // - a veces devuelve el doc directo (WithId<CounterDoc>)
  const counterResult: unknown = await counters.findOneAndUpdate(
    { _id: "order" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  let seq: number | undefined;

  // Caso A: driver devuelve ModifyResult con `.value`
  if (hasValueProperty(counterResult)) {
    seq = counterResult.value?.seq ?? undefined;
  }

  // Caso B: typings lo tratan como documento directo con `.seq`
  if (seq === undefined && isCounterDoc(counterResult)) {
    seq = (counterResult as CounterDoc).seq;
  }

  // Fallback ultra seguro (no debería pasar con upsert, pero TS/contento)
  if (typeof seq !== "number") {
    const doc = await counters.findOne({ _id: "order" });
    seq = doc?.seq ?? 1;
  }

  return `AR${String(seq).padStart(6, "0")}`;
}

/* -------------------------------------------
   Handler Principal
-------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      token,
      transaction_amount,
      installments,
      payment_method_id,
      issuer_id,
      payer,
      buyer,
      items,
      totalUSD,
    } = data;

    await dbConnect();

    // 1. Procesar pago con Mercado Pago
    const payment = new Payment(client);

    const paymentData = {
      body: {
        transaction_amount: Number(transaction_amount),
        token: token,
        description: "Compra en USA Shop Box",
        installments: Number(installments),
        payment_method_id: payment_method_id,
        issuer_id: issuer_id,
        payer: {
          email: payer.email,
          identification: {
            type: payer.identification.type,
            number: payer.identification.number,
          },
        },
      },
    };

    const mpRes = await payment.create(paymentData);
    const isApproved = mpRes.status === "approved";

    if (isApproved) {
      // 1. Buscar Usuario
      const user = await User.findOne({ email: buyer.email });
      if (!user) {
        throw new Error(`El usuario con email ${buyer.email} no fue encontrado.`);
      }

      // 2. Mapeo de Items (Formato Estricto para Order Schema)
      const formattedItems = (items || []).map((item: any) => ({
        productId: item.id || item._id,
        title: item.title,
        priceUSD: Number(item.priceUSD),
        qty: Number(item.quantity || 1), // Mapeo quantity -> qty
        image: item.image || "",
        selections: item.selections,
        sku: item.sku,
      }));

      // 3. Generar Número de Orden Correlativo
      const orderNumber = await getNextOrderNumber();
      console.log("🔢 Nueva orden pagada generada:", orderNumber);

      // 4. Crear Orden
      const newOrder = await Order.create({
        userId: user._id.toString(),
        orderNumber: orderNumber,
        buyer: {
          fullName: buyer.fullName,
          email: buyer.email,
          phone: buyer.phone,
          dni: buyer.dni,
          province: buyer.province,
          city: buyer.city,
          address: buyer.address,
          postalCode: buyer.postalCode,
        },
        items: formattedItems,
        totalUSD: Number(totalUSD),
        itemsCount: formattedItems.reduce(
          (acc: number, item: any) => acc + item.qty,
          0
        ),
        status: "paid",
        paymentProvider: "MercadoPago",
        paymentId: mpRes.id!.toString(),
        paymentStatus: mpRes.status,
        createdAt: new Date(),
      });

      // 5. Enviar Email
      try {
        await sendOrderCreatedEmail(newOrder);
        console.log("📧 Email enviado vía lib/email.ts");
      } catch (emailErr) {
        console.error("⚠️ Pago OK, pero falló el email:", emailErr);
      }

      return NextResponse.json({
        ok: true,
        status: "approved",
        orderId: newOrder._id,
        orderNumber: orderNumber,
      });
    }

    return NextResponse.json({
      ok: false,
      status: mpRes.status,
      message: mpRes.status_detail,
    });
  } catch (err: any) {
    console.error("Error payment processing:", err);
    return NextResponse.json(
      { error: true, message: err.message || "Error procesando el pago" },
      { status: 500 }
    );
  }
}