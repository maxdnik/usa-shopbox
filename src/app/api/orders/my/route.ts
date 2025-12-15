import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie?.match(/session=([^;]+)/)?.[1];

    if (!token)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const db = await getDb(); // ← FIX
    const orders = await db
      .collection("orders")
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, orders });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
