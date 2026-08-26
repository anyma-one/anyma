// Evidence-currency policy. Lives in lib/ rather than data/education.js because it now
// governs BOTH the education practice records and the guidance advice lines — it is a
// cross-cutting rule, not a property of one content set.
//
// The unit of update is one badge, per Akl et al. 2017 on living guideline
// recommendations: a single rating can be re-reviewed without touching the rest.

export const REVIEW_POLICY = {
  surveillanceMonths: 12,   // intended re-check cadence per rating
  staleAfterMonths: 24,     // past this, a rating renders as possibly out of date
  defaultReviewed: "2026-07",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Accepts a record with `lastReviewed`, or a bare "YYYY-MM" string.
function stampOf(input) {
  if (typeof input === "string") return input;
  return (input && input.lastReviewed) || REVIEW_POLICY.defaultReviewed;
}

export function monthsSinceReview(input, now = new Date()) {
  const [y, m] = stampOf(input).split("-").map(Number);
  if (!y || !m) return Infinity;
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
}

export function isStale(input, now = new Date()) {
  return monthsSinceReview(input, now) > REVIEW_POLICY.staleAfterMonths;
}

// Human-readable stamp: "2026-07" -> "July 2026".
export function reviewedLabel(input) {
  const [y, m] = stampOf(input).split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return stampOf(input);
  return `${MONTHS[m - 1]} ${y}`;
}

// The currency sentence shown with any set of evidence ratings. States what the ratings
// are pinned to and that they move — not a defensive hedge, a shelf life. Degrades on its
// own once the stamp passes staleAfterMonths, so nobody has to remember to add a warning.
export function currencyText(input, now = new Date()) {
  const when = reviewedLabel(input);
  const stale = isStale(input, now);
  return {
    stale,
    text: stale
      ? `Evidence ratings last reviewed ${when} — more than ${REVIEW_POLICY.staleAfterMonths / 12} years ago. Research will have moved since; treat these as possibly out of date.`
      : `Evidence ratings reflect the research as of ${when}, and are re-checked every ${REVIEW_POLICY.surveillanceMonths} months. Evidence moves — a rating is a snapshot, not a verdict.`,
  };
}
