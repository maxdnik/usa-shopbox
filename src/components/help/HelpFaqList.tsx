"use client";

import Link from "next/link";
import type { HelpItem } from "@/lib/help/help-data";

type Props = {
  title?: string;
  items: HelpItem[];
  max?: number;
};

function getLink(item: HelpItem): { href: string; label: string } | null {
  if (!item.link) return null;
  if (item.link.type === "internal") {
    return { href: item.link.href, label: item.link.label ?? "Leer más" };
  }
  return { href: `/ayuda/${item.link.slug}`, label: item.link.label ?? "Leer más" };
}

export default function HelpFaqList({ title = "Preguntas frecuentes", items, max = 12 }: Props) {
  const list = items.slice(0, max);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {list.map((item) => {
          const link = getLink(item);
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="text-sm font-semibold">{item.title}</div>
              <p className="mt-1 text-sm text-neutral-700">{item.snippet}</p>

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