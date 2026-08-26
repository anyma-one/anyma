// Scoring logic — faithful port of the reference implementation in ayurveda-scoring.md.
// Margins are the only tunable numbers; everything else is mechanical.

// Tunable margins. These are the only numbers to adjust against real data.
//
// SINGLE/DUAL were raised from 3/2 after modelling the outcome space across three
// respondent kinds (even answerer, mild lean, strong lean). At 3/2 a single dominant
// dosha came out ~60% of the time, which contradicts the app's own copy ("most people
// are a blend of two"). At 5/1 the split is roughly 38% single / 56% dual / 5%
// tridoshic — duals are the majority and tridoshic stays rare, both of which match
// what the result copy claims. Still provisional until tuned against real answers.
const SINGLE_MARGIN = 5;    // a - b >= this => single dominant
const DUAL_MARGIN = 1;      // b - c >= this (and not single) => dual blend

// Elevation threshold, in PERCENTAGE POINTS of each pass. Percentages rather than raw
// counts because the current-state pass has three neutral options that score nothing,
// so a vikriti pass can total fewer than 20 answers and a raw-count delta would read
// systematically low — under-reporting elevation for exactly the people who reported
// that nothing had changed.
//
// LOWERED 15 -> 10 after simulation showed the layer was close to unreachable for
// anyone answering carefully. 15 points meant a 3-of-20 swing; measured against a
// self-consistent respondent (10% answer noise):
//
//   shift of 2 answers   3% fired at 15pp   ->  16% at 10pp
//   shift of 3 answers   7%                 ->  32%
//   shift of 5 answers  41%                 ->  72%
//
// A user who genuinely answered a quarter of the second pass differently was still
// told "nothing is running notably high" more than half the time. The cost is a higher
// floor: pure answer noise now clears the bar ~14% of the time versus ~1%. That is the
// right trade for a layer whose whole purpose is to notice change, but it is a
// judgement call on unvalidated margins — see HANDOVER §7.3.
const IMBALANCE_MARGIN_PCT = 10;

const DOSHA_ORDER = ["V", "P", "K"];
const DOSHA_NAME = { V: "Vata", P: "Pitta", K: "Kapha" };

// Tally an answer array into counts, ignoring skips (null).
function tally(answers) {
  const counts = { V: 0, P: 0, K: 0 };
  let answered = 0;
  for (const a of answers) {
    if (a === "V" || a === "P" || a === "K") {
      counts[a] += 1;
      answered += 1;
    }
  }
  return { counts, answered };
}

function percentages(counts, answered) {
  if (answered === 0) return { V: 0, P: 0, K: 0 };
  return {
    V: Math.round((counts.V / answered) * 100),
    P: Math.round((counts.P / answered) * 100),
    K: Math.round((counts.K / answered) * 100),
  };
}

// Sort doshas by count descending, breaking ties with the fixed order.
function ranked(counts) {
  return [...DOSHA_ORDER].sort((x, y) => {
    if (counts[y] !== counts[x]) return counts[y] - counts[x];
    return DOSHA_ORDER.indexOf(x) - DOSHA_ORDER.indexOf(y);
  });
}

export function classify(counts) {
  const order = ranked(counts);
  const [d1, d2, d3] = order;
  const a = counts[d1], b = counts[d2], c = counts[d3];

  if (a - b >= SINGLE_MARGIN) {
    return { type: "single", doshas: [d1], label: DOSHA_NAME[d1] };
  }
  if (b - c >= DUAL_MARGIN) {
    // The label is always the canonical pair name (Vata-Pitta, Vata-Kapha,
    // Pitta-Kapha) — the three blends RESULTS actually defines. Naming it in rank
    // order instead would emit "Pitta-Vata"/"Kapha-Vata"/"Kapha-Pitta", which have no
    // RESULTS entry and threw on the reveal screen for ~8% of possible outcomes.
    // It also removes a tie bias: with equal top scores the rank order was decided by
    // the fixed V>P>K list, so a tie always read as the earlier dosha "leading".
    // `doshas` stays in rank order — the medallion and blend bar show the real split.
    const pair = [d1, d2].sort((x, y) => DOSHA_ORDER.indexOf(x) - DOSHA_ORDER.indexOf(y));
    return {
      type: "dual",
      doshas: [d1, d2],
      label: `${DOSHA_NAME[pair[0]]}-${DOSHA_NAME[pair[1]]}`,
    };
  }
  return {
    type: "tridoshic",
    doshas: [d1, d2, d3],
    label: "Tridoshic (balanced)",
  };
}

export function profile(answers) {
  const { counts, answered } = tally(answers);
  // No answers is not a balanced constitution. classify() would happily call an
  // all-zero tally "Tridoshic (balanced)" — a confident-looking reading built from
  // nothing. Report it as incomplete and let the caller send the user back.
  if (answered === 0) {
    return {
      counts,
      answered: 0,
      percentages: percentages(counts, 0),
      complete: false,
      type: "incomplete",
      doshas: [],
      label: null,
    };
  }
  return {
    counts,
    answered,
    complete: true,
    percentages: percentages(counts, answered),
    ...classify(counts),
  };
}

// prakritiAnswers: array of 20 answers (constitution pass)
// vikritiAnswers: optional array of 20 answers (current-state pass) for Full Reading
export function scoreReading(prakritiAnswers, vikritiAnswers = null) {
  const prakriti = profile(prakritiAnswers);
  if (!vikritiAnswers) {
    return { prakriti, vikriti: null, imbalance: null };
  }

  const vikriti = profile(vikritiAnswers);

  // Imbalance compares each dosha's SHARE of its own pass, so the two passes do not
  // need to have scored the same number of answers (see IMBALANCE_MARGIN_PCT).
  //
  // Only ELEVATION is reported. A depleted list was computed here previously and no
  // view ever read it — IMBALANCE in data/imbalance.js defines copy for the three
  // elevated states and "none", nothing for a dosha running below baseline. Writing
  // that copy is a content decision, not a code one; until it exists, computing the
  // value would just be dead data again.
  const elevated = [];
  for (const d of DOSHA_ORDER) {
    if (vikriti.percentages[d] - prakriti.percentages[d] >= IMBALANCE_MARGIN_PCT) {
      elevated.push(d);
    }
  }

  return { prakriti, vikriti, imbalance: { elevated } };
}

export { DOSHA_ORDER, DOSHA_NAME };
