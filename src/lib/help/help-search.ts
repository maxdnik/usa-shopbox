// src/lib/help/help-search.ts

import type { HelpCenterData, HelpItem } from "./help-data";

export type HelpSearchResult = {
  item: HelpItem;
  score: number;
  highlights: string[]; // tokens que matchearon, útil si querés mostrar "Matches: ..."
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca acentos
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(str: string): string[] {
  const s = normalize(str);
  if (!s) return [];
  return s.split(" ").filter((t) => t.length >= 2);
}

function expandTokens(tokens: string[], synonyms: Record<string, string[]>): string[] {
  const expanded = new Set(tokens);

  // match por "clave" de sinónimo completa (ej: "precio final")
  const joined = tokens.join(" ");
  for (const [key, syns] of Object.entries(synonyms)) {
    const keyNorm = normalize(key);
    if (joined.includes(keyNorm)) {
      for (const s of syns) expanded.add(normalize(s));
      expanded.add(keyNorm);
    }
  }

  // match por token individual (ej: "aduana" -> synonyms["aduana"])
  for (const t of tokens) {
    for (const [key, syns] of Object.entries(synonyms)) {
      const keyNorm = normalize(key);
      if (t === keyNorm) {
        expanded.add(keyNorm);
        for (const s of syns) expanded.add(normalize(s));
      }
    }
  }

  return Array.from(expanded);
}

function scoreItem(item: HelpItem, expandedTokens: string[]): { score: number; highlights: string[] } {
  const title = normalize(item.title);
  const snippet = normalize(item.snippet);
  const keywords = item.keywords.map(normalize);

  let score = 0;
  const hits: string[] = [];

  for (const raw of expandedTokens) {
    const t = normalize(raw);
    if (!t) continue;

    // ponderación:
    // title exact token -> +10
    // title contains -> +6
    // keyword exact -> +8
    // keyword contains -> +5
    // snippet contains -> +3
    if (title.split(" ").includes(t)) {
      score += 10;
      hits.push(t);
      continue;
    }
    if (title.includes(t)) {
      score += 6;
      hits.push(t);
      continue;
    }

    const keywordExact = keywords.includes(t);
    if (keywordExact) {
      score += 8;
      hits.push(t);
      continue;
    }
    const keywordContains = keywords.some((k) => k.includes(t));
    if (keywordContains) {
      score += 5;
      hits.push(t);
      continue;
    }

    if (snippet.includes(t)) {
      score += 3;
      hits.push(t);
      continue;
    }
  }

  // bonus por matches múltiples
  const uniqueHits = new Set(hits);
  if (uniqueHits.size >= 3) score += 4;
  if (uniqueHits.size >= 5) score += 6;

  return { score, highlights: Array.from(uniqueHits) };
}

export function searchHelp(query: string, data: HelpCenterData): HelpSearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const expanded = expandTokens(tokens, data.search.synonyms);

  const scored = data.items
    .map((item) => {
      const { score, highlights } = scoreItem(item, expanded);
      return { item, score, highlights };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored;
}