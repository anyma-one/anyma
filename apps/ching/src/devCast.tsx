// Development only: force one of the four design sample casts (BUILD §9, Phase 2), so every
// changing-line case can be checked by hand. Guarded by import.meta.env.DEV everywhere it's
// used, so it is dropped from production builds. The forced coins go through the same cast
// logic (lineFromCoins) and the same animations as a real cast.
import { useState } from "react";
import samples from "../data/sample-casts.json";

let forced: number[][] | null = null;

/** Coins for toss n (1–6) when a sample is forced, else null. */
export const forcedCoins = (n: number): number[] | null => (import.meta.env.DEV && forced ? forced[n - 1] : null);

export function DevCastPicker() {
  const [value, setValue] = useState(() => (forced ? String(samples.casts.findIndex((c) => c.tosses.map((t) => t.coins).join() === forced!.join())) : ""));
  if (!import.meta.env.DEV) return null;
  return (
    <p className="dev-picker">
      <label>
        Dev only, force a cast:{" "}
        <select
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            forced = e.target.value === "" ? null : samples.casts[Number(e.target.value)].tosses.map((t) => t.coins);
          }}
        >
          <option value="">Random (real coins)</option>
          {samples.casts.map((c, i) => (
            <option key={c.case} value={i}>
              {c.case} · hexagram {c.primary.number}
            </option>
          ))}
        </select>
      </label>
    </p>
  );
}
