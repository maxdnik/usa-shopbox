import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      provider: "credentials",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Error interno al crear la cuenta" },
      { status: 500 }
    );
  }
}
