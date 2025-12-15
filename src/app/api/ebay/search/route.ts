// src/app/api/ebay/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getEbayAccessToken } from "@/lib/ebay";

function extractImage(item: any): string | null {
  return (
    item.image?.imageUrl ||
    item.image?.url ||
    item.thumbnailImages?.[0]?.imageUrl ||
    item.thumbnailImages?.[0]?.url ||
    item.primaryProductImage?.imageUrl ||
    item.imageDetails?.images?.[0]?.imageUrl ||
    item.imageDetails?.images?.[0]?.url ||
    item.itemGroupImageURLs?.[0] ||
    null
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Missing 'query' parameter" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getEbayAccessToken();

    const ebayEndpoint =
      "https://api.ebay.com/buy/browse/v1/item_summary/search";

    const searchUrl = new URL(ebayEndpoint);
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("limit", "20");

    const res = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error llamando a eBay:", res.status, text);
      return NextResponse.json(
        {
          error: "Error calling eBay API",
          status: res.status,
        },
        { status: 500 }
      );
    }

    const data = await res.json();

    const items =
      (data.itemSummaries || []).map((item: any) => ({
        id: item.itemId,
        title: item.title,
        price:
          typeof item.price?.value === "number"
            ? item.price?.value
            : Number(item.price?.value) || null,
        currency: item.price?.currency ?? "USD",
        image: extractImage(item),
        url: item.itemWebUrl ?? null,
        condition: item.condition,
        seller: item.seller?.username,
      })) ?? [];

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error en /api/ebay/search:", error);
    return NextResponse.json(
      {
        error: "Error calling eBay API",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
