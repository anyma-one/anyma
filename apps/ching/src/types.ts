// Shapes returned by the kit's JS modules (src/lib), typed for the UI.
import type { Level, Trigram } from "./data";

export interface Line {
  coins?: number[];
  total: number;
  key: string;
  name: string;
  yang: boolean;
  changing: boolean;
}

export interface Seal {
  file: string;
  shape: "square" | "tall" | string;
  composed?: boolean;
}

export interface Identity {
  number: number;
  glyph: string;
  name: string;
  wilhelm: string;
  pinyin: string;
  chinese: string;
  seal: Seal;
  lines: number[];
  label: string;
  trigrams: { upper: Trigram; lower: Trigram };
}

export type Part = { text: string } | { token: string; value: string };

export interface Reading {
  level: Level;
  question: string;
  tosses: { line: number; coins: number[]; total: number; type: string; changing: boolean }[];
  changingLines: number[];
  primary: Identity;
  quick: { judgment: string; image: string; honestFrame: string; cta: string };
  deep?: {
    changingFraming: string | null;
    meaning: string;
    beneficial: string;
    beware: string;
    reflections: string[];
    changingLineTexts: { line: number; text: string }[];
    allChangingText: string | null;
    secondTeaser: { number: number; glyph: string; name: string; text: string; parts: Part[]; cta: string } | null;
  };
  full?: {
    changingFraming: string;
    allLines: { line: number; text: string; changing: boolean }[];
    second: (Identity & { judgment: string; image: string; meaning: string }) | null;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** A saved cast: coins, not just totals, so the faces survive a reload (BUILD §4). */
export interface StoredCast {
  question: string;
  level: Level;
  coins: number[][];
  at: number;
  dialogue?: ChatMessage[];
}
