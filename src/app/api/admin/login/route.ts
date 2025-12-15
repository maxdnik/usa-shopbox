// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "Clave incorrecta" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  // Cookie de sesión
  res.cookies.set("admin-auth", "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  return res;
}

