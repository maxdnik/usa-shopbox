"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import HelpSearch from "@/components/help/HelpSearch";
import HelpCategories from "@/components/help/HelpCategories";
import HelpResults from "@/components/help/HelpResults";
import { HELP_CENTER_DATA } from "@/lib/help/help-data";
import { searchHelp } from "@/lib/help/help-search";

export default function HelpCenterBlock() {
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchHelp(query, HELP_CENTER_DATA);
  }, [query]);

  const filteredItems = useMemo(() => {
    const items = HELP_CENTER_DATA.items.filter(
      (i) => i.type === "faq" || i.type === "article"
    );
    if (!activeCategoryId) return items;
    return items.filter((i) => i.categoryId === activeCategoryId);
  }, [activeCategoryId]);

  return (
    <div className="mb-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="mb-4">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Centro de Ayuda
          </div>
          <div className="text-lg md:text-xl font-black text-[#0A2647] tracking-tight mt-1">
            Buscá una respuesta
          </div>
        </div>

        <HelpSearch
          title={HELP_CENTER_DATA.search.title}
          placeholder={HELP_CENTER_DATA.search.placeholder}
          helperText={HELP_CENTER_DATA.search.helperText}
          suggestedChips={HELP_CENTER_DATA.search.suggestedChips}
          value={query}
          onChange={(v) => setQuery(v)}
          onChipClick={(chip) => setQuery(chip)}
        />

        <HelpCategories
          categories={HELP_CENTER_DATA.categories}
          activeCategoryId={activeCategoryId}
          onSelect={(id) => setActiveCategoryId(id)}
        />

        <HelpResults query={query} results={results} />

        {!query.trim() ? (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#0A2647] uppercase tracking-widest">
                Explorar por categoría
              </h3>
              {activeCategoryId ? (
                <button
                  type="button"
                  onClick={() => setActiveCategoryId(null)}
                  className="text-xs font-bold text-slate-400 hover:text-[#0A2647] uppercase tracking-widest transition-colors"
                >
                  Ver todas
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3">
              {filteredItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="font-bold text-slate-800 text-sm md:text-base">
                    {item.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {item.snippet}
                  </div>

                  {item.link ? (
                    <div className="mt-3">
                      <Link
                        href={
                          item.link.type === "internal"
                            ? item.link.href
                            : `/ayuda/${item.link.slug}`
                        }
                        className="inline-flex items-center gap-2 text-xs font-black text-[#0A2647] uppercase tracking-widest hover:text-emerald-600 transition-colors"
                      >
                        {item.link.label ?? "Leer más"}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-bold text-slate-800">
            ¿No encontraste lo que buscabas?
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Escribinos y lo resolvemos con vos.
          </p>
        </div>
      </div>
    </div>
  );
}