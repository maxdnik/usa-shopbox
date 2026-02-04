// src/app/api/shipments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Shipment } from "@/lib/models/Shipment";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const trackingCode = body.trackingCode || `USBX-${Date.now()}`;

    const shipment = await Shipment.create({
      user: body.userId,
      trackingCode,
      weightKg: body.weightKg || 0,
      priceUSD: body.priceUSD || 0,
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Error creando el envío" },
      { status: 500 }
    );
  }
}
