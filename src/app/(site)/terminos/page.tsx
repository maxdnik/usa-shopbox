import { Suspense } from "react";
import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "Términos y Condiciones | USA Shop Box",
  description: "Condiciones de uso, políticas de servicio y regulaciones de USA Shop Box.",
};

function TermsFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
      <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12 animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
        </div>
      </section>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsFallback />}>
      <TermsClient />
    </Suspense>
  );
}