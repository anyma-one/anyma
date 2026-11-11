// Static content: imported once, bundled (BUILD §2). User-facing text comes only from here.
import hexagrams from "../data/hexagrams.json";
import trigrams from "../data/trigrams.json";
import copy from "../data/copy.json";

export { hexagrams, trigrams, copy };
export const data = { hexagrams, trigrams, copy };

export type Copy = typeof copy;
export type Hexagram = (typeof hexagrams)[number];
export type Trigram = (typeof trigrams)[number];
export type Level = "quick" | "deep" | "full";
export type Total = 6 | 7 | 8 | 9;

export const hexByNumber = new Map(hexagrams.map((h) => [h.number, h]));
export const trigramByKey = new Map(trigrams.map((t) => [t.key, t]));

/** Fill `{token}` placeholders in a copy template. Unknown tokens are left as they are. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([a-z]+)\}/gi, (m, k: string) => (k in values ? String(values[k]) : m));
}

/** Copy for a line total: name, coins, draw, text, odds. */
export function lineType(total: number) {
  return copy.lineTypes[String(total) as "6" | "7" | "8" | "9"];
}

export const levelName = (level: Level) => copy.levels[level === "quick" ? 0 : level === "deep" ? 1 : 2].name;

// ---- Design update (11 Nov 2026) ----
import uiStrings from "../data/ui.json";
/** Interface labels from the design update (data/ui.json). */
export const ui = uiStrings;

/** "03": hexagram and line numbers stay zero-padded in labels (design CLAUDE.md). */
export const pad = (n: number) => String(n).padStart(2, "0");

const MINOR = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "nor", "of", "on", "or", "over", "per", "the", "to", "via", "with"]);

/**
 * Title case for headlines, section headings and dropdown titles (design rule): minor words stay
 * lower case unless first or last, or after a colon. "The" before "I Ching" is capitalised in
 * the approved headlines ("Read The I Ching"), so a "the" before a capitalised word is kept as is.
 */
export function titleCase(s: string): string {
  const words = s.split(" ");
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      const afterColon = i > 0 && /:$/.test(words[i - 1]);
      if (i > 0 && i < words.length - 1 && !afterColon && MINOR.has(lower)) {
        if (lower === "the" && /^[A-Z]/.test(w)) return w; // keep "The" where the source has it
        return lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/**
 * Paragraph rule for long texts (design CLAUDE.md): keep author breaks; otherwise split texts
 * over about 420 characters at sentence ends, about every 300 characters. Ported from the
 * design prototype's paras().
 */
export function paragraphs(text: string): string[] {
  const t = String(text || "").trim();
  if (!t) return [];
  if (t.includes("\n\n")) return t.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  if (t.length <= 420) return [t];
  const sents = t.match(/[^.!?]+[.!?]+["'”’)]*\s*|[^.!?]+$/g) || [t];
  const out: string[] = [];
  let cur = "";
  const target = Math.max(260, Math.round(t.length / Math.round(t.length / 300)));
  sents.forEach((x, i) => {
    cur += x;
    const left = sents.slice(i + 1).join("").length;
    if (cur.length >= target && left > 120) {
      out.push(cur.trim());
      cur = "";
    }
  });
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const WORDS = ["no", "one", "two", "three", "four", "five", "six"];
export const countWord = (n: number) => WORDS[n] ?? String(n);
