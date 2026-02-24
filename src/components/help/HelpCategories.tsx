"use client";

import type { HelpCategory } from "@/lib/help/help-data";

type Props = {
  categories: HelpCategory[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
};

export default function HelpCategories({
  categories,
  activeCategoryId,
  onSelect,
}: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorías</h2>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Ver todas
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((c) => {
          const active = c.id === activeCategoryId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(active ? null : c.id)}
              className={[
                "rounded-2xl border px-4 py-4 text-left transition",
                active
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 bg-white hover:border-neutral-400",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{c.name}</div>
              {c.description ? (
                <div className="mt-1 text-xs text-neutral-600">
                  {c.description}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}