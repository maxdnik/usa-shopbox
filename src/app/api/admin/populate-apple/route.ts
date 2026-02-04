import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";

export async function GET() {
  try {
    await dbConnect();

    const appleProducts: Record<string, any>[] = [];

    // --- LÓGICA PARA IPHONES (16 Pro, 16, 15) ---
    const iphoneModels = [
      { name: "iPhone 16 Pro Max", basePrice: 1199, colors: ["Natural", "Black", "White", "Desert"], caps: ["256GB", "512GB", "1TB"] },
      { name: "iPhone 16 Pro", basePrice: 999, colors: ["Natural", "Black", "White", "Desert"], caps: ["128GB", "256GB", "512GB", "1TB"] },
      { name: "iPhone 16", basePrice: 799, colors: ["Ultramarine", "Teal", "Pink", "White", "Black"], caps: ["128GB", "256GB", "512GB"] },
      { name: "iPhone 15", basePrice: 699, colors: ["Blue", "Pink", "Yellow", "Green", "Black"], caps: ["128GB", "256GB", "512GB"] }
    ];

    iphoneModels.forEach(m => {
      m.colors.forEach(color => {
        m.caps.forEach(cap => {
          const extraPrice = cap === "1TB" ? 400 : cap === "512GB" ? 200 : cap === "256GB" && m.name !== "iPhone 16 Pro Max" ? 100 : 0;
          const finalPrice = m.basePrice + extraPrice;
          const title = `${m.name} ${cap} - ${color} Titanium`;
          
          appleProducts.push({
            title,
            slug: title.toLowerCase().replace(/ /g, "-").replace(/\"/g, ""),
            store: "Apple",
            brand: "Apple",
            category: "Celulares",
            priceUSD: finalPrice,
            estimatedUSD: Number((finalPrice * 1.35).toFixed(2)),
            attributes: { color, capacity: cap },
            description: `Nuevo ${m.name} original importado de USA.`
          });
        });
      });
    });

    // --- LÓGICA PARA MACBOOKS (M3 / M4) ---
    const macs = [
      { name: "MacBook Pro 14\" M4", price: 1599, colors: ["Space Black", "Silver"] },
      { name: "MacBook Air 13\" M3", price: 1099, colors: ["Midnight", "Starlight", "Silver"] }
    ];

    macs.forEach(m => {
      m.colors.forEach(color => {
        const title = `${m.name} - ${color}`;
        appleProducts.push({
          title,
          slug: title.toLowerCase().replace(/ /g, "-").replace(/\"/g, ""),
          store: "Apple",
          brand: "Apple",
          category: "Computación",
          priceUSD: m.price,
          estimatedUSD: Number((m.price * 1.35).toFixed(2)),
          attributes: { color },
          description: `${m.name} con el último chip de Apple Silicon.`
        });
      });
    });

    // --- LIMPIAR E INSERTAR ---
    await Product.deleteMany({ brand: "Apple" }); // Borra los 5 anteriores para no duplicar
    const result = await Product.insertMany(appleProducts);

    return NextResponse.json({
      ok: true,
      message: `¡Brutal! Se generaron y cargaron ${result.length} variantes de Apple.`,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}