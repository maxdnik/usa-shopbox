import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export const dynamic = "force-dynamic";

type RawAddress = {
  street?: string;
  streetName?: string;
  streetNumber?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

// --- Helper: intentar separar "Calle 123" en nombre + número ---
function splitStreet(legacyStreet?: string): {
  streetName?: string;
  streetNumber?: string;
} {
  if (!legacyStreet) return {};

  // Ejemplos que intenta cubrir:
  // "Avenida Pueyrredón 2466", "Calle Falsa 123", etc.
  const match = legacyStreet.match(/^(.+?)\s+(\d+.*)$/);
  if (!match) {
    return { streetName: legacyStreet, streetNumber: "" };
  }

  const streetName = match[1].trim();
  const streetNumber = match[2].trim();
  return { streetName, streetNumber };
}

// --- Helper: construir el campo legacy "street" a partir de los nuevos ---
function buildLegacyStreet(addr: RawAddress): string {
  const name = addr.streetName || "";
  const num = addr.streetNumber || "";
  return [name, num].filter(Boolean).join(" ").trim();
}

// --- Helper: normalizar address mezclando legacy + nuevos campos ---
function normalizeAddress(input?: RawAddress | null): RawAddress {
  const a = input || {};

  let streetName = a.streetName;
  let streetNumber = a.streetNumber;

  // Si no hay streetName/Number pero sí hay street (legacy), intentamos parsearlo
  if ((!streetName || !streetNumber) && a.street) {
    const parsed = splitStreet(a.street);
    streetName = streetName || parsed.streetName || "";
    streetNumber = streetNumber || parsed.streetNumber || "";
  }

  const street = a.street || buildLegacyStreet({ streetName, streetNumber });

  return {
    street,
    streetName: streetName || "",
    streetNumber: streetNumber || "",
    floor: a.floor || "",
    apartment: a.apartment || "",
    city: a.city || "",
    province: a.province || "",
    postalCode: a.postalCode || "",
  };
}

// ============ GET /api/account ============
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user: any = await User.findOne({
      email: session.user.email,
    }).lean();

    // Si no existe, lo creamos básico
    if (!user) {
      const created = await User.create({
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || "",
      });
      user = created.toObject();
    }

    // Normalizamos la dirección (para que siempre tenga mismos campos)
    const normalizedAddr = normalizeAddress(user.address || {});
    user.address = normalizedAddr;

    // Si no hay arca, garantizamos estructura por defecto
    user.arca = user.arca || {
      enabled: false,
      totalUSD: 0,
      usedUSD: 0,
    };

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error("GET /api/account error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ============ PUT /api/account ============
// Valida ARCA usando SOLO el user de la base.
// El front solo puede prender/apagar el flag "enabled", no inventar cupo.
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Traemos el usuario actual para conocer el cupo ARCA real y datos actuales
    const currentUser = await User.findOne({
      email: session.user.email,
    }).lean();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Normalizamos dirección usando lo que viene del body o lo que ya hay
    const normalizedAddr = normalizeAddress(
      (body.address as RawAddress) || (currentUser.address as RawAddress) || {}
    );

    // DNI final a guardar (body tiene prioridad, si no, lo que ya estaba)
    const dni: string = body.dni ?? currentUser.dni ?? "";

    // Cupo ARCA real en BD
    const currentArca = currentUser.arca || {
      enabled: false,
      totalUSD: 0,
      usedUSD: 0,
    };

    let arcaUpdate = { ...currentArca };

    const wantsArca = !!body.arca?.enabled;

    if (wantsArca) {
      // 1) Necesitamos DNI
      if (!dni) {
        return NextResponse.json(
          {
            error:
              "Necesitamos que completes el DNI / CUIT para verificar tu cupo ARCA.",
          },
          { status: 400 }
        );
      }

      // 2) Verificamos que tenga cupo cargado (totalUSD > 0)
      if (!currentArca.totalUSD || currentArca.totalUSD <= 0) {
        return NextResponse.json(
          {
            error:
              "No encontramos un cupo ARCA cargado para este DNI / CUIT. Si querés usar ARCA, contactanos para activarlo.",
          },
          { status: 400 }
        );
      }

      // 3) (Opcional) que todavía tenga saldo
      if (currentArca.totalUSD <= currentArca.usedUSD) {
        return NextResponse.json(
          {
            error:
              "Tu cupo ARCA ya está completamente utilizado. No tenés saldo disponible.",
          },
          { status: 400 }
        );
      }

      // Si pasó todas las validaciones, solo habilitamos el flag
      arcaUpdate.enabled = true;
    } else {
      // Si el usuario desactiva ARCA desde el front, apagamos el flag
      arcaUpdate.enabled = false;
      // Si en algún momento quisieras resetear montos, podrías hacer:
      // arcaUpdate = { enabled: false, totalUSD: 0, usedUSD: 0 };
    }

    // Armamos el update final
    const update: any = {
      name: body.name ?? currentUser.name ?? "",
      phone: body.phone ?? currentUser.phone ?? "",
      dni,

      address: {
        // legacy
        street: normalizedAddr.street ?? "",

        // nuevos
        streetName: normalizedAddr.streetName ?? "",
        streetNumber: normalizedAddr.streetNumber ?? "",
        floor: normalizedAddr.floor ?? "",
        apartment: normalizedAddr.apartment ?? "",

        city: normalizedAddr.city ?? "",
        province: normalizedAddr.province ?? "",
        postalCode: normalizedAddr.postalCode ?? "",
      },

      // ✅ usamos el cupo real del usuario (no lo que mande el front)
      arca: arcaUpdate,

      billing: {
        fullName:
          body.billing?.fullName ??
          currentUser.billing?.fullName ??
          currentUser.name ??
          "",
        dni: body.billing?.dni ?? currentUser.billing?.dni ?? dni ?? "",
        address:
          body.billing?.address ?? currentUser.billing?.address ?? "",
        city: body.billing?.city ?? currentUser.billing?.city ?? "",
        province:
          body.billing?.province ?? currentUser.billing?.province ?? "",
        postalCode:
          body.billing?.postalCode ??
          currentUser.billing?.postalCode ??
          "",
      },
      // paymentMethods lo dejamos para otra pantalla cuando lo quieras implementar
    };

    const saved = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: update },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json(saved, { status: 200 });
  } catch (err) {
    console.error("PUT /api/account error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
