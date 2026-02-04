import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";

export async function GET() {
  try {
    await dbConnect();

    // Agrupamos por categoría y contamos cuántos hay de cada una
    const report = await Product.aggregate([
      { $match: { brand: { $regex: /apple/i } } }, // Filtramos solo Apple
      { 
        $group: { 
          _id: "$category", 
          total: { $sum: 1 },
          ejemplos: { $push: "$title" } 
        } 
      },
      { $project: { category: "$_id", total: 1, ejemplos: { $slice: ["$ejemplos", 2] } } }
    ]);

    const totalGeneral = report.reduce((acc, curr) => acc + curr.total, 0);

    return NextResponse.json({
      ok: true,
      totalEnBaseDeDatos: totalGeneral,
      desglosePorCategoria: report
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}