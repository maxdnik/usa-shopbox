import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb"; // Conexión centralizada
import { Product } from "@/lib/models/Product";

// Función interna para validar si sos el administrador
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === "maxidimnik@gmail.com";
}

// 1. OBTENER UN PRODUCTO ESPECÍFICO (GET)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ACTUALIZAR PRODUCTO (PUT)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    // Lógica de Negocio: Recalcular precio estimado (USA * 1.35)
    if (data.priceUSD) {
      data.estimatedUSD = Number((data.priceUSD * 1.35).toFixed(2));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      { $set: data }, 
      { new: true, runValidators: true }
    );

    return NextResponse.json({ ok: true, product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. ELIMINAR PRODUCTO DE LA DB (DELETE)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "El producto no existe o ya fue borrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Producto eliminado correctamente" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}