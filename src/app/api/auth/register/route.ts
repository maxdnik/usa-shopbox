// ✅ src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => ({} as any));
    const fullName = String(body?.fullName || "").trim();
    const email = String(body?.email || "").toLowerCase().trim();
    const password = String(body?.password || "");

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      name: fullName, // ✅ para NextAuth/session
      email,
      password: hashedPassword,
      provider: "credentials",
      role: "user",

      // ✅ estructuras por defecto (coinciden con tu schema)
      phone: "",
      dni: "",
      image: "",
      address: {},
      arca: {},
      billing: {},
      paymentMethods: [],
      cart: [],
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Error interno al crear la cuenta" },
      { status: 500 }
    );
  }
}