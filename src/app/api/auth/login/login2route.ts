import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json(
        { message: "Usuario o contraseña inválidos" },
        { status: 401 }
      );
    }

    // 👇 evita el error “Illegal arguments: string, undefined”
    if (!user.password || typeof user.password !== "string" || user.password.trim() === "") {
      return NextResponse.json(
        {
          message:
            "Esta cuenta no tiene contraseña configurada. Iniciá sesión con Google o registrate con email y contraseña.",
        },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { message: "Usuario o contraseña inválidos" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "Falta JWT_SECRET en .env.local" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { id: user._id?.toString(), email: user.email, role: user.role || "user" },
      secret,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ token }, { status: 200 });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { message: "Error interno en login" },
      { status: 500 }
    );
  }
}
