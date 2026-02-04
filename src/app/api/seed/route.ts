import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import appleData from "./apple_products_population.json"; // el archivo que te adjunté

export async function GET() {
  try {
    await dbConnect();
    
    // Opcional: Limpiar productos de Apple previos para no duplicar
    await Product.deleteMany({ brand: "Apple" });

    // Insertar todos los productos
    const created = await Product.insertMany(appleData);

    return NextResponse.json({ 
      message: `¡Éxito! Se cargaron ${created.length} productos de Apple.`,
      ok: true 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}