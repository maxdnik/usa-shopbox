import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { mockProducts } from "@/lib/products";

export async function GET() {
  try {
    await dbConnect();

    // 1. LIMPIEZA DE DUPLICADOS: Borramos todo lo que NO sea Apple para empezar de cero y limpio
    // (Opcional: Si querés borrar TODO y empezar de cero, usá Product.deleteMany({}))
    await Product.deleteMany({ store: { $ne: "Apple" } }); 

    // 2. Filtramos los mocks (excluyendo Apple porque ya los tenés)
    const toMigrate = mockProducts.filter(p => 
      p.store.toLowerCase() !== "apple" && 
      !p.title.toLowerCase().includes("Apple")
    );

    // 3. Insertamos solo lo nuevo
    const productsToInsert = toMigrate.map(p => ({
      title: p.title,
      slug: p.slug,
      brand: p.store,
      store: p.store,
      category: p.category,
      description: p.description || `Producto original de ${p.store}`,
      priceUSD: p.priceUSD,
      estimatedUSD: p.estimatedUSD,
      images: p.imageUrl ? [p.imageUrl] : [`https://placehold.co/600x600/white/0A2647?text=${encodeURIComponent(p.title)}`],
      specs: {},
      variations: []
    }));

    const result = await Product.insertMany(productsToInsert);

    return NextResponse.json({ 
      ok: true, 
      message: `¡Limpieza y carga completada! Se sumaron ${result.length} productos nuevos. Total en DB: ${await Product.countDocuments()}` 
    });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}