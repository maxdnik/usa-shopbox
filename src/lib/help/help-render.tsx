// src/lib/help/help-render.tsx
import React from "react";

export function renderSimpleMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (!listBuffer.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-6 space-y-2">
        {listBuffer.map((item, idx) => (
          <li key={idx} className="text-slate-700 leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const pushParagraph = (text: string) => {
    const t = text.trim();
    if (!t) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-slate-700 leading-relaxed">
        {renderInline(t)}
      </p>
    );
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3
          key={`h3-${blocks.length}`}
          className="text-lg font-black text-[#0A2647] mt-6 mb-2 tracking-tight"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2
          key={`h2-${blocks.length}`}
          className="text-xl md:text-2xl font-black text-[#0A2647] mt-6 mb-3 tracking-tight"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1
          key={`h1-${blocks.length}`}
          className="text-2xl md:text-3xl font-black text-[#0A2647] mt-2 mb-4 tracking-tight"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
      continue;
    }

    flushList();
    pushParagraph(line);
  }

  flushList();

  return <div className="space-y-4">{blocks}</div>;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;

  const pattern = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/;

  while (remaining.length) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2);
      nodes.push(
        <strong key={`b-${nodes.length}`} className="text-[#0A2647] font-black">
          {inner}
        </strong>
      );
      remaining = remaining.slice(match.index + token.length);
      continue;
    }

    if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const closingBracket = token.indexOf("]");
      const label = token.slice(1, closingBracket);
      const href = token.slice(closingBracket + 2, -1);

      nodes.push(
        <a
          key={`a-${nodes.length}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-[#0A2647] font-black underline underline-offset-4 hover:text-emerald-600 transition-colors"
        >
          {label}
        </a>
      );
      remaining = remaining.slice(match.index + token.length);
      continue;
    }

    nodes.push(token);
    remaining = remaining.slice(match.index + token.length);
  }

  return nodes;
}