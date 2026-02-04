import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

const ADMIN_EMAILS = ["maxidimnik@gmail.com"];

const ALLOWED_STATUSES = [
  "pending_payment",
  "paid",
  "pending_processing",
  "processing",
  "in_miami_warehouse",
  "in_transit",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * GET /api/orders/[orderId]
 * Detalle de una orden para el usuario dueño de la orden.
 */
export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ orderId: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    await dbConnect();

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Seguridad: solo el dueño puede verla
    const userId = (session.user as any).id;
    const email = session.user.email;

    const isOwner =
      (order as any).userId === userId ||
      (order as any).buyer?.email === email;

    if (!isOwner) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 403 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/orders/[orderId]:", error);
    return NextResponse.json(
      { message: "Error al obtener la orden." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[orderId]
 * Actualización de estado (solo admin).
 */
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ orderId: string }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await req.json();
    const { status } = body as { status?: AllowedStatus };

    if (!status) {
      return NextResponse.json(
        { message: "El campo 'status' es obligatorio." },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { message: "Estado no permitido." },
        { status: 400 }
      );
    }

    await dbConnect();

    console.log("PATCH /api/orders/[orderId] →", orderId, "→", status);

    // Traemos la orden actual
    const existing = await Order.findById(orderId);
    if (!existing) {
      return NextResponse.json(
        { message: "Orden no encontrada." },
        { status: 404 }
      );
    }

    // Armamos update de status + tracking
    const update: any = { status };
    const now = new Date();

    if (status === "in_miami_warehouse" && !existing.tracking?.miamiAt) {
      update["tracking.miamiAt"] = now;
    }

    if (status === "in_transit" && !existing.tracking?.transitAt) {
      update["tracking.transitAt"] = now;
    }

    if (status === "delivered" && !existing.tracking?.deliveredAt) {
      update["tracking.deliveredAt"] = now;
    }

    const order = await Order.findByIdAndUpdate(orderId, update, {
      new: true,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada después del update." },
        { status: 404 }
      );
    }

    console.log(`✅ Orden ${orderId} actualizada a estado: ${status}`);

    try {
      await sendOrderStatusEmail(order, status);
      console.log("📧 Email de cambio de estado enviado");
    } catch (emailError) {
      console.error("Error al enviar email de estado:", emailError);
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error PATCH /api/orders/[orderId]:", error);
    return NextResponse.json(
      { message: "Error al actualizar la orden." },
      { status: 500 }
    );
  }
}
