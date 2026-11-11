// Question (design: screens.md §2).
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { copy, fill, pad, ui } from "../data";
import { MAX_QUESTION_LENGTH, isYesNo } from "../lib/question.js";
import { Link, useRouter } from "../router";
import { useStore } from "../store";
import type { StoredCast } from "../types";
import { LevelTiles } from "./Landing";
import { DevCastPicker } from "../devCast";
import { GateModal } from "../components/GateModal";
import { isSignedUp } from "../signup";

export function Ask() {
  const { flow, setQuestion, findRecast, loadEntry, history, clearHistory } = useStore();
  const { navigate } = useRouter();
  const [keepAsIs, setKeepAsIs] = useState(false);
  const [recastOf, setRecastOf] = useState<StoredCast | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const recastRef = useRef<HTMLDivElement>(null);
  const [signup, setSignup] = useState(false);
  const closeSignup = useCallback(() => setSignup(false), []);
  const ids = { field: useId(), count: useId(), err: useId(), guide: useId(), yn: useId() };

  const q = flow.question;
  const tooLong = q.length > MAX_QUESTION_LENGTH;
  const showYesNo = !keepAsIs && q.trim().length > 0 && isYesNo(q);
  const canCast = !!flow.chosenLevel && q.trim().length > 0 && !tooLong;

  // Mobile shows the yes/no note as a bottom sheet; Escape dismisses it like "keep".
  useEffect(() => {
    if (!showYesNo) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setKeepAsIs(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showYesNo]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canCast) return;
    // The re-cast note never blocks, and doesn't appear for a deliberate Quick → Deep upgrade.
    const earlier = flow.isUpgrade ? null : findRecast(q);
    if (earlier && !recastOf) {
      setRecastOf(earlier);
      requestAnimationFrame(() => recastRef.current?.focus());
      return;
    }
    go();
  };

  // Deep Cast (and Full Cast, which starts with the Deep Cast guided cast) asks for the sign-up
  // first, unless this device has already signed up.
  const go = () => {
    if (flow.chosenLevel !== "quick" && !isSignedUp()) setSignup(true);
    else navigate("cast");
  };

  return (
    <div className="page page--ask">
      {!flow.chosenLevel && (
        <section className="levels" aria-labelledby="levels-h">
          <h2 id="levels-h" className="display-4">
            {ui.landing.levelsHeading}
          </h2>
          <LevelTiles />
        </section>
      )}

      <div className="ask">
        <form className="ask__main" onSubmit={onSubmit} noValidate>
          <h1 className="display-2" tabIndex={-1}>
            <label htmlFor={ids.field}>{ui.question.heading}</label>
          </h1>
          <p className="lede">{copy.question.threshold}</p>

          <div className="question-field">
            <textarea
              id={ids.field}
              ref={fieldRef}
              rows={4}
              value={q}
              placeholder={ui.question.placeholder}
              aria-describedby={`${ids.count}${tooLong ? ` ${ids.err}` : ""}${showYesNo ? ` ${ids.yn}` : ""}`}
              aria-invalid={tooLong}
              onChange={(e) => {
                setQuestion(e.target.value);
                setRecastOf(null);
              }}
            />
            <p id={ids.count} className={`counter${tooLong ? " is-over" : ""}`} aria-live="polite">
              {q.length} / {MAX_QUESTION_LENGTH}
            </p>
          </div>
          {tooLong && (
            <p id={ids.err} className="error" role="alert">
              {fill(copy.question.tooLong, { max: MAX_QUESTION_LENGTH })}
            </p>
          )}

          {showYesNo && (
            <div className="panel yes-no-sheet" id={ids.yn} role="status">
              <h2 className="panel__heading">{ui.question.yesNo.heading}</h2>
              <p>
                <strong>{ui.question.yesNo.lead}</strong> {ui.question.yesNo.body}
              </p>
              <p className="muted">{ui.question.yesNo.example}</p>
              <div className="actions">
                <button type="button" className="button button--regular" onClick={() => setKeepAsIs(true)}>
                  {ui.question.yesNo.keep} <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className="button button--regular"
                  onClick={() => {
                    setKeepAsIs(true);
                    fieldRef.current?.focus();
                    fieldRef.current?.select();
                  }}
                >
                  {ui.question.yesNo.rephrase} <span aria-hidden="true">→</span>
                </button>
                {/* Opens the Learn (resources) page (owner, 11 Nov 2026). */}
                <Link to="learn" className="button button--ghost">
                  {ui.question.yesNo.learnMore} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          )}

          {recastOf && (
            <div className="recast" ref={recastRef} tabIndex={-1} role="note">
              <p>{copy.recast.text}</p>
              <div className="actions">
                <button type="button" className="button button--important" onClick={go}>
                  {copy.recast.castAnyway} <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className="button button--regular"
                  onClick={() => {
                    loadEntry(recastOf);
                    navigate("reading");
                  }}
                >
                  {copy.recast.goBack} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}

          {!recastOf && (
            <div className="question-cta">
              <button type="submit" className="button button--important" disabled={!canCast}>
                {ui.question.begin} <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {history.length > 0 && (
            <p className="history-clear">
              <button type="button" className="text-button" onClick={clearHistory}>
                {copy.labels.clearHistory}
              </button>
            </p>
          )}
          {import.meta.env.DEV && <DevCastPicker />}
        </form>

        <aside className="guidance" aria-labelledby={ids.guide}>
          <h2 id={ids.guide} className="eyebrow">
            {ui.question.guidanceHeading}
          </h2>
          <ol>
            {copy.question.guidance.map((g, i) => (
              <li key={g}>
                <span className="guidance__n">{pad(i + 1)}</span>
                <span>{g}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {signup && (
        <GateModal
          kind="deep"
          onClose={closeSignup}
          onSignedUp={() => {
            setSignup(false);
            navigate("cast");
          }}
          onUnlocked={closeSignup}
        />
      )}
    </div>
  );
}
