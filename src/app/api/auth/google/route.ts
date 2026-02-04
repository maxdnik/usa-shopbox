// src/app/api/auth/google/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { ok: false, error: "Missing GOOGLE_CLIENT_ID" },
        { status: 500 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Missing JWT_SECRET" },
        { status: 500 }
      );
    }

    const { credential } = await req.json(); // id_token del front

    if (!credential) {
      return NextResponse.json(
        { ok: false, error: "No credential provided" },
        { status: 400 }
      );
    }

    // 1) Verificar token con Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return NextResponse.json(
        { ok: false, error: "Google token inválido" },
        { status: 401 }
      );
    }

    // 2) Conectar Mongo (mongoose) y tomar DB nativa
      const db = await getDb();
      const Users = db.collection("users");

    const email = payload.email.toLowerCase();
    const fullName = payload.name || email.split("@")[0];
    const googleId = payload.sub;

    // 3) Buscar usuario existente por email
    let user = await Users.findOne({ email });

    if (!user) {
      // 4) Crear usuario nuevo con provider google
      const insert = await Users.insertOne({
        email,
        fullName,
        provider: "google",
        googleId,
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      user = await Users.findOne({ _id: insert.insertedId });
    } else {
      // si existía y aún no tenía googleId, lo seteamos (opcional)
      if (!user.googleId) {
        await Users.updateOne(
          { _id: user._id },
          { $set: { googleId, provider: "google", updatedAt: new Date() } }
        );
      }
    }

    if (!user?._id) {
      return NextResponse.json(
        { ok: false, error: "User not resolved" },
        { status: 500 }
      );
    }

    // 5) Crear JWT igual que login normal
    const token = jwt.sign(
      { userId: user._id.toString(), email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ ok: true });

    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return res;
  } catch (err: any) {
    console.error("❌ Google auth error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Google auth error" },
      { status: 500 }
    );
  }
}
