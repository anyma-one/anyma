// Small text helpers: Chinese runs, glyphs, names, copy templates with styled tokens.
import type { ReactNode } from "react";
import { templateParts } from "../lib/reading.js";
import type { Part } from "../types";

/** Chinese text always carries lang="zh-Hant" (CLAUDE.md). */
export const Zh = ({ children }: { children: ReactNode }) => (
  <span lang="zh-Hant" className="zh">
    {children}
  </span>
);

/** Hexagram/trigram Unicode glyph: small inline references only, with a symbol-font fallback. */
export const Glyph = ({ children }: { children: ReactNode }) => (
  <span className="glyph" aria-hidden="true">
    {children}
  </span>
);

/** Pinyin always appears with the character (CLAUDE.md). */
export const PinyinChar = ({ pinyin, chinese }: { pinyin: string; chinese: string }) => (
  <span className="pinyin">
    {pinyin} <Zh>{chinese}</Zh>
  </span>
);

/** Render template parts, styling {glyph} tokens. */
export function Parts({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) =>
        "text" in p ? (
          <span key={i}>{p.text}</span>
        ) : p.token === "glyph" ? (
          <Glyph key={i}>{p.value}</Glyph>
        ) : (
          <strong key={i}>{p.value}</strong>
        ),
      )}
    </>
  );
}

/** A copy template with tokens filled and styled. */
export function Template({ template, values }: { template: string; values: Record<string, string | number> }) {
  return <Parts parts={templateParts(template, values) as Part[]} />;
}

/** Wrap runs of CJK characters in rendered HTML with lang="zh-Hant" (used for the Markdown pages). */
export function tagChinese(html: string): string {
  return html.replace(/>([^<]+)</g, (_m, text: string) =>
    `>${text.replace(/([㐀-鿿豈-﫿]+)/g, '<span lang="zh-Hant" class="zh">$1</span>')}<`,
  );
}
