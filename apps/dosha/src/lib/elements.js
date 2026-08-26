// Derive the five-element "weave" from a dosha blend {V,P,K} (percentages).
//
// The elements are NOT independently measured — they are a re-expression of the three
// dosha scores through Ayurveda's fixed classical mapping:
//   Vata  = Air + Ether
//   Pitta = Fire + Water
//   Kapha = Earth + Water
// Each dosha's share is split EVENLY between its two elements (no invented ratios,
// so the display doesn't imply a precision the reading doesn't have). Water is a single
// combined value (Pitta's + Kapha's halves). Integers are adjusted to sum to 100.
export function deriveElements(pct) {
  const V = pct.V || 0, P = pct.P || 0, K = pct.K || 0;
  // Keys in classical order (ether → earth). The order also decides which element
  // receives a spare unit in largest-remainder rounding when fractions tie, so keep it
  // aligned with WEAVE_ORDER in ui/components.js.
  const raw = {
    ether: V / 2,
    air:   V / 2,
    fire:  P / 2,
    water: P / 2 + K / 2,
    earth: K / 2,
  };
  return roundTo100(raw);
}

// Largest-remainder rounding so the five integers sum to exactly 100.
function roundTo100(raw) {
  const keys = Object.keys(raw);
  const total = keys.reduce((s, k) => s + raw[k], 0) || 1;
  const scaled = {};
  keys.forEach((k) => { scaled[k] = (raw[k] / total) * 100; });
  const floored = {};
  let used = 0;
  keys.forEach((k) => { floored[k] = Math.floor(scaled[k]); used += floored[k]; });
  let remainder = 100 - used;
  const byFrac = keys.slice().sort((a, b) => (scaled[b] - floored[b]) - (scaled[a] - floored[a]));
  for (let i = 0; i < remainder; i++) floored[byFrac[i % keys.length]] += 1;
  return floored;
}
