// reading.js: what each level shows for a given cast.
//
// This module encodes the level rules in one place:
//   Quick Cast: identity, Judgment, Image, honest frame.
//   Deep Cast:  + Meaning, Beneficial/Beware, reflections, changing-line texts,
//               and a teaser (name and glyph only) for the second hexagram.
//   Full Cast:  + all six lines with changing ones marked, and the second hexagram in full.
//   At Full Cast, Deep Cast's framing, changing-line list and teaser are cleared: Full Cast's
//   framing, all six lines and the second hexagram replace them.
// UI components should render what this returns rather than re-deciding what is visible.
// The second hexagram's Meaning never appears below Full Cast; a locked block shows placeholder
// bars, never the real text.

import { resolve, indexByBinary } from './cast.js';

export const LEVELS = ['quick', 'deep', 'full'];
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

function identity(h, trigrams) {
  const lower = trigrams[h.trigrams.lower];
  const upper = trigrams[h.trigrams.upper];
  return {
    number: h.number,
    glyph: h.char,
    name: h.names.huang,
    wilhelm: h.names.wilhelm,
    pinyin: h.names.pinyin,
    chinese: h.names.chinese,
    seal: h.seal,
    lines: h.lines,
    label: h.label,
    trigrams: { upper, lower },
  };
}

// Split a copy template into text and token parts, so the UI can style tokens
// (e.g. the hexagram glyph needs a symbol-font fallback).
export function templateParts(template, values) {
  return template
    .split(/(\{[a-z]+\})/i)
    .filter(Boolean)
    .map((p) => {
      const key = p.match(/^\{([a-z]+)\}$/i)?.[1];
      return key && key in values ? { token: key, value: values[key] } : { text: p };
    });
}

function changingFraming(copy, primaryNumber, count) {
  const c = copy.changingLines;
  if (count === 0) return { deep: c.zero.tier2, full: c.zero.tier3 };
  if (count === 1) return { deep: c.one.tier2, full: c.one.tier3 };
  if (count === 6) {
    const special = primaryNumber === 1 || primaryNumber === 2;
    return {
      deep: special ? c.all.tier2_hex1_2 : c.all.tier2,
      full: special ? c.all.tier3_hex1_2 : c.all.tier3,
    };
  }
  const fill = (s) => s.replace('{count}', WORDS[count]);
  return { deep: fill(c.several.tier2), full: fill(c.several.tier3) };
}

/**
 * @param {object} cast    { question: string, lines: Array<line from cast.js> }
 * @param {'quick'|'deep'|'full'} level
 * @param {object} data    { hexagrams: [...], trigrams: [...], copy: {...} }
 */
export function buildReading(cast, level, data) {
  if (!LEVELS.includes(level)) throw new Error(`Unknown level: ${level}`);
  const byNumber = new Map(data.hexagrams.map((h) => [h.number, h]));
  const trigrams = Object.fromEntries(data.trigrams.map((t) => [t.key, t]));
  const { primary, second, changingLines } = resolve(cast.lines, indexByBinary(data.hexagrams));
  const h = byNumber.get(primary);
  const s = second ? byNumber.get(second) : null;
  const count = changingLines.length;
  const framing = changingFraming(data.copy, primary, count);

  const reading = {
    level,
    question: cast.question,
    tosses: cast.lines.map((l, i) => ({ line: i + 1, coins: l.coins, total: l.total, type: l.name, changing: l.changing })),
    changingLines,
    primary: identity(h, trigrams),
    quick: {
      judgment: h.judgment,
      image: h.image,
      honestFrame: data.copy.tier1.honestFrame,
      cta: data.copy.tier1.cta,
    },
  };
  if (level === 'quick') return reading;

  reading.deep = {
    changingFraming: framing.deep,
    meaning: h.general,
    beneficial: h.beneficial,
    beware: h.beware,
    reflections: h.reflections,
    changingLineTexts: changingLines.map((n) => ({ line: n, text: h.lineTexts[n - 1] })),
    allChangingText: count === 6 && h.allChanging ? h.allChanging : null,
    secondTeaser: s
      ? {
          number: s.number,
          glyph: s.char,
          name: s.names.huang,
          text: data.copy.tier2.secondHexagramTeaser.replace('{glyph}', s.char).replace('{name}', s.names.huang),
          parts: templateParts(data.copy.tier2.secondHexagramTeaser, { glyph: s.char, name: s.names.huang }),
          cta: data.copy.tier2.secondHexagramCta,
        }
      : null,
  };
  if (level === 'deep') return reading;

  reading.full = {
    changingFraming: framing.full,
    allLines: h.lineTexts.map((text, i) => ({ line: i + 1, text, changing: changingLines.includes(i + 1) })),
    second: s
      ? { ...identity(s, trigrams), judgment: s.judgment, image: s.image, meaning: s.general }
      : null,
  };
  // Full Cast supersedes these Deep Cast parts.
  reading.deep.changingFraming = null;
  reading.deep.changingLineTexts = [];
  reading.deep.secondTeaser = null;
  return reading;
}
