import {
  loadCoreResult, hasAcknowledged, acknowledge, takeReveal, prefersReducedMotion,
} from "../lib/storage.js";
import { openAckModal } from "../ui/modal.js";
import { scoreReading, DOSHA_NAME } from "../lib/scoring.js";
import { IMBALANCE, IMBALANCE_INTRO } from "../data/imbalance.js";
import { GUIDANCE, GUIDANCE_DISCLAIMER } from "../data/guidance.js";
import { PRACTICE_SAFETY } from "../data/education.js";
import {
  renderConstitution, wireMedallion, isRenderableProfile, prakritiReminder,
} from "./constitution.js";
import {
  generalRecommendations, adviceCard, evidenceCurrency, adviceHeading,
} from "./recommendations.js";
import {
  disclaimer, safetyNote, doshaMedallion, escapeHtml, button, ashtakonaTraced,
} from "../ui/components.js";

// 3A — the current-state reveal, from `design_handoff_dosha_reveal_loader`. Seconds,
// copied literally from the handoff's timing table. The emblem traces at the centre of
// the stage, the whole figure ignites white, and the light resolves into the medallion
// as it glides to its place beside the headline.
const VK = {
  trace: 2.0, turn: 9,
  kicker: 0.2, intro: 0.45,
  ignite: 1.95, glide: 2.15, emblemOut: 2.3, medallion: 2.45,
  line1: 2.35, line2: 2.6,
  body: 3.05, bodyStep: 0.4, cta: 3.95,
};

// NOTE: the per-dosha herb block (Ashwagandha for Vata, Brahmi for Pitta, Turmeric for
// Kapha) was removed from this page. It was a tradition-vs-evidence panel plus a safety
// note for the herb classically paired with the elevated dosha — education, never a
// recommendation, per hard constraint #7. It came from the original spec, but on a page
// about what to do right now it read as a suggestion to take something, which is exactly
// what constraint #7 exists to prevent. All three herbs remain rated in the education
// library (section 03) and their cautions remain in the Safety section (04), so nothing
// was lost but the placement.

// Bold the sentences data/imbalance.js marks as load-bearing. Escape first, then wrap —
// the marked substrings are plain text, so they must be escaped the same way before
// they can be matched against the escaped paragraph.
function emphasise(text, marks) {
  let html = escapeHtml(text);
  (marks || []).forEach((m) => {
    const needle = escapeHtml(m);
    if (html.includes(needle)) html = html.replace(needle, `<strong>${needle}</strong>`);
  });
  return html;
}

// Favour and Avoid are separate full-width sections rather than two columns. Each line
// carries its own rating and note (see data/guidance.js), which needs the width — side
// by side, the notes wrapped to ribbons.
function guidanceSections(doshaKey) {
  const g = GUIDANCE[doshaKey];
  return `
    ${adviceCard({ title: "Favour", tone: "favour", lead: g.lead, lines: g.favour })}
    ${adviceCard({ title: "Avoid", tone: "avoid", lead: g.avoidLead, lines: g.easeOff })}
    ${practiceSafetyHtml(doshaKey)}`;
}

// A bucket that recommends a practice with a documented risk must carry that risk
// alongside it, not defer it to the education library.
function practiceSafetyHtml(doshaKey) {
  const ids = GUIDANCE[doshaKey].safetyIds || [];
  return ids.map((id) => {
    const r = PRACTICE_SAFETY[id];
    // data-safety-id is the anchor the one-time acknowledgement watches for — the gate
    // fires when this note reaches the screen, not when the page loads.
    return r ? `<div class="practice-safety" data-safety-id="${escapeHtml(id)}" style="margin-top:14px">${safetyNote(r.title, r.body, "high")}</div>` : "";
  }).join("");
}

