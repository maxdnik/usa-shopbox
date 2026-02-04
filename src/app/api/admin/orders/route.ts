import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email"; // 🛠️ Importamos la función real de tu archivo

const ADMIN_EMAILS = ["maxidimnik@gmail.com"]; // cambiá o sumá mails si querés

// === FUNCIÓN GET ORIGINAL (29 líneas) ===
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/admin/orders:", error);
    return NextResponse.json(
      { message: "Error al obtener las órdenes" },
      { status: 500 }
    );
  }
}

// === NUEVA FUNCIÓN PATCH: Actualiza estado y dispara email ===
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Validación de seguridad para administradores
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 🛠️ AJUSTE: Capturamos los datos de seguimiento desde el cuerpo de la petición
    const { orderId, newStatus, localTrackingNumber, localCourierName } = await req.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ message: "Faltan datos (orderId o newStatus)" }, { status: 400 });
    }

    await dbConnect();

    // 1. Actualizamos la orden en la base de datos incluyendo tracking local
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: newStatus,
        localTrackingNumber: localTrackingNumber || undefined,
        localCourierName: localCourierName || undefined
      },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json({ message: "Orden no encontrada" }, { status: 404 });
    }

    // 2. Disparamos la notificación por email
    // Esta función ya gestiona internamente los textos para:
    // 'in_miami_warehouse', 'in_transit', 'delivered' y 'cancelled'
    try {
      await sendOrderStatusEmail(updatedOrder, newStatus);
    } catch (emailError) {
      // Logeamos el error pero no cortamos el flujo porque la DB ya se actualizó
      console.error("Error enviando notificación por email:", emailError);
    }

    return NextResponse.json({ 
      message: "Estado actualizado y notificación enviada", 
      order: updatedOrder 
    }, { status: 200 });

  } catch (error) {
    console.error("Error PATCH /api/admin/orders:", error);
    return NextResponse.json(
      { message: "Error al actualizar la orden" },
      { status: 500 }
    );
  }
}