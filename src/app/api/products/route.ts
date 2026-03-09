import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { PRICING_CONFIG_DEFAULT } from "@/lib/pricing-engine";

/**
 * 🚀 API DE PRODUCTOS (Versión Final con Markup Estratégico)
 * - Soporta search
 * - Soporta winterCategory (ski | outdoor | city)
 * - Ordena por priceUSD desc
 * - Aplica markup global
 */
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 100;

    // ✅ NUEVO: winterCategory filter
    const winterCategoryParam = searchParams.get("winterCategory");
    const winterCategory =
      winterCategoryParam === "ski" ||
      winterCategoryParam === "outdoor" ||
      winterCategoryParam === "city"
        ? winterCategoryParam
        : null;

    /**
     * CONSTRUCCIÓN DE LA QUERY
     * - Si hay winterCategory: filtra por ese campo
     * - Si hay search: agrega $or
     * - Si hay ambos: usa $and
     */
    const andFilters: any[] = [];

    if (winterCategory) {
      andFilters.push({ winterCategory });
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };

      andFilters.push({
        $or: [
          { title: searchRegex },
          { brand: searchRegex },
          { description: searchRegex },
          { "category.main": searchRegex },
          { "category.sub": searchRegex },
          { "category.leaf": searchRegex },
        ],
      });
    }

    const query = andFilters.length > 0 ? { $and: andFilters } : {};

    const rawProducts = await Product.find(query)
      .select(
        "title priceUSD store brand images slug description category featured variations specs weight winterCategory"
      )
      .sort({ priceUSD: -1 })
      .limit(limit)
      .lean();

    const products = rawProducts.map((p: any) => {
      const markupFactor = 1 + PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT;

      return {
        ...p,
        priceUSD: Number((p.priceUSD * markupFactor).toFixed(2)),
        variations: p.variations?.map((v: any) => ({
          ...v,
          price: Number((v.price * markupFactor).toFixed(2)),
        })),
      };
    });

    console.log(
      `✅ API: Enviando ${products.length} productos` +
        (winterCategory ? ` | winterCategory=${winterCategory}` : "") +
        (search ? ` | search="${search}"` : "") +
        ` | markup ${(PRICING_CONFIG_DEFAULT.BASE_FEE_PERCENT * 100)}%`
    );

    return NextResponse.json(
      {
        ok: true,
        products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error crítico en API /api/products:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno del servidor al procesar el inventario.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}