// Arm the one-time forced acknowledgement so it fires when the reader actually reaches
// the section that recommends the practice — not on page load, where a modal about nasal
// rinsing appears before anything has mentioned nasal rinsing and reads as an ambush.
//
// Only nasalWater is gated: it is the one where getting the method wrong is near-always
// fatal rather than uncomfortable. Returns a cleanup function.
function armSafetyGate(root) {
  const target = root.querySelector('.practice-safety[data-safety-id="nasalWater"]');
  if (!target || hasAcknowledged("nasalWater")) return () => {};

  let done = false;
  const stop = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };

  // Deliberately a scroll listener rather than IntersectionObserver. IO delivery is tied
  // to the rendering pipeline and can be suspended (backgrounded tab, throttled frame
  // loop) — which for this particular warning would mean silently never showing it.
  // A rect check on scroll fires whenever the reader is actually moving down the page,
  // which is exactly when it needs to.
  const inView = () => {
    const r = target.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.85 && r.bottom > 0;
  };

  let queued = false;
  function onScroll() {
    if (done || queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      if (done || !inView()) return;
      stop();
      if (!hasAcknowledged("nasalWater")) {
        openAckModal(PRACTICE_SAFETY.nasalWater, () => acknowledge("nasalWater"));
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // Covers the case where the section is already on screen without any scrolling —
  // a short viewport, or a reader returning to a page already scrolled down.
  if (inView()) onScroll();
  return stop;
}

// The centre-to-right glide. The emblem traces at the horizontal centre of the stage and
// slides into its slot beside the headline, so `--dx` is the distance between the two
// centres — MEASURED, never hard-coded. The headline width differs per dosha ("Vata is
// running high." against "Pitta is running high."), per breakpoint, and again once
// Spectral finishes loading; a stale value visibly starts the emblem off-centre.
//
// Re-measured on fonts.ready, on resize, and through a ResizeObserver on the stage and
// the headline. Returns a cleanup function.
const FULL_REVEAL_MS = 4600;

function armGlide(root, animate) {
  const slot = root.querySelector(".imb-slot");
  const stage = root.querySelector(".imbalance-lead");
  if (!animate || !slot || !stage) return () => {};

  const heading = root.querySelector(".imb-heading");
  let raf = 0;
  const apply = () => {
    const s = stage.getBoundingClientRect();
    const t = slot.getBoundingClientRect();
    if (!t.width || !s.width) return;
    // The slide keyframe is `both`-filled, so from frame zero the slot is ALREADY
    // displaced by whatever --dx currently says. Measuring its rect naively and writing
    // the result back adds the offset to itself — the first re-measure (fonts.ready
    // fires within a few hundred ms) doubles it and the emblem starts off-screen.
    // Subtract the live translation to recover the slot's resting centre. Scale is
    // irrelevant here: transform-origin is the centre, so scaling does not move it.
    const m = new DOMMatrixReadOnly(getComputedStyle(slot).transform === "none" ? "" : getComputedStyle(slot).transform);
    const resting = t.left + t.width / 2 - m.e;
    slot.style.setProperty("--dx", `${Math.round((s.left + s.width / 2) - resting)}px`);
  };
  const measure = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  };

  // The FIRST measurement is synchronous, deliberately. The slide keyframe is `both`, so
  // the slot sits at translateX(--dx) from frame zero — deferring the first value by a
  // rAF paints one frame of the emblem already in its final position, which reads as a
  // flicker before the shot has even started.
  apply();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
  window.addEventListener("resize", measure);
  let ro = null;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(measure);
    ro.observe(stage);
    if (heading) ro.observe(heading);
  }

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", measure);
    if (ro) ro.disconnect();
  };
}

