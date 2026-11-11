// Deep Cast: the guided cast (design: screens.md §3 "Deep Cast variant"; HANDOFF §6). The person
// tosses, reads the coins and names the total; help fades over the six tosses. Then they find the
// lower and upper trigram. Every step is a button: no touch or shaking needed.
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { castLine, lineFromCoins, LINE_TYPES } from "../lib/cast.js";
import { forcedCoins } from "../devCast";
import { copy, fill, hexagrams, lineType, trigrams, ui } from "../data";
import { track } from "../analytics";
import type { Line } from "../types";
import { HexagramFigure, TrigramFigure } from "../components/HexagramFigure";
import { TossStage } from "../components/TossStage";
import { PinyinChar } from "../components/Text";
import { announceLine, HeaderSkip, labelOf, prefersReducedMotion } from "./Cast";

type Help = "full" | "onRequest" | "none";
const helpFor = (toss: number): Help => (toss === 1 ? "full" : toss <= 3 ? "onRequest" : "none");

/** The line-type table (coins, totals, drawings, odds). */
export function LineTypeTable() {
  return (
    <div className="line-types">
      <p>{copy.lineTypes.intro}</p>
      <div className="table-wrap" tabIndex={0}>
        <table>
          <tbody>
            {([6, 7, 8, 9] as const).map((t) => {
              const lt = lineType(t);
              return (
                <tr key={t}>
                  <th scope="row">{t}</th>
                  <td>
                    <HexagramFigure lines={[{ yang: t === 7 || t === 9, total: t }]} slots={1} tone="dark" size="table" decorative />
                  </td>
                  <td>
                    <strong>{lt.name}</strong>
                    <br />
                    <span className="muted">{lt.coins}</span>
                  </td>
                  <td>{lt.draw}</td>
                  <td className="nowrap">{lt.odds}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted">{copy.lineTypes.whyUneven}</p>
      <p className="muted">{copy.lineTypes.convention}</p>
    </div>
  );
}

interface Answer {
  given: number;
  correct: boolean;
}

type Stage = "tossing" | "pause";

export function GuidedCast({ onComplete }: { onComplete: (coins: number[][], figure: HTMLElement | null) => void }) {
  const reduced = useRef(prefersReducedMotion()).current;
  const [lines, setLines] = useState<Line[]>([]);
  const [current, setCurrent] = useState<Line | null>(null);
  const [landed, setLanded] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [firstChangingAt, setFirstChangingAt] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("tossing");
  const [announcement, setAnnouncement] = useState("");
  const [drawing, setDrawing] = useState<number | null>(null);
  const [findHighlight, setFindHighlight] = useState<Highlight>(null);
  // The total is typed, and asked again until it's right (owner, 11 Nov 2026).
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(0);
  const totalId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusRef = useRef<HTMLElement | null>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const toss = lines.length + (current ? 1 : 0); // 1-based number of the toss in progress
  const nextToss = lines.length + 1;
  const help = helpFor(current ? toss : nextToss);

  const setFocus = (el: HTMLElement | null) => {
    focusRef.current = el;
  };
  // Move focus to the newest prompt after each step.
  useEffect(() => {
    focusRef.current?.focus({ preventScroll: true });
  }, [landed, answer, stage]);

  const complete = (all: Line[]) => {
    if (done.current) return;
    done.current = true;
    onComplete(
      all.map((l) => l.coins!),
      figureRef.current,
    );
  };

  /** Toss for line n (passed in: the line list may not have updated yet). */
  const doToss = (n: number) => {
    // The result first, on the person's action; the coins then show it.
    const forced = forcedCoins(n);
    const line = (forced ? lineFromCoins(forced) : castLine()) as Line;
    setCurrent(line);
    setAnswer(null);
    setHintOpen(false);
    setTyped("");
    setWrong(0);
    setLanded(reduced);
    if (!reduced) setTimeout(() => setLanded(true), 1160);
  };

  const checkTyped = (e: FormEvent) => {
    e.preventDefault();
    if (!current || answer) return;
    const given = Number(typed.trim());
    if (!typed.trim()) return;
    if (given !== current.total) {
      track("guided_answer", { correct: false, toss });
      setWrong((w) => w + 1);
      setTyped("");
      inputRef.current?.focus();
      return;
    }
    track("guided_answer", { correct: true, toss });
    doAnswer(given);
  };

  /** Called once the right total is in. */
  const doAnswer = (given: number) => {
    if (!current || answer) return;
    const correct = given === current.total;
    setAnswer({ given, correct });
    setAnnouncement(announceLine(toss, current.total));
    if (current.changing && firstChangingAt === null) setFirstChangingAt(toss);
    // The line drops into place; a yin line opens once it has landed.
    setDrawing(toss);
    setTimeout(() => setDrawing(null), reduced ? 120 : 520);
  };

  const commitLine = () => {
    if (!current) return [...lines];
    const all = [...lines, current];
    setLines(all);
    setCurrent(null);
    setAnswer(null);
    setLanded(false);
    return all;
  };

  const toPause = (all: Line[]) => {
    setStage("pause");
    setTimeout(() => complete(all), reduced ? 700 : 1400);
  };

  const all = answer && current ? [...lines, current] : lines;
  const countedLine = answer && current ? current : null;
  const finding = toss === 6 && !!answer;

  if (stage === "pause") {
    return (
      <>
        <TossStage
          n={6}
          coins={null}
          coinState="idle"
          counted={null}
          drawn={lines}
          drawing={null}
          eyebrow={fill(ui.cast.eyebrowDone, { label: labelOf(lines) })}
          hint={false}
          figureRef={figureRef}
          compact
          progressOverride={
            <h1 className="eyebrow reveal-eyebrow" tabIndex={-1} ref={setFocus}>
              {copy.cast.beforeReveal}
            </h1>
          }
        />
      </>
    );
  }

  return (
    <>
      {finding && (
        <HeaderSkip
          onSkip={() => {
            toPause(commitLine());
          }}
        />
      )}
      <TossStage
        n={current ? toss : nextToss}
        coins={current?.coins ?? null}
        coinState={current ? (landed ? "landed" : "tossing") : "idle"}
        counted={countedLine}
        drawn={all}
        drawing={drawing}
        eyebrow={ui.cast.eyebrowBuilding}
        figureRef={figureRef}
        highlight={finding ? findHighlight : null}
        compact={finding}
        progressOverride={finding ? <span className="eyebrow">{copy.guide.complete}</span> : undefined}
      >
        {lines.length === 0 && !current && <p className="lede">{copy.guide.intro}</p>}

        {!current && (
          <button type="button" className="button button--important" onClick={() => doToss(nextToss)} ref={setFocus}>
            {lines.length === 0 ? copy.guide.toss : fill(copy.guide.tossAgain, { n: nextToss })} <span aria-hidden="true">→</span>
          </button>
        )}

        {current && landed && !answer && (
          <form className="ask-total" onSubmit={checkTyped} noValidate>
            <label htmlFor={totalId} className="ask-total__q">
              {copy.guide.askTotal}
            </label>
            <div className="ask-total__row">
              <input
                id={totalId}
                ref={(el) => {
                  inputRef.current = el;
                  setFocus(el);
                }}
                className="ask-total__input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                autoComplete="off"
                value={typed}
                onChange={(e) => setTyped(e.target.value.replace(/\D/g, ""))}
                aria-invalid={wrong > 0 && !typed}
                aria-describedby={wrong > 0 ? `${totalId}-retry` : undefined}
              />
              <button type="submit" className="button button--important" disabled={!typed}>
                {ui.cast.typedTotal.check} <span aria-hidden="true">→</span>
              </button>
            </div>
            {wrong > 0 && (
              <p className="ask-total__retry" id={`${totalId}-retry`} role="alert" key={wrong}>
                {ui.cast.typedTotal.retry}
              </p>
            )}
            {help === "full" && (
              <div className="hint">
                <p>
                  <strong>{copy.guide.firstHint}</strong>
                </p>
                <LineTypeTable />
              </div>
            )}
            {help === "onRequest" &&
              (hintOpen ? (
                <div className="hint">
                  <p>
                    <strong>{copy.guide.firstHint}</strong>
                  </p>
                  <LineTypeTable />
                </div>
              ) : (
                <button type="button" className="button button--ghost" onClick={() => setHintOpen(true)}>
                  {copy.guide.hintButton} <span aria-hidden="true">→</span>
                </button>
              ))}
          </form>
        )}

        {current && answer && (
          <div className="feedback" ref={toss < 6 ? setFocus : undefined} tabIndex={-1}>
            <p className={answer.correct ? "is-correct" : "is-incorrect"}>
              {answer.correct ? copy.guide.correct : fill(copy.guide.incorrect, { total: current.total })}
            </p>
            <p>
              {fill(copy.guide.lineIs, {
                total: current.total,
                type: LINE_TYPES[current.total as 6 | 7 | 8 | 9].name.toLowerCase(),
              })}
            </p>
            {firstChangingAt === toss && (
              <p className="feedback__changing">
                <span aria-hidden="true">{current.yang ? "○" : "×"}</span> {copy.guide.firstChanging}
              </p>
            )}
            {toss < 6 && (
              <button
                type="button"
                className="button button--important"
                onClick={() => {
                  commitLine();
                  doToss(lines.length + 2);
                }}
              >
                {fill(copy.guide.tossAgain, { n: lines.length + 2 })} <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        )}

        {finding && (
          <>
            <p className="find__intro">{copy.guide.findIntro}</p>
            <TrigramStep lines={all} onDone={() => toPause(commitLine())} setHighlight={setFindHighlight} />
          </>
        )}
      </TossStage>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}

/**
 * After toss 6: find the two trigrams. findLower (a wrong choice shows the right one and moves
 * on) → findUpper → found → the reveal.
 */
function TrigramStep({ lines, onDone, setHighlight }: { lines: Line[]; onDone: () => void; setHighlight: (h: Highlight) => void }) {
  const bits = lines.map((l) => (l.yang ? 1 : 0));
  const lowerT = trigrams.find((t) => t.bits.join("") === bits.slice(0, 3).join(""))!;
  const upperT = trigrams.find((t) => t.bits.join("") === bits.slice(3).join(""))!;
  const number = hexagrams.find((h) => h.binary === bits.join(""))!.number;
  const [lower, setLower] = useState<string | null>(null);
  const [upper, setUpper] = useState<string | null>(null);
  const focusRef = useRef<HTMLElement | null>(null);
  const setFocus = (el: HTMLElement | null) => {
    focusRef.current = el;
  };

  const step: "lower" | "upper" | "found" = lower === null ? "lower" : upper === null ? "upper" : "found";
  useEffect(() => {
    focusRef.current?.focus({ preventScroll: true });
    setHighlight(step === "lower" ? "lower" : step === "upper" ? "upper" : null);
  }, [step, setHighlight]);

  const correct = step === "lower" ? lowerT.key : upperT.key;
  const choose = (k: string) => {
    track("guided_answer", { correct: k === correct, toss: step === "lower" ? 7 : 8 });
    if (step === "lower") setLower(k);
    else setUpper(k);
  };

  const result = (t: (typeof trigrams)[number], chosen: string | null) =>
    chosen === null ? null : (
      <p className={chosen === t.key ? "is-correct" : "is-incorrect"}>
        {chosen === t.key ? `${copy.guide.correct} ` : null}
        {t.symbol} {t.english} (<PinyinChar pinyin={t.pinyin} chinese={t.chinese} />)
      </p>
    );

  if (step === "found") {
    return (
      <div className="feedback" ref={setFocus} tabIndex={-1}>
        {result(upperT, upper)}
        <p className="found">
          {upperT.symbol} {upperT.english} over {lowerT.symbol} {lowerT.english}
        </p>
        <p className="found">{fill(copy.guide.found, { number })}</p>
        <button type="button" className="button button--important" onClick={onDone}>
          {copy.cast.beforeReveal} <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <fieldset className="find">
      <legend ref={setFocus} tabIndex={-1} className="find__legend">
        <span className="eyebrow">{step === "lower" ? ui.cast.findLowerEyebrow : ui.cast.findUpperEyebrow}</span>
        <span className="ask-total__q">{step === "lower" ? copy.guide.findLower : copy.guide.findUpper}</span>
      </legend>
      {step === "upper" && result(lowerT, lower)}
      <ul className="trigram-choices">
        {trigrams.map((t) => (
          <li key={t.key}>
            <button type="button" className="choice trigram-choice" onClick={() => choose(t.key)}>
              <TrigramFigure bits={t.bits} tone="dark" size="trigram" />
              <span className="trigram-choice__text">
                <span className="trigram-choice__name">
                  <span aria-hidden="true">{t.symbol}</span> {t.english}
                </span>
                <span className="trigram-choice__py">
                  <PinyinChar pinyin={t.pinyin} chinese={t.chinese} />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="button button--ghost" onClick={onDone}>
        {copy.guide.findSkip} <span aria-hidden="true">→</span>
      </button>
    </fieldset>
  );
}

export type Highlight = "lower" | "upper" | null;
