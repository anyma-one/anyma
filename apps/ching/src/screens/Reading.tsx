// /reading: the current reading at the level reached, on a paper sheet with a margin column
// (design: screens.md §4). Renders buildReading()'s output; parts this level doesn't have show
// as locked dropdowns with the tier name.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { copy, fill, pad, ui } from "../data";
import { Link, useRouter } from "../router";
import { readingFor, useStore } from "../store";
import { track } from "../analytics";
import { glide, takeReveal } from "../flip";
import type { Reading as ReadingT } from "../types";
import {
  BeneficialBeware,
  CastRecord,
  Dropdown,
  figureLines,
  LineList,
  MeaningAndImage,
  NextBox,
  Paras,
  ReadingHeader,
  Redacted,
} from "../components/Reading";
import { Parts } from "../components/Text";
import { HexagramFigure } from "../components/HexagramFigure";
import { GateModal, type GateKind } from "../components/GateModal";
import { prefersReducedMotion } from "./Cast";
import { isSignedUp } from "../signup";

export function Reading() {
  const { current, flow, startUpgrade, unlockFull, revealDeep } = useStore();
  const { navigate } = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const [gate, setGate] = useState<GateKind | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [deepChoiceOnly, setDeepChoiceOnly] = useState(false);
  const autoGate = useRef(false);

  // The reveal: the sheet fades in and the hexagram glides here from the toss (motion.md).
  useLayoutEffect(() => {
    const from = takeReveal();
    // The visible figure: beside Traditional Meaning, or in the header row on tablet.
    const fig = [figureRef.current, document.querySelector<HTMLElement>(".reading-figure--header .hex")].find((el) => el && el.offsetParent !== null);
    if (!from || !fig) return;
    setRevealing(true);
    if (!prefersReducedMotion()) glide(fig, from, 1200);
    const t = setTimeout(() => setRevealing(false), 2200);
    return () => clearTimeout(t);
  }, []);

  // Focus moves to the reading (its hexagram name) when it opens.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [current?.at]);

  // Full Cast chosen up front: after the guided cast, offer the unlock straight away (once).
  useEffect(() => {
    if (!autoGate.current && current?.level === "deep" && flow.chosenLevel === "full") {
      autoGate.current = true;
      const t = setTimeout(() => setGate("full"), revealing ? 2200 : 0);
      return () => clearTimeout(t);
    }
  }, [current?.level, flow.chosenLevel, revealing]);

  const closeGate = useCallback(() => setGate(null), []);

  if (!current) {
    return (
      <div className="page">
        <p className="lede">
          <Link to="">{copy.errors.noReading}</Link>
        </p>
      </div>
    );
  }

  const r = readingFor(current);
  const level = r.level;

  // Deep Cast starts a new guided cast of the same question, with no re-cast note.
  const startDeep = () => {
    startUpgrade();
    navigate("cast");
  };
  // With changing lines, the person chooses: reveal this cast at Deep Cast, or cast again.
  // Without, Deep Cast is a new guided cast, after the sign-up if it's still needed.
  const canReveal = r.changingLines.length > 0;
  const toDeep = () => {
    track("upgrade_clicked", { to: "deep" });
    if (!canReveal && isSignedUp()) return startDeep();
    setDeepChoiceOnly(isSignedUp());
    setGate("deep");
  };
  const toFull = () => {
    track("upgrade_clicked", { to: "full" });
    setGate("full");
  };
  const toDialogue = () => navigate("make-it-yours");

  /** The cast record's changing row: open the lines dropdown, centre that line, ring it. */
  const showLine = (n: number) => {
    const el = document.getElementById(`line-${n}`);
    const details = el?.closest("details");
    if (!el) return;
    if (details && !details.open) details.open = true;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      el.focus({ preventScroll: true });
      el.animate?.([{ boxShadow: "inset 0 0 0 2px #991613" }, { boxShadow: "inset 0 0 0 2px rgba(153,22,19,0)" }], {
        duration: prefersReducedMotion() ? 1 : 1800,
        easing: "cubic-bezier(.22,.61,.36,1)",
      });
    });
  };

  return (
    <div className={`page page--reading${revealing ? " is-revealing" : ""}`}>
      <article className="sheet reading-sheet">
        <div className="reading-main">
          <ReadingHeader id={r.primary} eyebrow={fill(ui.reading.eyebrow, { number: pad(r.primary.number) })} headingRef={headingRef}>
            {/* Tablet only: the figure shares the header row (responsive.css); hidden elsewhere. */}
            <div className="reading-figure reading-figure--header">
              <HexagramFigure lines={figureLines(r)} tone="paper" size="header" totals />
            </div>
          </ReadingHeader>
          <div className="reading-rest">
            <MeaningAndImage id={r.primary} lines={figureLines(r)} judgment={r.quick.judgment} image={r.quick.image} figureRef={figureRef} />

            {level === "quick" && (
              <aside className="ember deep-note">
                <p>{ui.reading.deepNote.text}</p>
                <button type="button" className="button button--important" onClick={toDeep}>
                  {ui.reading.deepNote.button} <span aria-hidden="true">→</span>
                </button>
              </aside>
            )}

            <hr className="rule rule--bronze" />

            {level === "deep" && r.deep!.changingFraming && <p className="framing-note">{r.deep!.changingFraming}</p>}
            {level === "full" && <p className="framing-note">{r.full!.changingFraming}</p>}

            <ReadingDropdowns r={r} onFull={toFull} />
          </div>
        </div>

        <aside className="reading-margin">
          <CastRecord r={r} onLine={showLine} />
          <NextBox level={level} onNext={level === "quick" ? toDeep : level === "deep" ? toFull : toDialogue} />
        </aside>
      </article>

      <section className="final-stage" aria-labelledby="final-h">
        <h2 id="final-h" className="final-stage__heading">
          {ui.reading.final.heading}
        </h2>
        <p>{ui.reading.final.body}</p>
        <button type="button" className="button button--important button--large" onClick={level === "full" ? toDialogue : toFull}>
          {level === "full" ? (
            <>
              {ui.reading.final.button} <span aria-hidden="true">→</span>
            </>
          ) : (
            ui.landing.levelSoon
          )}
        </button>
      </section>

      {gate && (
        <GateModal
          kind={gate}
          onClose={closeGate}
          startAtChoice={gate === "deep" && deepChoiceOnly}
          onReveal={
            gate === "deep" && canReveal
              ? () => {
                  setGate(null);
                  revealDeep(); // the same cast, now read at Deep Cast
                  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
                }
              : undefined
          }
          onSignedUp={() => {
            setGate(null);
            startDeep();
          }}
          onUnlocked={() => {
            setGate(null);
            unlockFull(); // the same cast, now at Full Cast
          }}
        />
      )}
    </div>
  );
}

