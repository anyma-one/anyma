// /cast: the Quick Cast toss sequence or the Deep Cast guided cast (design: screens.md §3,
// motion.md). The result is cast first; the animation only shows it.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { castHexagram, lineFromCoins } from "../lib/cast.js";
import { forcedCoins } from "../devCast";
import { copy, fill, hexagrams, lineType, ui } from "../data";
import { useRouter } from "../router";
import { linesFromCoins, useStore } from "../store";
import { track } from "../analytics";
import { rememberFigure } from "../flip";
import type { Line } from "../types";
import { TossStage } from "../components/TossStage";
import { GuidedCast } from "./GuidedCast";

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** "Line 3 of 6: Old yin (6)". Announced in a live region as each line lands. */
export const announceLine = (n: number, total: number) => `${fill(copy.cast.progress, { n })}: ${lineType(total).name} (${total})`;

/** "Skip to my reading →" in the header (design: screens.md §3). */
export function HeaderSkip({ onSkip }: { onSkip: () => void }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById("header-extra")), []);
  if (!target) return null;
  return createPortal(
    <button type="button" className="site-header__skip" onClick={onSkip}>
      {copy.cast.skip} <span aria-hidden="true">→</span>
    </button>,
    target,
  );
}

export function Cast() {
  const { flow, completeCast, castsCompleted } = useStore();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!flow.chosenLevel || !flow.question.trim()) navigate("ask", { replace: true });
  }, [flow.chosenLevel, flow.question, navigate]);
  if (!flow.chosenLevel || !flow.question.trim()) return null;

  const finish = (coins: number[][], figure: HTMLElement | null) => {
    rememberFigure(figure);
    const cast = completeCast(coins);
    track("cast_completed", { level: cast.level, changing: linesFromCoins(coins).filter((l) => l.changing).length });
    navigate("reading", { replace: true });
  };

  return (
    <div className="page page--cast">
      {flow.chosenLevel === "quick" ? (
        <QuickCast onComplete={finish} canSkip={castsCompleted > 0} />
      ) : (
        <GuidedCast onComplete={finish} />
      )}
    </div>
  );
}

type Phase = "wait" | "toss" | "land" | "count" | "draw" | "hold" | "pause";

// motion.md: per toss toss 1000+160, land 400, count 400, draw 500, hold 250; first toss 800ms
// after mount; 1400ms pause after the sixth. Reduced motion: coins appear, shorter steps.
const TIMING: Record<Phase, number> = { wait: 800, toss: 1160, land: 400, count: 400, draw: 500, hold: 250, pause: 1400 };
const TIMING_REDUCED: Record<Phase, number> = { wait: 0, toss: 220, land: 300, count: 300, draw: 120, hold: 320, pause: 700 };
const NEXT: Record<Phase, Phase> = { wait: "toss", toss: "land", land: "count", count: "draw", draw: "hold", hold: "toss", pause: "pause" };

/** Quick Cast: the result is cast first, then shown toss by toss, bottom to top. */
function QuickCast({ onComplete, canSkip }: { onComplete: (coins: number[][], figure: HTMLElement | null) => void; canSkip: boolean }) {
  // The result first. The animation only shows it (CLAUDE.md).
  const [lines] = useState<Line[]>(() =>
    forcedCoins(1) ? [1, 2, 3, 4, 5, 6].map((n) => lineFromCoins(forcedCoins(n)!) as Line) : (castHexagram() as Line[]),
  );
  const coins = lines.map((l) => l.coins!);
  const reduced = useRef(prefersReducedMotion()).current;
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("wait");
  const [announcement, setAnnouncement] = useState("");
  const figureRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const complete = () => {
    if (done.current) return;
    done.current = true;
    onComplete(coins, figureRef.current);
  };

  useEffect(() => {
    const t = (reduced ? TIMING_REDUCED : TIMING)[phase];
    const timer = setTimeout(() => {
      if (phase === "pause") return complete();
      if (phase === "count") setAnnouncement(announceLine(idx + 1, lines[idx].total));
      if (phase === "hold") {
        if (idx === 5) return setPhase("pause");
        setIdx(idx + 1);
      }
      setPhase(NEXT[phase]);
    }, t);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  const current = lines[idx];
  const drawnCount = ["draw", "hold", "pause"].includes(phase) ? idx + 1 : idx;
  const pause = phase === "pause";

  return (
    <>
      {canSkip && !pause && <HeaderSkip onSkip={complete} />}
      <TossStage
        n={idx + 1}
        coins={phase === "wait" ? null : current.coins!}
        coinState={phase === "wait" ? "idle" : phase === "toss" && !reduced ? "tossing" : "landed"}
        counted={["count", "draw", "hold", "pause"].includes(phase) ? current : null}
        drawn={lines.slice(0, drawnCount)}
        drawing={phase === "draw" ? idx + 1 : null}
        eyebrow={pause ? fill(ui.cast.eyebrowDone, { label: lines.length ? labelOf(lines) : "" }) : ui.cast.eyebrowBuilding}
        hint={!pause}
        figureRef={figureRef}
        progressOverride={
          pause ? (
            <h1 className="eyebrow reveal-eyebrow" tabIndex={-1} ref={(el) => el?.focus()}>
              {copy.cast.beforeReveal}
            </h1>
          ) : undefined
        }
      />
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}

/** "Water over Thunder", from the cast lines. */
export function labelOf(lines: Line[]): string {
  const bin = lines.map((l) => (l.yang ? 1 : 0)).join("");
  return hexagrams.find((h) => h.binary === bin)?.label ?? "";
}
