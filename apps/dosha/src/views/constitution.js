import { RESULTS } from "../data/results.js";
import { DOSHA_NAME } from "../lib/scoring.js";
import { deriveElements } from "../lib/elements.js";
import {
  ashtakonaTraced, doshaMedallion, blendBar, elementalWeave, escapeHtml,
} from "../ui/components.js";

// 2A — the Core reveal's beat sheet, in seconds, copied from the handoff's timing table.
// Kept as one object because the beats are only meaningful relative to each other: the
// name has to arrive before the trace finishes, the bar fills have to start under the
// subline. Move one and you are re-choreographing, not tweaking a number.
const BEAT = {
  trace: 2.5, turn: 14,
  flash: 0.6, med: 1.0, name: 1.75, subtitle: 2.4,
  bar: 2.9, fills: [3.0, 3.2, 3.4], labels: 3.6,
  elementsHead: 3.75, elements: 3.90, elementStep: 0.17,
};
// Total runtime, used to hold the medallion crossfade off until the shot has landed.
export const CORE_REVEAL_MS = 5100;

// Shared reveal hero for the constitution (prakriti), used by Core and Full Reading.
// Layout follows art direction "2A": emblem → name+subtitle → blend bar → elemental
// weave → prose. Copy is verbatim from result-copy.md.

const EN_DASH = (label) => label.replace(/-/g, "–");

// The spec wrote atBest / whenStretched / honestNote as run-ons after a bold lead-in
// ("At your best: determined, steady…"), so they start lower-case. They are now
// standalone paragraphs under their own heading and need a capital. Done here rather
// than in results.js so the source copy stays verbatim.
const upperFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// A dual result's LABEL is canonical (always "Vata-Pitta", never "Pitta-Vata") so it
// always resolves to a RESULTS entry — naming it in rank order used to emit three
// labels with no copy and throw. But the canonical name also hides which dosha is
// actually dominant: measured over simulated readings, 44% of results labelled
// "Vata-Pitta" were Pitta-dominant, and every one of them was presented Vata-first.
// So: look the copy up by the canonical label, and DISPLAY the pair in rank order.
// The blend bar underneath shows the real split either way.
function displayName(profile, result) {
  if (profile.type !== "dual" || profile.doshas.length < 2) return result.name;
  return `${DOSHA_NAME[profile.doshas[0]]}-${DOSHA_NAME[profile.doshas[1]]}`;
}

// True when a profile can actually be rendered as a reveal: it was scored from real
// answers, and its label is one of the seven RESULTS defines. Views call this before
// rendering so an unusable reading redirects instead of blanking the screen.
export function isRenderableProfile(profile) {
  return !!profile && profile.answered > 0 && !!RESULTS[profile.label];
}

// The closing "this is your prakriti" reminder, rendered separately from the reveal so
// each page can place it where it belongs. On the Core reading it now sits at the very
// end, after the advice — it reads as a closing caveat, not as an interruption between
// the type and what to do about it.
export function prakritiReminder(profile) {
  const r = RESULTS[profile.label];
  if (!r) return "";
  return `<p class="prose-serif prakriti-reminder">${escapeHtml(r.hook)}</p>`;
}