/** In Few Words · Modern Meaning · Reflection · the lines · Second Hexagram (Dropdown.md). */
function ReadingDropdowns({ r, onFull }: { r: ReadingT; onFull: () => void }) {
  const level = r.level;
  const quick = level === "quick";
  const full = level === "full";
  const d = r.deep;
  const n = r.changingLines.length;
  const lock = quick ? ("deep" as const) : null;

  // Line texts this level has: Deep Cast's changing lines, or Full Cast's six.
  const texts = new Map<number, string>();
  if (full) r.full!.allLines.forEach((l) => texts.set(l.line, l.text));
  else d?.changingLineTexts.forEach((l) => texts.set(l.line, l.text));
  const linesTitle = full ? ui.reading.allSixLines : n === 0 ? ui.reading.theSixLines : ui.reading.changingLines;
  const linesLock = full ? null : quick && n > 0 ? ("deep" as const) : ("full" as const);

  const second = r.full?.second;
  return (
    <div className="dropdowns">
      <Dropdown title={ui.reading.inFewWords} lockedTier={lock} defaultOpen={!quick}>
        {d ? <BeneficialBeware beneficial={d.beneficial} beware={d.beware} /> : <Redacted rows={[70, 90]} />}
      </Dropdown>

      <Dropdown title={ui.reading.modernMeaning} lockedTier={lock} defaultOpen={!quick}>
        {d ? <Paras text={d.meaning} /> : <Redacted />}
      </Dropdown>

      <Dropdown title={ui.reading.reflection} lockedTier={lock} defaultOpen={full}>
        {d ? (
          <>
            <ol className="reflections">
              {d.reflections.map((q, i) => (
                <li key={q}>
                  <span className="reflections__n">{pad(i + 1)}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
            <p className="note">{copy.tier2.selfReadingNote}</p>
          </>
        ) : (
          <Redacted rows={[80, 64, 72]} />
        )}
      </Dropdown>

      <Dropdown title={linesTitle} lockedTier={linesLock} defaultOpen={full} id="lines">
        <LineList r={r} texts={texts} />
        {d?.allChangingText && <p className="text all-changing">{d.allChangingText}</p>}
      </Dropdown>

      {n > 0 && (
        <Dropdown title={ui.reading.secondHexagram} lockedTier={full ? null : quick ? "deep" : "full"} defaultOpen={full}>
          {second ? (
            <div className="second">
              <SecondHeader r={r} />
            </div>
          ) : d?.secondTeaser ? (
            <>
              <p className="text">
                <Parts parts={d.secondTeaser.parts} />
              </p>
              <Redacted />
              <button type="button" className="button button--important" onClick={onFull}>
                {ui.landing.levelSoon}
              </button>
            </>
          ) : (
            <Redacted />
          )}
        </Dropdown>
      )}
    </div>
  );
}

function SecondHeader({ r }: { r: ReadingT }) {
  const s = r.full!.second!;
  return (
    <>
      <ReadingHeader id={s} eyebrow={fill(ui.reading.secondEyebrow, { number: pad(s.number) })} as="h3" />
      <MeaningAndImage id={s} lines={s.lines.map((b) => ({ yang: b === 1 }))} judgment={s.judgment} image={s.image} level={4} />
      <h4 className="section-title">{ui.reading.modernMeaning}</h4>
      <Paras text={s.meaning} />
    </>
  );
}
