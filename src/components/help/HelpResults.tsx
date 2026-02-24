"use client";

import Link from "next/link";
import type { HelpSearchResult } from "@/lib/help/help-search";
import type { HelpItem } from "@/lib/help/help-data";

function getLink(item: HelpItem): { href: string; label: string } | null {
  if (!item.link) return null;
  if (item.link.type === "internal") {
    return { href: item.link.href, label: item.link.label ?? "Leer más" };
  }
  return { href: `/ayuda/${item.link.slug}`, label: item.link.label ?? "Leer más" };
}

export default function HelpResults({
  query,
  results,
}: {
  query: string;
  results: HelpSearchResult[];
}) {
  if (!query.trim()) return null;

  if (results.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="text-sm font-semibold">No encontramos resultados</div>
        <p className="mt-1 text-sm text-neutral-700">
          Probá con “aduana”, “precio final”, “seguimiento” o “devolución”.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Resultados</h2>
        <div className="text-sm text-neutral-600">
          {results.length} resultado{results.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {results.slice(0, 10).map((r) => {
          const link = getLink(r.item);
          return (
            <div
              key={r.item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="text-sm font-semibold">{r.item.title}</div>
              <p className="mt-1 text-sm text-neutral-700">{r.item.snippet}</p>

              {link ? (
                <div className="mt-3">
                  <Link
                    href={link.href}
                    className="text-sm underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}