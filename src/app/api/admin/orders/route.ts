import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAILS = ["maxidimnik@gmail.com"]; // cambiá o sumá mails si querés

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
