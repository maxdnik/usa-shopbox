// src/app/api/help/search/route.ts
import { NextResponse } from "next/server";
import { HELP_CENTER_DATA } from "@/lib/help/help-data";
import { searchHelp } from "@/lib/help/help-search";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results = searchHelp(q, HELP_CENTER_DATA).slice(0, 10).map((r) => ({
    id: r.item.id,
    title: r.item.title,
    snippet: r.item.snippet,
    score: r.score,
    link:
      r.item.link?.type === "internal"
        ? r.item.link.href
        : r.item.link?.type === "article"
          ? `/ayuda/${r.item.link.slug}`
          : null,
  }));

  return NextResponse.json({ results });
}