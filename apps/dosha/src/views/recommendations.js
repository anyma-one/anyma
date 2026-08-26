import { GENERAL, GUIDANCE_REVIEWED } from "../data/guidance.js";
import { currencyText } from "../lib/review.js";
import {
  evidenceBadge, escapeHtml, doshaMedallion, evidenceLegendLink,
} from "../ui/components.js";

// Section heading for a block of rated advice, with the optional one-tap key to the
// evidence marks. The link sits under the heading rather than beside it because
// `.subline` is centred — a right-aligned control would pull the heading off centre.
//
// `legend` is passed once per screen-worth of marks, not once per card: on the Full
// Reading the corrective guidance and the constitutional advice are far enough apart
// (the second is reached by a jump link) that each needs its own, but repeating it on
// every elevated dosha would be noise.
export function adviceHeading(text, { legend = false } = {}) {
  return `<h2 class="subline${legend ? " has-legend" : ""}">${escapeHtml(text)}</h2>
    ${legend ? `<div class="legend-row">${evidenceLegendLink()}</div>` : ""}`;
}

// Currency line for the evidence ratings on a reading. Shown once per page rather than
// per row — a date on every line would be noise here, where the reader is acting on the
// advice rather than comparing entries as they are in the education library.
export function evidenceCurrency() {
  const { text, stale } = currencyText(GUIDANCE_REVIEWED);
  return `<p class="ev-currency${stale ? " stale" : ""}">${escapeHtml(text)}</p>`;
}

// Advice rendering, shared by the Core reveal and the Full Reading so the two cannot
// drift apart. Every advice line carries its own evidence rating and a note saying what
// that rating rests on — see the header of data/guidance.js for why per-line badges are
// defensible here when an earlier keyword-guessed version was not.

// One advice line: the advice, its rating, and what the rating rests on.
//
// A line normally carries ONE rating. `badges` (an array) is for the case where the
// advice line bundles two genuinely different interventions that the evidence treats
// differently — "…at regular times" is Promising for the timing and Traditional for the
// warm-cooked-food rule. That is two claims with one state each, not a combined score on
// one claim, which the evidence-marks handoff rules out. The note says which is which.
//
// The test for adding a second mark is whether the LINE bundles two interventions. It is
// NOT the general-vs-dosha split — that applies to every line in the app, so encoding it
// per-row would put two marks on all of them and mean nothing.
export function adviceRow({ text, badge, badges, note }) {
  const list = badges && badges.length ? badges : (badge ? [badge] : []);
  return `
    <div class="adv-row">
      <div class="adv-main">
        <span class="adv-text">${escapeHtml(text)}</span>
        ${list.length ? `<span class="adv-badge">${list.map((b) => evidenceBadge(b)).join("")}</span>` : ""}
      </div>
      ${note ? `<p class="adv-note serif">${escapeHtml(note)}</p>` : ""}
    </div>`;
}

// A full-width card. `tone` drives the colour treatment: "favour" and "avoid" tint the
// whole card so the two are separable at a glance; "general" stays on the neutral
// surface. `doshaKey` puts the type's medallion beside its name, with `quality` (the
// type's classical description) set alongside. `lead` sits below the head as the
// run-in to the list.
//
// `dosha-depth` is what gives the card its torn-paper edge — the tint is applied to that
// element's ::before in the stylesheet so the filter shapes the colour too.
export function adviceCard({ title, tone = "general", lead, lines, doshaKey }) {
  const medallion = doshaKey
    ? `<span class="adv-medallion">${doshaMedallion(doshaKey, 60, true)}</span>` : "";
  return `
    <div class="adv-card dosha-depth adv-${tone}">
      <div class="adv-head">
        ${medallion}
        <h3 class="adv-title">${escapeHtml(title)}</h3>
      </div>
      ${lead ? `<p class="adv-lead mlabel">${escapeHtml(lead)}</p>` : ""}
      ${lines.map(adviceRow).join("")}
    </div>`;
}

// Which orientations to show. Single -> one. Dual -> both, dominant first, because a
// blend is genuinely governed by two. Tridoshic -> its own card, since "adjust for your
// type" is precisely what does not apply when no type dominates.
function blocksFor(profile) {
  if (profile.type === "tridoshic") return [{ ...GENERAL.tri, key: null }];
  return profile.doshas.slice(0, 2)
    .map((d) => (GENERAL[d] ? { ...GENERAL[d], key: d } : null))
    .filter(Boolean);
}

export function generalRecommendations(profile, { legend = true } = {}) {
  const blocks = blocksFor(profile);
  if (!blocks.length) return "";
  return `
  <section class="general-rec">
    ${adviceHeading("Ayurvedic Advice for Your Dosha Type", { legend })}
    ${blocks.map((g) => adviceCard({
      // Type and its classical qualities read as one headline: "Pitta — hot, sharp and
      // intense" rather than a name with a sentence restating it underneath.
      title: `${g.dosha} — ${g.attributes}`,
      tone: "general",
      lead: g.recommendsLabel || `Ayurveda recommends for ${g.dosha}`,
      lines: g.lines,
      doshaKey: g.key,
    })).join("")}
  </section>`;
}
