// The coin toss with its running count, beside the building hexagram (design: TossStage.md).
// Desktop: coins and count left, hexagram right. Tablet and mobile: coins left with the count
// right behind a fixed rule, hexagram below. The count area has a fixed height, so nothing moves
// as the count changes.
import type { ReactNode, Ref } from "react";
import { copy, fill, lineType, ui } from "../data";
import type { Line } from "../types";
import { Coins, type CoinState } from "./Coins";
import { HexagramFigure, type FigureLine } from "./HexagramFigure";

export const toFigure = (lines: Line[]): FigureLine[] => lines.map((l) => ({ yang: l.yang, total: l.total, changing: l.changing }));

/** The total, the sum, the line's name and how it's drawn. */
export function Count({ line }: { line: Line | null }) {
  if (!line) return <div className="toss-count" aria-hidden="true" />;
  const lt = lineType(line.total);
  return (
    <div className="toss-count is-shown" aria-hidden="true">
      <p className="toss-count__row">
        <span className="toss-count__total">{line.total}</span>
        <span className="toss-count__sum">
          {line.coins!.join(" + ")} = {line.total}
        </span>
      </p>
      <p className="toss-count__name">{lt.name}</p>
      <p className="toss-count__desc">{lt.draw}</p>
      {line.changing && (
        <p className="toss-count__changing">
          {line.yang ? "○" : "×"} {copy.cast.changingMark}
        </p>
      )}
    </div>
  );
}

interface Props {
  /** 1-based number of the toss shown. */
  n: number;
  coins: number[] | null;
  coinState: CoinState;
  /** The line whose count is shown, or null while it's hidden. */
  counted: Line | null;
  /** Lines drawn so far (bottom first). */
  drawn: Line[];
  drawing: number | null;
  eyebrow: string;
  /** Hide the bottom-up hint once the figure is complete. */
  hint?: boolean;
  figureRef?: Ref<HTMLDivElement>;
  /** Guided-cast controls under the count. */
  children?: ReactNode;
  /** A heading in place of the progress row (e.g. the pause before the reveal). */
  progressOverride?: ReactNode;
  /** Hide the coins and count (the pause before the reveal). */
  compact?: boolean;
  /** Trigram step: light up the lower or upper three lines. */
  highlight?: "lower" | "upper" | null;
}

export function TossStage({ n, coins, coinState, counted, drawn, drawing, eyebrow, hint = true, figureRef, children, progressOverride, compact, highlight }: Props) {
  const lower = [1, 2, 3];
  const upper = [4, 5, 6];
  return (
    <div className={`toss${compact ? " toss--compact" : ""}`}>
      <div className="toss-stage">
        <div className="toss-progress" aria-hidden={progressOverride ? undefined : true}>
          {progressOverride ?? (
            <>
              <span className="eyebrow">{fill(copy.cast.progress, { n })}</span>
              <span className="toss-progress__legend">{ui.cast.legend}</span>
            </>
          )}
        </div>
        {!compact && <Coins faces={coins} state={coinState} toss={n - 1} />}
        {/* Quick Cast keeps the count's space so nothing moves; the guided cast shows it once answered. */}
        {!compact && (counted || !children) && <Count line={counted} />}
        {children && <div className="toss-controls">{children}</div>}
      </div>

      <div className="toss-figure">
        <p className="eyebrow">{eyebrow}</p>
        <HexagramFigure
          figureRef={figureRef}
          lines={toFigure(drawn)}
          slots={6}
          tone="dark"
          size="toss"
          totals
          drawing={drawing}
          glow
          highlight={highlight === "lower" ? lower : highlight === "upper" ? upper : []}
          dim={highlight === "lower" ? upper : highlight === "upper" ? lower : []}
        />
        {hint && <p className="toss-figure__hint">{copy.cast.buildNote}</p>}
      </div>
    </div>
  );
}
