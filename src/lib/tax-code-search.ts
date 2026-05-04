import * as fs from "fs";
import * as path from "path";

interface ArticleChunk {
  label: string;
  text: string;
}

let indexCache: ArticleChunk[] | null = null;

function loadIndex(): ArticleChunk[] {
  if (indexCache) return indexCache;
  const filePath = path.join(process.cwd(), "tax_code_index.jsonl");
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf-8").trim().split("\n");
  indexCache = lines.map((l) => JSON.parse(l) as ArticleChunk);
  return indexCache;
}

function score(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((acc, kw) => {
    const count = (lower.match(new RegExp(kw.toLowerCase(), "g")) ?? []).length;
    return acc + count;
  }, 0);
}

export function searchTaxCode(query: string, topN = 8): string {
  const chunks = loadIndex();
  if (!chunks.length) return "";

  // Extract keywords (words longer than 3 chars)
  const keywords = query
    .toLowerCase()
    .split(/[\s,.:;!?()]+/)
    .filter((w) => w.length > 3);

  if (!keywords.length) return chunks.slice(0, 3).map((c) => c.text).join("\n\n");

  // Score each chunk
  const scored = chunks.map((chunk) => ({
    chunk,
    score: score(chunk.label + " " + chunk.text, keywords),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Take top N relevant, filter out zero-score
  const relevant = scored
    .filter((s) => s.score > 0)
    .slice(0, topN)
    .map((s) => `**${s.chunk.label}**\n${s.chunk.text}`);

  if (!relevant.length) {
    // Fallback: return first few articles
    return chunks.slice(1, 4).map((c) => `**${c.label}**\n${c.text}`).join("\n\n");
  }

  return relevant.join("\n\n---\n\n");
}
