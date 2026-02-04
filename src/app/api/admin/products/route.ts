import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";

// Solo permitimos el acceso si el usuario es administrador
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === "maxidimnik@gmail.com"; // Ajusta tu mail de admin
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id, ...updateData } = await req.json();
    await dbConnect();
    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ ok: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}