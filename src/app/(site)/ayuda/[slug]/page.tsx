// src/app/ayuda/[slug]/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";

import HeaderEcom from "@/components/home/HeaderEcom";
import Footer from "@/components/home/Footer";
import { renderSimpleMarkdown } from "@/lib/help/help-render";

type Props = {
  params: Promise<{ slug: string }>;
};

function getArticlePath(slug: string) {
  return path.join(process.cwd(), "src", "lib", "help", "articles", `${slug}.md`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const titleSlug = (slug ?? "ayuda")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${titleSlug} | Centro de Ayuda | USA Shop Box`,
    description: "Información y respuestas del Centro de Ayuda de USA Shop Box.",
  };
}

export default async function HelpArticlePage({ params }: Props) {
  const { slug } = await params;

  const filePath = getArticlePath(slug);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const md = fs.readFileSync(filePath, "utf8");

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <HeaderEcom />

      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/ayuda"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0A2647] uppercase tracking-widest transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Volver al Centro de Ayuda
            </Link>
          </div>

          <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#0A2647] p-10 md:p-16 text-center">
              <h1 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tighter uppercase">
                Centro de Ayuda
              </h1>
              <p className="text-white/60 text-sm font-medium max-w-lg mx-auto">
                Información clara, por etapas, sin sorpresas.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white uppercase tracking-widest">
                <span className="opacity-80">Artículo:</span>
                <span className="text-white">{slug.replaceAll("-", " ")}</span>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
                {renderSimpleMarkdown(md)}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/ayuda"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0A2647] uppercase tracking-widest transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                  Volver al Centro de Ayuda
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}