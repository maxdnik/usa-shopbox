import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
// 🛡️ CORRECCIÓN AQUÍ: Importamos el nombre real que exporta tu engine
import { PRICING_CONFIG_DEFAULT } from "@/lib/pricing-engine";

/**
 * 🚀 API DE PRODUCTOS (Versión Final con Markup Estratégico)
 * Esta ruta gestiona la búsqueda y el listado de productos directamente desde MongoDB.
 * Incluye el ordenamiento por precio solicitado: de Mayor a Menor.
 */
export async function GET(req: Request) {
  try {
    // Establecemos conexión con la base de datos
    await dbConnect();

    // 🔍 Extraemos los parámetros de búsqueda y límites de la URL
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 100;

    /**
     * CONSTRUCCIÓN DE LA QUERY
     * Buscamos coincidencias parciales (case-insensitive) en múltiples campos.
     */
    let query = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      
      query = {
        $or: [
          { title: searchRegex },        // Búsqueda por nombre del producto
          { brand: searchRegex },        // Búsqueda por marca (Nike, Apple, etc.)
          { description: searchRegex },  // Búsqueda en la descripción detallada
          // 📂 Búsqueda en la estructura de categorías jerárquica
          { "category.main": searchRegex },
          { "category.sub": searchRegex },
          { "category.leaf": searchRegex }
        ],
      };
    }

    /**
     * EJECUCIÓN DE LA CONSULTA
     * .sort({ priceUSD: -1 }) -> Ordena de Mayor a Menor precio.
     * .select(...) -> Nos aseguramos de traer todos los campos necesarios.
     */
    const rawProducts = await Product.find(query)
      .select("title priceUSD store brand images slug description category featured variations specs weight")
      .sort({ priceUSD: -1 }) // 💰 ORDEN: Mayor precio primero
      .limit(limit)
      .lean();

    /**
     * 🎯 APLICACIÓN DE MARKUP ESTRATÉGICO GLOBAL
     * Transformamos los precios base de la DB aplicando el margen del motor (10%).
     * Esto asegura que el Grid de la Tienda y el Home muestren el precio marginado.
     */
    const products = rawProducts.map((p: any) => {
      // 👇 CORRECCIÓN AQUÍ: Usamos la variable DEFAULT
      const markupFactor = 1 + PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT;
      
      return {
        ...p,
        // El precio principal sale marginado (ej: 79 -> 86.90)
        priceUSD: Number((p.priceUSD * markupFactor).toFixed(2)),
        // Marginamos también todas las variantes para evitar saltos en la ficha
        variations: p.variations?.map((v: any) => ({
          ...v,
          price: Number((v.price * markupFactor).toFixed(2))
        }))
      };
    });

    // Log de control para verificar el flujo en tu terminal
    console.log(`✅ API: Enviando ${products.length} productos con markup del ${(PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT * 100)}% aplicado.`);

    return NextResponse.json({ 
      ok: true, 
      products,
      count: products.length 
    }, { status: 200 });

  } catch (err: any) {
    // Captura de errores críticos para evitar caídas del frontend
    console.error("❌ Error crítico en API /api/products:", err);
    
    return NextResponse.json({ 
      ok: false, 
      error: "Error interno del servidor al procesar el inventario.",
      details: err.message 
    }, { status: 500 });
  }
}