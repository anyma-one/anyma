// Three cast-bronze coins (design: CoinTriad.md, motion.md). Faces show the result that was
// already cast; the toss only turns whole rotations, so each coin lands on its cast face with no
// settle. Heads counts 3; tails counts 2.
import headsUrl from "../assets/coins/heads.svg";
import tailsUrl from "../assets/coins/tails.svg";
import { ui } from "../data";

export type CoinState = "idle" | "tossing" | "landed";

// Motion spec: coin k of toss i uses arc variant (i*2 + k*5 + 1) % 3 and a take-off delay.
const ORD = [
  [1, 0, 2],
  [2, 0, 1],
  [0, 2, 1],
  [1, 2, 0],
  [2, 1, 0],
  [0, 1, 2],
];
export const coinVariant = (i: number, k: number) => (i * 2 + k * 5 + 1) % 3;
export const coinDelay = (i: number, k: number) => ORD[i % 6][k] * 35 + ((i * 5 + k * 3) % 4) * 8;

function Coin({ face, state, toss, k }: { face: number | null; state: CoinState; toss: number; k: number }) {
  const c = ui.cast;
  if (face === null || state === "idle") {
    return (
      <div className="coin-slot">
        <span className="coin coin--empty" role="img" aria-label={c.coinIdleAria}>
          <span className="coin__hole" />
        </span>
        <span className="coin__label" aria-hidden="true" />
      </div>
    );
  }
  const heads = face === 3;
  const front = heads ? headsUrl : tailsUrl;
  const back = heads ? tailsUrl : headsUrl;
  const v = coinVariant(toss, k);
  const delay = coinDelay(toss, k);
  const tossing = state === "tossing";
  return (
    <div className="coin-slot" style={{ ["--coin-delay" as string]: `${delay}ms` }}>
      <span
        // A new key per toss restarts the animation.
        key={toss}
        className={`coin coin--h${v}${tossing ? " is-tossing" : ""}`}
        role="img"
        aria-label={tossing ? c.coinTossingAria : heads ? c.coinHeadsAria : c.coinTailsAria}
      >
        <img className="coin__face" src={front} alt="" draggable={false} />
        <img className="coin__face coin__face--back" src={back} alt="" draggable={false} />
      </span>
      <span key={`s${toss}`} className={`coin__shadow coin--h${v}${tossing ? " is-tossing" : ""}`} aria-hidden="true" />
      <span key={`l${toss}`} className="coin__label" aria-hidden="true">
        {heads ? c.coinHeads : c.coinTails}
      </span>
    </div>
  );
}

/** `toss` is the 0-based toss index; it picks each coin's arc and take-off delay. */
export function Coins({ faces, state, toss = 0 }: { faces: number[] | null; state: CoinState; toss?: number }) {
  return (
    <div className="toss-coins">
      {[0, 1, 2].map((k) => (
        <Coin key={k} k={k} toss={toss} face={faces ? faces[k] : null} state={state} />
      ))}
    </div>
  );
}