export function renderConstitution(profile, options = {}) {
  const r = RESULTS[profile.label];
  // Belt and braces. classify() now only emits the seven labels RESULTS defines, but
  // an unmapped label used to throw here, and because renderConstitution runs inside a
  // hashchange listener the error never reached the router — the screen simply stayed
  // on whatever was already there. Fail loudly instead of silently blanking.
  if (!r) {
    throw new Error(`renderConstitution: no RESULTS entry for label "${profile.label}"`);
  }
  const isTri = r.key === "tridoshic";
  const passLabel = options.passLabel || "Core Reading · Prakriti";
  const doshas = profile.doshas.slice(); // ranked; [d1] | [d1,d2] | [d1,d2,d3]
  const elements = deriveElements(profile.percentages);

  // Prose is left-aligned: centred ragged-both-edges is hard to read at this length.
  // The closing reminder stays centred — it is a single short block, not body copy.
  // "At your best" / "When stretched" are mono sublabels above their paragraph rather
  // than bold run-ins, so the reveal reads as three labelled passages.
  const stretched = isTri
    ? `<h3 class="reveal-sub">An honest note</h3>
       <p class="prose-serif">${escapeHtml(upperFirst(r.honestNote))}</p>`
    : `<h3 class="reveal-sub">Under pressure</h3>
       <p class="prose-serif">${escapeHtml(upperFirst(r.whenStretched))}</p>`;

  // `animate` plays the 2A reveal. The markup is the same either way — only the `.rvl`
  // class and the `data-beat` hooks differ — so there is one template to keep correct.
  const on = !!options.animate;
  // Two halves, because several of these elements already carry a style attribute and a
  // second one is silently dropped by the parser — the beat renders, the delay does not,
  // and every element fires at 0s. `mark` goes outside the style attribute, `dly` inside.
  const mark = (kind) => (on ? ` data-beat="${kind}"` : "");
  const dly = (d) => (on ? `;--d:${d}s` : "");

  return `
    <div class="reveal${on ? " rvl" : " rise"}">
      <div class="pass-label">
        <div class="kick">${escapeHtml(passLabel)}</div>
        ${options.subline ? `<h2 class="subline">${escapeHtml(options.subline)}</h2>` : ""}
      </div>

      <div class="emblem">
        ${/* The traced emblem is used whether or not the reveal plays. Its final frame
              IS the result screen's emblem — one figure turning as a whole, per the
              handoff — so rendering the counter-rotating hero variant on a return visit
              would mean the same screen had two different emblems depending on how the
              reader got there. Without `.rvl` the trace simply does not run and the
              figure is already drawn. */
          ashtakonaTraced({
            size: 300, trace: BEAT.trace, turn: BEAT.turn,
            // Finer than the handoff's 1.4/1.05: those weights are set for a 96px
            // emblem, and at 300px they scale with it into heavy linework. 0.9/0.6
            // keeps the engraved, drawn-with-a-pen quality at this size.
            stroke: 0.9, spoke: 0.6,
          })}
        <div class="med-slot" data-doshas="${doshas.join(",")}">
          ${on ? `<span class="reveal-flash" data-beat="flash" style="--flash:118px;--d:${BEAT.flash}s"></span>` : ""}
          <div class="med-fix"${mark("med")} style="${dly(BEAT.med).slice(1)}">${doshaMedallion(doshas[0], 73, true)}</div>
          <div class="med-glow"></div>
        </div>
      </div>

      <h1 class="dname"${mark("up")} style="margin:6px 0 3px${dly(BEAT.name)}">${escapeHtml(EN_DASH(displayName(profile, r)))}</h1>
      <p class="subtitle"${mark("up")} style="font-size:18px;margin:0 0 8px${dly(BEAT.subtitle)}">${escapeHtml(r.subtitle)}</p>

      <div class="blend-wrap">${blendBar(profile.percentages, on ? BEAT : null)}</div>

      <h2 class="subline"${mark("up")} style="margin:28px 0 2px${dly(BEAT.elementsHead)}">Your Element Split</h2>
      <div style="margin:18px 0 2px">${elementalWeave(elements, on ? BEAT : null)}</div>

      <div class="reveal-prose">
        <p class="prose-serif" style="margin-top:26px">${escapeHtml(r.character)}</p>
        <h3 class="reveal-sub">At your best</h3>
        <p class="prose-serif">${escapeHtml(upperFirst(r.atBest))}</p>
        ${stretched}
      </div>
    </div>`;
}

// Start the medallion crossfade for dual/tridoshic results. Single results stay
// static (no glow flash), per the design. Returns a cleanup function.
//
// `startAfter` holds the crossfade until the reveal has finished. Without it the first
// crossfade fires at 2.6s — mid-shot, between the name and the blend bar — and reads as
// the reveal glitching rather than as the blend breathing.
export function wireMedallion(root, startAfter = 0) {
  const slot = root.querySelector(".med-slot");
  if (!slot) return () => {};
  const doshas = (slot.dataset.doshas || "").split(",").filter(Boolean);
  if (doshas.length < 2) return () => {};

  const medFix = slot.querySelector(".med-fix");
  const glow = slot.querySelector(".med-glow");
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (reduce) return () => {};

  let i = 0;
  const timers = [];
  let iv = null;
  // Shorter cycle for mixed (dual/tridoshic) types so the blend reads more actively.
  const tick = () => {
    medFix.style.opacity = "0";
    glow.style.opacity = "1";
    timers.push(setTimeout(() => {
      i = (i + 1) % doshas.length;
      medFix.innerHTML = doshaMedallion(doshas[i], 73, true);
      timers.push(setTimeout(() => {
        medFix.style.opacity = "1";
        glow.style.opacity = "0";
      }, 240));
    }, 420));
  };

  // The reveal leaves the medallion mid-animation on its `data-beat` element; clearing
  // the hook before the crossfade starts stops the two from fighting over opacity.
  const start = setTimeout(() => {
    medFix.removeAttribute("data-beat");
    medFix.style.opacity = "1";
    iv = setInterval(tick, 2600);
  }, startAfter);
  timers.push(start);

  return () => { if (iv) clearInterval(iv); timers.forEach(clearTimeout); };
}
