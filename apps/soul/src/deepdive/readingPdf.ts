// Turns a finished, structured Deep Dive into the payload the PDF renderer expects
// (api/reading-pdf.ts), and fetches the rendered file.
//
// The shapes differ on purpose. On screen the reading is one flowing report; in the PDF it
// is a fixed six-page composition, so a few pieces have to be lifted out of the prose and
// handed over separately — see `secondNature` and `pullQuote` below.

import type { Block } from "./reportFormat";
import type { StructuredReport } from "./reportSections";

export interface ReadingPdfAnimal {
  name: string;
  epithet?: string;
  card?: string | null;
}

export interface ReadingPdfPayload {
  base: string;
  savedDate: string;
  primary: ReadingPdfAnimal;
  secondary?: ReadingPdfAnimal | null;
  shortVersion: string[];
  core: string[];
  secondNature?: string;
  beyond: string[];
  world: string[];
  pullQuote?: string;
  challenges: string[];
  unaware: string[];
  questions: string[];
}

/** Flatten a block to plain text; the PDF styles emphasis itself and never shows markup. */
const blockText = (b: Block): string =>
  b.lines.map((line) => line.map((s) => s.text).join("")).join(" ").trim();

const paragraphs = (blocks: Block[] | undefined): string[] =>
  (blocks ?? []).filter((b) => b.type === "paragraph").map(blockText).filter(Boolean);

/**
 * The first bold run in a section, as a whole sentence.
 *
 * The report bolds one key line per section, which is the writing's own idea of what
 * matters there — so the pull quote is lifted rather than chosen. Verbatim by construction,
 * because it is the segment text itself.
 */
function boldSentence(blocks: Block[] | undefined): string | undefined {
  for (const b of blocks ?? []) {
    for (const line of b.lines) {
      const bold = line
        .filter((s) => s.bold)
        .map((s) => s.text)
        .join("")
        .trim();
      if (bold.length > 20) return bold;
    }
  }
  return undefined;
}

export function buildReadingPdfPayload(
  structured: StructuredReport,
  primary: ReadingPdfAnimal,
  secondary: ReadingPdfAnimal | null,
  base: string,
): ReadingPdfPayload {
  const byLabel = (label: string) =>
    structured.sections.find((s) => s.title.toLowerCase() === label.toLowerCase())?.blocks;

  // "At your core" closes with the paragraph introducing the second animal. On the page it
  // simply continues the section; in the PDF it is the second-nature panel, so it is lifted
  // out here rather than printed twice.
  const coreAll = paragraphs(byLabel("At your core"));
  const secondIdx = coreAll.findIndex((p) => /\bsecond nature\b/i.test(p));
  const core = secondIdx >= 0 ? coreAll.filter((_, i) => i !== secondIdx) : coreAll;
  const secondNature = secondIdx >= 0 ? coreAll[secondIdx] : undefined;

  // The questions section opens with a standing line that the PDF sets as its own intro,
  // so it is dropped here to avoid showing it twice.
  const questions = paragraphs(byLabel("Three questions to go deeper")).filter(
    (q) => !/^sit with these/i.test(q),
  );

  return {
    base,
    savedDate: new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    primary,
    secondary,
    shortVersion: paragraphs(structured.distillation?.blocks),
    core,
    secondNature,
    beyond: paragraphs(byLabel("Beyond the spirit")),
    world: paragraphs(byLabel("You & the world")),
    pullQuote: boldSentence(byLabel("You & the world")),
    challenges: paragraphs(byLabel("What challenges you")),
    unaware: paragraphs(byLabel("What you might not be aware of")),
    questions,
  };
}

/** Render and save the PDF. Throws with a readable message so the caller can show one. */
export async function downloadReadingPdf(payload: ReadingPdfPayload): Promise<void> {
  const res = await fetch("/api/reading-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Could not build the PDF (${res.status})`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `anyma-reading-${payload.primary.name.toLowerCase()}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke late: Safari cancels the download if the URL dies too soon.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
