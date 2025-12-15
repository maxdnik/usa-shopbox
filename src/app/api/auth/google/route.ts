import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
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
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return NextResponse.json(
        { ok: false, error: "Google token inválido" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const Users = db.collection("users");

    const email = payload.email.toLowerCase();
    const fullName = payload.name || email.split("@")[0];
    const googleId = payload.sub;

    // 2) Buscar usuario existente por email
    let user = await Users.findOne({ email });

    if (!user) {
      // 3) Crear usuario nuevo con provider google
      const insert = await Users.insertOne({
        email,
        fullName,
        provider: "google",
        googleId,
        createdAt: new Date(),
      });
      user = await Users.findOne({ _id: insert.insertedId });
    } else {
      // si existía y aún no tenía googleId, lo seteamos (opcional)
      if (!user.googleId) {
        await Users.updateOne(
          { _id: user._id },
          { $set: { googleId, provider: "google" } }
        );
      }
    }

    // 4) Crear tu JWT igual que login normal
    const token = jwt.sign(
      { userId: user!._id.toString(), email },
      process.env.JWT_SECRET!,
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
