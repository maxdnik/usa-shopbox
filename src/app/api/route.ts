// src/app/api/orders/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { buyer, items, totalUSD } = body;

    // Validación básica
    if (!buyer || !items || !Array.isArray(items) || typeof totalUSD !== "number") {
      return NextResponse.json(
        { ok: false, message: "Payload inválido" },
        { status: 400 }
      );
    }

    // 🔹 Por ahora sólo logueamos la orden en el servidor
    console.log("📦 Nueva orden recibida:", {
      buyer,
      itemsCount: items.length,
      totalUSD,
    });

    // 🔹 Acá más adelante podemos guardar en MongoDB
    const fakeOrderId = `ORDER-${Date.now()}`;

    return NextResponse.json(
      {
        ok: true,
        orderId: fakeOrderId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error en /api/orders:", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
