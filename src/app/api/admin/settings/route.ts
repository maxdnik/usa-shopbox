import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Settings } from "@/lib/models/Settings";

export async function GET() {
  await dbConnect();

  let settings = await Settings.findOne({ key: "pricing_config" }).lean();
  if (!settings) {
    const created = await Settings.create({ key: "pricing_config" });
    settings = created.toObject();
  }

  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  await dbConnect();

  const body = await req.json();

  // ✅ Evita conflictos y campos no editables
  if (body?._id) delete body._id;
  if (body?.key) delete body.key;
  if (body?.createdAt) delete body.createdAt;
  if (body?.updatedAt) delete body.updatedAt;
  if (body?.__v) delete body.__v;

  const settings = await Settings.findOneAndUpdate(
    { key: "pricing_config" },     // ✅ key SOLO en filtro
    { $set: body },                // ✅ actualizamos solo lo editable
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  return NextResponse.json(settings);
}