// Building blocks for the reading sheet (design: screens.md §4, components/*.md). They render
// what buildReading() returns; they don't decide what a level may show. Where a part is absent
// from the reading at this level, a locked placeholder shows the tier name and redacted bars,
// never the real text.
import { useId, type ReactNode } from "react";
import { copy, countWord, fill, levelName, pad, paragraphs, ui, type Level, type Trigram } from "../data";
import type { Identity as IdentityT, Reading } from "../types";
import { Seal } from "./Seal";
import { PinyinChar, Zh } from "./Text";
import { HexagramFigure, TrigramFigure, type FigureLine } from "./HexagramFigure";

export const figureLines = (r: Reading): FigureLine[] =>
  r.tosses.map((t) => ({ yang: t.total === 7 || t.total === 9, total: t.total, changing: t.changing }));

/** Long texts follow the paragraph rule. */
export function Paras({ text, className = "text" }: { text: string; className?: string }) {
  return (
    <>
      {paragraphs(text).map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  );
}

export function Wilhelm({ id, where }: { id: IdentityT; where?: "header" | "section" }) {
  return <p className={`wilhelm${where ? ` wilhelm--in-${where}` : ""}`}>{fill(ui.reading.wilhelm, { wilhelm: id.wilhelm })}</p>;
}

/** Seal · "Your hexagram · 03" · name · "Zhūn 屯 – Beginning" · Wilhelm. */
export function ReadingHeader({ id, eyebrow, as: H = "h1", headingRef, children }: { id: IdentityT; eyebrow: string; as?: "h1" | "h3"; headingRef?: React.Ref<HTMLHeadingElement>; children?: ReactNode }) {
  return (
    <header className="reading-top">
      <Seal number={id.number} shape={id.seal.shape} label={fill(ui.reading.sealLabel, { name: id.name })} />
      <div className="reading-top__text">
        <span className={`eyebrow ${H === "h1" ? "eyebrow--ink" : "eyebrow--paper"}`}>{eyebrow}</span>
        <H className="reading-top__name" tabIndex={-1} ref={headingRef}>
          {id.name}
        </H>
        <p className="reading-top__pinyin">
          <PinyinChar pinyin={id.pinyin} chinese={id.chinese} /> – {id.name}
        </p>
        <Wilhelm id={id} where="header" />
      </div>
      {children}
    </header>
  );
}

function TrigramItem({ t, label }: { t: Trigram; label: string }) {
  return (
    <li className="trigram-item">
      <TrigramFigure bits={t.bits} />
      <span className="trigram-item__text">
        <span className="eyebrow eyebrow--muted">{label}</span>
        <span className="trigram-item__name">{t.english}</span>
        <span className="trigram-item__py">
          <PinyinChar pinyin={t.pinyin} chinese={t.chinese} />
        </span>
      </span>
    </li>
  );
}

export function TrigramPair({ upper, lower }: { upper: Trigram; lower: Trigram }) {
  return (
    <ul className="trigram-pair">
      <TrigramItem t={upper} label={ui.reading.upperTrigram} />
      <TrigramItem t={lower} label={ui.reading.lowerTrigram} />
    </ul>
  );
}

/** Figure beside Traditional Meaning, then Image beside the trigram pair. */
export function MeaningAndImage({
  id,
  lines,
  judgment,
  image,
  figureRef,
  level = 2,
}: {
  id: IdentityT;
  lines: FigureLine[];
  judgment: string;
  image: string;
  figureRef?: React.Ref<HTMLDivElement>;
  level?: 2 | 4;
}) {
  const H = level === 2 ? "h2" : "h4";
  return (
    <>
      <div className="reading-pair">
        <div className="reading-figure">
          <HexagramFigure figureRef={figureRef} lines={lines} tone="paper" size="reading" totals={lines.some((l) => l.total)} />
        </div>
        <section className="reading-pair__text">
          <H className="section-title">{ui.reading.traditionalMeaning}</H>
          <Wilhelm id={id} where="section" />
          <Paras text={judgment} />
        </section>
      </div>
      <hr className="rule" />
      <div className="reading-pair reading-pair--reverse">
        <section className="reading-pair__text">
          <H className="section-title">{ui.reading.image}</H>
          <Paras text={image} />
        </section>
        <TrigramPair upper={id.trigrams.upper} lower={id.trigrams.lower} />
      </div>
    </>
  );
}

/** Locked content: redacted bars only. The real text is never in this view. */
export function Redacted({ rows = [92, 100, 86, 97, 64] }: { rows?: number[] }) {
  return (
    <div className="redacted" aria-hidden="true">
      {rows.map((w, i) => (
        <span key={i} className="redacted__bar" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

export function Padlock() {
  return (
    <svg className="padlock" viewBox="0 0 12 14" width="10" height="12" aria-hidden="true" focusable="false">
      <rect x="1.5" y="6" width="9" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** A collapsible reading section on <details>, so it works without script (Dropdown.md). */
export function Dropdown({
  title,
  lockedTier,
  defaultOpen = false,
  id,
  children,
}: {
  title: string;
  lockedTier?: Level | null;
  defaultOpen?: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <details className={`dropdown${lockedTier ? " is-locked" : ""}`} open={defaultOpen} id={id}>
      <summary>
        <span className="dropdown__title">{title}</span>
        {lockedTier && (
          <span className="lock-tag">
            <Padlock />
            {levelName(lockedTier)}
          </span>
        )}
        <span className="dropdown__chevron" aria-hidden="true" />
      </summary>
      <div className="dropdown__body">{children}</div>
    </details>
  );
}

export function BeneficialBeware({ beneficial, beware }: { beneficial: string; beware: string }) {
  return (
    <dl className="few-words">
      <div>
        <dt className="eyebrow eyebrow--paper">{copy.labels.beneficial}</dt>
        <dd>{beneficial}</dd>
      </div>
      <div>
        <dt className="eyebrow eyebrow--paper">{copy.labels.beware}</dt>
        <dd>{beware}</dd>
      </div>
    </dl>
  );
}

/** The six lines, bottom to top: "Line n · position"; text where this level has it, locked bars where it doesn't. */
export function LineList({ r, texts }: { r: Reading; texts: Map<number, string> }) {
  return (
    <div className="line-list">
      <span className="eyebrow eyebrow--muted">{ui.reading.bottomToTop}</span>
      <ol>
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const changing = r.changingLines.includes(n);
          const text = texts.get(n);
          const tier: Level = r.level === "quick" && changing ? "deep" : "full";
          const total = r.tosses[n - 1].total;
          return (
            <li key={n} id={`line-${n}`} className={`line-item${changing ? " is-changing" : ""}${text ? "" : " is-locked"}`} tabIndex={-1}>
              <div className="line-item__label">
                <span className="line-item__n">
                  {fill(ui.reading.lineHeading, { n })}
                  {changing && <span aria-hidden="true"> {total === 9 ? "○" : "×"}</span>}
                </span>
                <span className="line-item__pos">{ui.reading.linePositions[n - 1]}</span>
                {changing && <span className="line-item__pos line-item__changing">{ui.reading.changingTag}</span>}
              </div>
              {text ? (
                <p className="text">{text}</p>
              ) : (
                <div className="line-item__locked" role="img" aria-label={fill(ui.reading.lockedLine, { n, tier: levelName(tier) })}>
                  <Redacted rows={[96, 88, 54]} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** "Your cast · one changing line": the six tosses, top line first (CastRecord.md). */
export function CastRecord({ r, onLine }: { r: Reading; onLine: (n: number) => void }) {
  const n = r.changingLines.length;
  const count = n === 0 ? ui.reading.record.counts.zero : n === 1 ? ui.reading.record.counts.one : fill(ui.reading.record.counts.several, { count: countWord(n) });
  const hid = useId();
  return (
    <section className="cast-record" aria-labelledby={hid}>
      <h2 id={hid} className="eyebrow eyebrow--ink cast-record__eyebrow">
        {fill(ui.reading.record.eyebrow, { count })}
      </h2>
      <ol>
        {r.tosses
          .slice()
          .reverse()
          .map((t) => {
            const row = (
              <>
                <span className="cast-record__line">{fill(ui.reading.record.line, { n: t.line })}</span>
                <span className="cast-record__coins">{t.coins.join(" ")}</span>
                <span className="cast-record__total">{t.total}</span>
                <span className="cast-record__type">
                  {copy.lineTypes[String(t.total) as "6" | "7" | "8" | "9"].name}
                  {t.changing && <span aria-hidden="true"> {t.total === 9 ? "○" : "×"}</span>}
                </span>
              </>
            );
            return (
              <li key={t.line}>
                {t.changing ? (
                  <button type="button" className="cast-record__row is-changing" onClick={() => onLine(t.line)}>
                    {row}
                  </button>
                ) : (
                  <div className="cast-record__row">{row}</div>
                )}
              </li>
            );
          })}
      </ol>
    </section>
  );
}

/** "Next · Deep Cast" / "Next · Full Cast"; on Full Cast, "Make It Yours" (NextBox.md). */
export function NextBox({ level, onNext }: { level: Level; onNext: () => void }) {
  if (level === "full") {
    const b = ui.reading.fullBox;
    return (
      <section className="ember next-box">
        <span className="eyebrow">{b.eyebrow}</span>
        <h2 className="next-box__heading">{b.heading}</h2>
        <button type="button" className="button button--important" onClick={onNext}>
          {b.button} <span className="numeral">{b.numeral}</span> <span aria-hidden="true">→</span>
        </button>
      </section>
    );
  }
  const next = level === "quick" ? 1 : 2;
  return (
    <section className="ember next-box">
      <span className="eyebrow">{fill(ui.reading.next.eyebrow, { level: copy.levels[next].name })}</span>
      <h2 className="next-box__heading">{level === "deep" ? ui.reading.next.full.heading : copy.levels[next].description}</h2>
      {level === "deep" && <p className="next-box__body">{ui.reading.next.full.body}</p>}
      <button type="button" className="button button--important" onClick={onNext}>
        {/* Full Cast is closed for now: its button says "coming soon" and opens the sign-up. */}
        {level === "quick" ? (
          <>
            {ui.reading.next.buttons.deep} <span aria-hidden="true">→</span>
          </>
        ) : (
          ui.landing.levelSoon
        )}
      </button>
    </section>
  );
}

export { Zh, pad };
