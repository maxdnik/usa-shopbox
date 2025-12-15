import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const db = await getDb(); // ← FIX
    const Users = db.collection("users");

    const user = await Users.findOne({ email });
    if (!user)
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    const res = NextResponse.json({
      ok: true,
      user: { email: user.email },
    });

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
