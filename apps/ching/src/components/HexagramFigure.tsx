// Hexagram (or trigram) figure drawn from bars, never from the Unicode glyph (design: Hexagram.md).
// Lines are listed bottom to top (line 1 = bottom); the rows stack with column-reverse, so line 1
// sits at the bottom. Yang is one solid bar; yin is two bars with a gap. An empty slot is one
// continuous 1px outline the size of a drawn line. Changing lines are cinnabar with ○ / ×.
import { fill, ui } from "../data";

export interface FigureLine {
  yang: boolean;
  /** Coin total when known (6–9): gives the changing mark and the number on the left. */
  total?: number;
  changing?: boolean;
}

export type FigureSize = "toss" | "reading" | "header" | "card" | "trigram" | "table";

interface Props {
  lines: (FigureLine | null)[]; // null = empty slot (during a cast)
  tone?: "dark" | "paper";
  size?: FigureSize;
  /** Show each line's coin total to its left. */
  totals?: boolean;
  /** Positions (1-based) to highlight / dim (trigram step). */
  highlight?: number[];
  dim?: number[];
  /** Position that is dropping into place right now: it lands solid, then a yin line opens. */
  drawing?: number | null;
  /** Ring the changing line once as it lands (cast only). */
  glow?: boolean;
  /** Show the changing lines flipped (the second hexagram, in place). */
  flipped?: boolean;
  slots?: number;
  /** Hide from assistive tech when a text alternative sits right next to it. */
  decorative?: boolean;
  className?: string;
  figureRef?: React.Ref<HTMLDivElement>;
}

/** "Hexagram figure, bottom to top: line 1 solid; line 2 broken, changing; …" (design CLAUDE.md). */
export function describeLines(lines: (FigureLine | null)[]): string {
  const c = ui.cast;
  const parts = lines.map((l, i) => {
    const n = i + 1;
    if (!l) return fill(c.figureEmpty, { n });
    const changing = l.changing ?? (l.total === 6 || l.total === 9);
    const kind = (l.yang ? c.figureSolid : c.figureBroken) + (changing ? c.figureChanging : "");
    return fill(c.figureLine, { n, kind });
  });
  return fill(c.figureLabel, { lines: parts.join("; ") });
}

export function HexagramFigure({
  lines,
  tone = "paper",
  size = "reading",
  totals = false,
  highlight = [],
  dim = [],
  drawing = null,
  glow = false,
  flipped = false,
  slots,
  decorative = false,
  className,
  figureRef,
}: Props) {
  const count = slots ?? Math.max(lines.length, 6);
  const rows = Array.from({ length: count }, (_, i) => lines[i] ?? null);

  return (
    <div
      ref={figureRef}
      className={["hex", `hex--${tone}`, `hex--${size}`, totals && "hex--totals", className].filter(Boolean).join(" ")}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : describeLines(rows)}
    >
      {rows.map((l, i) => {
        const pos = i + 1;
        const changing = !!l && (l.changing ?? (l.total === 6 || l.total === 9));
        const yang = l ? (flipped && changing ? !l.yang : l.yang) : false;
        const isDrawing = drawing === pos;
        const cls = [
          "hex-row",
          !l && "is-empty",
          l && (yang ? "is-yang" : "is-yin"),
          changing && !flipped && "is-changing",
          isDrawing && "is-drawing",
          glow && changing && isDrawing && "is-glowing",
          highlight.includes(pos) && "is-highlight",
          dim.includes(pos) && "is-dim",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={pos} className={cls}>
            {totals && <span className="hex-total">{l?.total ?? ""}</span>}
            <span className="hex-bar">
              <span className="hex-half" />
              <span className="hex-half" />
            </span>
            <span className="hex-mark">{changing && !flipped ? (l!.yang ? "○" : "×") : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/** A trigram from its bits (bottom to top). */
export function TrigramFigure({ bits, tone = "paper", size = "trigram" }: { bits: number[]; tone?: "dark" | "paper"; size?: FigureSize }) {
  return <HexagramFigure lines={bits.map((b) => ({ yang: b === 1 }))} slots={3} tone={tone} size={size} decorative />;
}
