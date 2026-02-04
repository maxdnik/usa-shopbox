import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Settings } from "@/lib/models/Settings";

export async function GET() {
  await dbConnect();
  let settings = await Settings.findOne({ key: "pricing_config" });
  if (!settings) settings = await Settings.create({ key: "pricing_config" });
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const settings = await Settings.findOneAndUpdate(
    { key: "pricing_config" },
    { $set: body },
    { new: true, upsert: true }
  );
  return NextResponse.json(settings);
}