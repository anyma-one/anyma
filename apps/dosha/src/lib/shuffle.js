// Fisher-Yates shuffle. Used to randomise option order at render (hard constraint #1).
// Returns a NEW array; the source mapping in data is never mutated.
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Produce a shuffled option order once per question for a quiz session, so options
// stay put when the user navigates back and forth (reshuffling mid-quiz would be
// disorienting and could invite position-gaming). Keyed by question id.
export function buildOrders(questions) {
  const orders = {};
  for (const q of questions) {
    orders[q.id] = shuffle(q.options.map((_, idx) => idx));
  }
  return orders;
}