export function renderFullResult({ app, navigate }) {
  const core = loadCoreResult();
  if (!core) { navigate("/tiers"); return; }

  let vikritiAnswers = null;
  try {
    const raw = sessionStorage.getItem("anyma.vikriti.v1");
    vikritiAnswers = raw ? JSON.parse(raw) : null;
  } catch (_) {}
  if (!vikritiAnswers) { navigate("/full/start"); return; }

  const scored = scoreReading(core.answers, vikritiAnswers);
  if (!isRenderableProfile(scored.prakriti)) { navigate("/core"); return; }

  const elevated = scored.imbalance.elevated;
  // Nothing running high => no corrective guidance and no herb. This previously fell
  // back to the dominant CONSTITUTIONAL dosha, so a reader was told "nothing is running
  // notably high" and then handed corrective advice for an imbalance the reading had
  // just said they did not have.
  const holdingBalance = elevated.length === 0;
  const guidanceKeys = holdingBalance ? [] : elevated;
  const imbalanceKeys = holdingBalance ? ["none"] : elevated;
  const kicker = holdingBalance ? "Holding balance · Vikriti" : "Currently elevated · Vikriti";

  // Same one-shot rule as the Core reveal: it plays on arrival from the current-state
  // pass, not when someone navigates back to a reading they have already read.
  const animate = takeReveal("full") && !prefersReducedMotion();

  const imbalanceHtml = imbalanceKeys.map((key, idx) => {
    const block = IMBALANCE[key];
    // The shot belongs to the first block only: it is the page's arrival, not a
    // decoration repeated per elevated dosha. "Holding balance" has no medallion for
    // the light to resolve into, so it gets the text beats without the emblem.
    const on = animate && idx === 0;
    const beat = (kind, d) => (on ? ` data-beat="${kind}" style="--d:${d}s"` : "");

    // The emblem traces inside the medallion's own slot and is swapped for the
    // medallion in place — one continuous object, not a hand-off between two.
    const medallion = key === "none" ? "" : `<span class="imb-medallion imb-slot">
        ${on ? `
          <span class="imb-trace" data-beat="out" style="--d:${VK.emblemOut}s">
            ${ashtakonaTraced({ size: 96, trace: VK.trace, turn: VK.turn })}
          </span>
          <span class="reveal-flash ignite" data-beat="ignite" style="--flash:210px;--d:${VK.ignite}s"></span>` : ""}
        <span${beat("med-lg", VK.medallion)}>${doshaMedallion(key, 96, true)}</span>
      </span>`;

    // "Right now," takes its own line — it is the framing, the dosha is the news.
    // Consume the space after the comma too, or line two starts with a stray space.
    // The two lines set separately (0.25s apart), so the dosha lands on its own beat.
    const [lead, rest] = escapeHtml(block.heading).split("Right now, ").length > 1
      ? ["Right now,", escapeHtml(block.heading).replace("Right now, ", "")]
      : [escapeHtml(block.heading), ""];
    const heading = rest
      ? `<span class="imb-line"${beat("line", VK.line1)}>${lead}</span><span class="imb-line"${beat("line", VK.line2)}>${rest}</span>`
      : `<span class="imb-line"${beat("line", VK.line1)}>${lead}</span>`;

    return `<div class="imb-state">
      <div class="imb-head">
        <h1 class="imb-heading">${heading}</h1>
        ${medallion}
      </div>
      ${block.body.map((p, i) => `<p class="imb-body"${beat("up", VK.body + i * VK.bodyStep)}>${emphasise(p, block.emphasise)}</p>`).join("")}
    </div>`;
  }).join("");

  // The mark key rides on the first guidance block only — these are the first rated
  // lines on the page, and repeating the link above every elevated dosha would turn a
  // quiet reference into chrome.
  const guidanceHtml = guidanceKeys.map((key, i) => `
    <div class="imb-guidance">
      ${adviceHeading(`Ayurvedic Advice when ${DOSHA_NAME[key]} is running high`, { legend: i === 0 })}
      ${guidanceSections(key)}
    </div>`).join('<hr class="dosha-rule" style="margin:32px 0">');

  // The current state leads, because that is what this reading is for. The constitution
  // follows as a reference the reader has almost certainly already seen, reachable by a
  // button rather than by scrolling past it.
  app.innerHTML = `
  <div class="wrap">
    <section class="imbalance imbalance-lead${animate ? " rvl" : ""}">
      <div class="kick"${animate ? ` data-beat="up"` : ""} style="text-align:center${animate ? `;--d:${VK.kicker}s` : ""}">${kicker}</div>
      <p class="imbalance-intro"${animate ? ` data-beat="up"` : ""} style="margin-top:12px${animate ? `;--d:${VK.intro}s` : ""}">${escapeHtml(IMBALANCE_INTRO)}</p>
      ${imbalanceHtml}

      <div class="btn-row center"${animate ? ` data-beat="up"` : ""} style="justify-content:center;margin-top:28px${animate ? `;--d:${VK.cta}s` : ""}">
        ${button("Compare with your core type ↓", { variant: "primary", id: "to-core-type" })}
      </div>
    </section>

    <div style="margin-top:8px">
      ${guidanceHtml}
    </div>

    <div class="btn-row center" style="justify-content:center;margin-top:32px">
      <a class="btn btn-quiet btn-sm" href="#/education" data-link>Full evidence library &amp; safety →</a>
    </div>

    <hr class="dosha-rule" style="margin:40px 0 32px">

    <div id="core-type">
      ${renderConstitution(scored.prakriti, {
        passLabel: "Full Reading · Prakriti",
        subline: "Your Core Type",
      })}

      <hr class="dosha-rule" style="margin:40px 0 32px">
      ${generalRecommendations(scored.prakriti)}
      ${evidenceCurrency()}
      ${prakritiReminder(scored.prakriti)}
    </div>

    <!-- No "back to your Core result" here: this page already contains the Core reading
         in full (the constitution section above, reached by the jump link), so the link
         sent readers to a strict subset of what they were already looking at.
         Retaking re-runs the current-state pass only — the constitution is carried
         forward, never re-asked (hard constraint #2), which is exactly what makes
         "retake the full reading" a different act from "retake the reading". -->
    <div class="btn-row center" style="justify-content:center;margin-top:36px">
      <button class="btn btn-quiet btn-sm" type="button" id="to-top">Back to the top ↑</button>
      <a class="btn btn-quiet btn-sm" href="#/full" data-full-start>Retake the full reading</a>
    </div>

    ${disclaimer(GUIDANCE_DISCLAIMER)}
  </div>`;

  const toCore = document.getElementById("to-core-type");
  if (toCore) {
    toCore.addEventListener("click", () => {
      document.getElementById("core-type").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // The Full Reading is the longest screen in the app — the current state, then the
  // corrective advice, then the whole constitution again. Getting back to the headline
  // was a scroll with no shortcut. Honours reduced motion: no smooth scroll if the
  // reader has asked for less movement.
  const toTop = document.getElementById("to-top");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }

  if (app.__cleanup) app.__cleanup();
  const stopMedallion = wireMedallion(app, animate ? FULL_REVEAL_MS : 0);
  const stopGate = armSafetyGate(app);
  const stopGlide = armGlide(app, animate);
  app.__cleanup = () => { stopMedallion(); stopGate(); stopGlide(); };
}
