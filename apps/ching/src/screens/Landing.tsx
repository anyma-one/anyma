// Landing (design: screens.md §1, LevelTile.md).
import { useCallback, useEffect, useRef, useState } from "react";
import { copy, ui, type Level } from "../data";
import { Link, useRouter } from "../router";
import { useStore } from "../store";
import { track } from "../analytics";
import { Zh } from "../components/Text";
import { GateModal, type GateKind } from "../components/GateModal";
import { isSignedUp } from "../signup";
import centreSeal from "../assets/home-centre-seal.svg";

const LEVELS: Level[] = ["quick", "deep", "full"];

/** The eight trigrams around a centre, in bronze (from the design prototype). Bits are drawn
 *  from the inside out; each group is rotated into place. */
const RING: [number[], number][] = [
  [[1, 1, 1], 0],
  [[0, 1, 1], 45],
  [[0, 1, 0], 90],
  [[0, 0, 1], 135],
  [[0, 0, 0], 180],
  [[1, 0, 0], 225],
  [[1, 0, 1], 270],
  [[1, 1, 0], 315],
];

function Bagua() {
  return (
    <div className="bagua" aria-hidden="true">
      <svg className="bagua__ring" viewBox="-170 -170 340 340" focusable="false">
        <g className="bagua__trigrams" fill="currentColor">
          {RING.map(([bits, deg]) => (
            <g key={deg} transform={`rotate(${deg})`}>
              {bits.map((b, i) => {
                const y = -113 - i * 17;
                return b ? (
                  <rect key={i} x={-37} y={y} width={74} height={9} rx={1} />
                ) : (
                  <g key={i}>
                    <rect x={-37} y={y} width={31} height={9} rx={1} />
                    <rect x={6} y={y} width={31} height={9} rx={1} />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
        {/* The centre seal (屯) stays still while the ring turns in, as in the prototype. */}
        <g transform="scale(0.7)">
          <image href={centreSeal} x={-86} y={-86} width={172} height={172} preserveAspectRatio="xMidYMid meet" />
        </g>
      </svg>
    </div>
  );
}

/** Touch: the tile nearest 55% of the viewport height (inside 18%–90%) takes the hover state. */
function useRedOnScroll(list: React.RefObject<HTMLUListElement>) {
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px), (hover: none)");
    let raf = 0;
    const update = () => {
      raf = 0;
      const tiles = Array.from(list.current?.querySelectorAll<HTMLElement>(".level-tile") ?? []);
      if (!mq.matches) {
        tiles.forEach((t) => t.classList.remove("is-active"));
        return;
      }
      const vh = window.innerHeight;
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const t of tiles) {
        const r = t.getBoundingClientRect();
        const c = r.top + r.height / 2;
        if (c < vh * 0.18 || c > vh * 0.9) continue;
        const d = Math.abs(c - vh * 0.55);
        if (d < bestD) {
          bestD = d;
          best = t;
        }
      }
      tiles.forEach((t) => t.classList.toggle("is-active", t === best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onScroll);
    };
  }, [list]);
}

/**
 * The three levels. Quick Cast goes straight to the question. Deep Cast asks for the sign-up
 * first (unless this device has signed up), then goes to the question. Full Cast is closed for
 * now: its tile says "coming soon" and opens the Full Cast sign-up.
 */
export function LevelTiles() {
  const { chooseLevel } = useStore();
  const { navigate } = useRouter();
  const list = useRef<HTMLUListElement>(null);
  const [gate, setGate] = useState<GateKind | null>(null);
  const closeGate = useCallback(() => setGate(null), []);
  useRedOnScroll(list);

  const choose = (level: Level) => {
    chooseLevel(level);
    track("level_chosen", { level });
  };

  return (
    <>
      <ul className="level-tiles" ref={list}>
        {copy.levels.map((l, i) => {
          const level = LEVELS[i];
          const body = (
            <>
              <span className="level-tile__wash" aria-hidden="true" />
              <span className="eyebrow level-tile__eyebrow">{ui.landing.levelEyebrows[i]}</span>
              <span className="level-tile__name">{l.name}</span>
              <span className="level-tile__desc">{l.description}</span>
            </>
          );
          if (level === "full") {
            return (
              <li key={l.name}>
                <button
                  type="button"
                  className="level-tile level-tile--soon"
                  onClick={() => {
                    track("level_chosen", { level });
                    setGate("full");
                  }}
                >
                  {body}
                  <span className="level-tile__price">
                    <span className="level-tile__price-rest">{ui.landing.levelSoon}</span>
                  </span>
                </button>
              </li>
            );
          }
          return (
            <li key={l.name}>
              <Link
                to="ask"
                className="level-tile"
                onNavigate={() => {
                  choose(level);
                  if (level === "deep" && !isSignedUp()) {
                    setGate("deep");
                    return false;
                  }
                }}
              >
                {body}
                <span className="level-tile__price" aria-hidden="true">
                  <span className="level-tile__price-rest">{ui.landing.levelPrices[i]}</span>
                  <span className="level-tile__price-hover">
                    {ui.landing.levelHover} <span aria-hidden="true">→</span>
                  </span>
                </span>
                <span className="visually-hidden">, {ui.landing.levelPrices[i]}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {gate && (
        <GateModal
          kind={gate}
          devUnlock={false}
          onClose={closeGate}
          onSignedUp={() => {
            setGate(null);
            navigate("ask");
          }}
          onUnlocked={closeGate}
        />
      )}
    </>
  );
}

/** "Yìjīng 易經" in the What-is sheet gets its hanzi tagged. */
function WhatBody() {
  const [before, after] = ui.landing.what.body.split("易經");
  return (
    <p className="what__body">
      {before}
      <Zh>易經</Zh>
      {after}
    </p>
  );
}

export function Landing() {
  return (
    <div className="page page--landing">
      <section className="hero">
        <div className="hero__text">
          <h1 className="display-1" tabIndex={-1}>
            {ui.landing.headline}
          </h1>
          <p className="lede">{copy.landing.subhead}</p>
        </div>
        <Bagua />
      </section>

      <section className="levels" aria-labelledby="levels-h">
        <h2 id="levels-h" className="display-4">
          {ui.landing.levelsHeading}
        </h2>
        <LevelTiles />
      </section>

      <section className="sheet what" aria-labelledby="what-h">
        <div className="what__head">
          <span className="eyebrow eyebrow--paper">{ui.landing.what.eyebrow}</span>
          <h2 id="what-h" className="what__heading">
            {ui.landing.what.heading}
          </h2>
        </div>
        <div className="what__text">
          <WhatBody />
          <Link to="learn" className="button button--regular">
            {ui.landing.what.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
