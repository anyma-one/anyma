// Reusable render helpers implementing the anyma Ayurveda Design System.
// SVG geometry (Ashtakona emblem, ElementGlyph, DoshaMedallion) and component
// styling are transcribed from the handoff design-system bundle.

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Render **bold** and *italic* spans inside otherwise-plain paragraph text.
export function md(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/* ---------- ElementGlyph (pancha mahabhuta marks, viewBox 0 0 24 24) ---------- */
export function elementGlyph(element, size = 30, color, strokeWidth = 1.4) {
  const c = color || `var(--${element})`;
  const glyphs = {
    ether: `<path d="M4 12 H20" stroke="${c}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`,
    air:   `<circle cx="12" cy="12" r="8" stroke="${c}" stroke-width="${strokeWidth}"/>`,
    fire:  `<path d="M12 4 20.5 20 3.5 20Z" stroke="${c}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`,
    water: `<path d="M4 12a8 8 0 0 0 16 0Z" fill="${c}"/>`,
    earth: `<rect x="5" y="5" width="14" height="14" stroke="${c}" stroke-width="${strokeWidth}"/>`,
  };
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" role="presentation">${glyphs[element] || glyphs.ether}</svg>`;
}

const DOSHA_GLYPH = { V: "air", P: "fire", K: "earth" };
const DOSHA_KEY = { V: "vata", P: "pitta", K: "kapha" };

// DoshaMedallion — filled disc in the dosha colour, its dominant-element mark in
// luminous white. `glow` adds the white aura.
// The disc sizes off `--med-size`, defaulting to the `size` argument. The default is
// what almost every caller wants; the reveal needs the disc to step 52 → 64 → 73px
// across the breakpoints (responsive handoff §7), and an inline width would beat any
// media query. Setting `--med-size` on an ancestor is the only way a stylesheet can
// reach a value the renderer wrote inline.
//
// The glyph inside scales with it, so it is sized in ems rather than px.
export function doshaMedallion(doshaLetter, size = 73, glow = true) {
  const dkey = DOSHA_KEY[doshaLetter] || "vata";
  const aura = glow
    ? ` style="filter:drop-shadow(0 0 2px rgba(255,255,255,0.95)) drop-shadow(0 0 5px rgba(255,255,255,0.5))"`
    : "";
  const label = { V: "Vata", P: "Pitta", K: "Kapha" }[doshaLetter] || "Vata";
  const box = `var(--med-size, ${size}px)`;
  return `<span class="dosha-medallion" role="img" aria-label="${label}" style="width:${box};height:${box};font-size:${box};background:var(--${dkey})">`
    + `<span${aura}>${elementGlyph(DOSHA_GLYPH[doshaLetter] || "air", "0.56em", "#FFFFFF", 1.5)}</span></span>`;
}

/* ---------- Ashtakona emblem ---------- */
// The engraved eight-point mandala. `spin` adds the counter-rotating rings.
export function ashtakona({ size = 300, spin = false, opacity = 1, strokeWidth = 1.4 } = {}) {
  const shellCls = spin ? "ak-spin ak-shell" : "";
  const coreCls = spin ? "ak-spin ak-core" : "";
  return `<svg class="ashtakona" viewBox="-18 -18 156 156" width="${size}" height="${size}"
     style="opacity:${opacity}" fill="none" stroke="var(--ink)" stroke-width="${strokeWidth}"
     stroke-linejoin="round" stroke-linecap="round" role="presentation">
    <circle cx="60" cy="60" r="52"></circle>
    <g class="${shellCls}">
      <rect x="8" y="8" width="104" height="104" transform="rotate(45 60 60)"></rect>
      <rect x="24" y="24" width="72" height="72"></rect>
      <path d="M47.27 47.27 L8 8 M72.73 47.27 L112 8 M72.73 72.73 L112 112 M47.27 72.73 L8 112" stroke-width="0.7"></path>
      <path d="M60 42 L60 -13.5 M78 60 L133.5 60 M60 78 L60 133.5 M42 60 L-13.5 60" stroke-width="0.7"></path>
    </g>
    <g class="${coreCls}"><rect x="24" y="24" width="72" height="72" transform="rotate(45 60 60)"></rect></g>
    <circle cx="60" cy="60" r="19"></circle>
  </svg>`;
}

/* ---------- Ashtakona, self-drawing (reveal only) ---------- */
// The reveal variant from `design_handoff_dosha_reveal_loader` (high fidelity: "timings,
// easings, geometry and sizes are final"). Two things make it a separate component
// rather than a flag on ashtakona():
//
// 1. **It is one flat figure list, not two counter-rotating groups.** The trace reads as
//    a single hand drawing the whole emblem, so the figures must share one turn. The
//    hero's counter-rotation would tear the drawing apart mid-stroke.
// 2. **The eight spokes stop at the centre circle (r = 18) and that circle is unfilled**,
//    so the middle stays genuinely empty for the medallion to land in.
//
// Every figure carries pathLength="1" + stroke-dasharray="1", so one keyframe
// (stroke-dashoffset 1 → 0) draws any shape whatever its real length. Do NOT switch this
// to getTotalLength(); the handoff rules it out and the rects would need separate maths.
//
// Draw order and per-figure delay are copied literally from the handoff's table.
// [tag, attributes, delay, isSpoke]. The spokes are flagged rather than carrying a
// literal stroke-width so both weights can be set per screen — the same geometry reads
// very differently at 300px and at 96px, and the emblem is the largest thing on the
// Core reveal.
const TRACE_FIGURES = [
  ["circle", 'cx="60" cy="60" r="52"', 0, false],
  ["rect", 'x="8" y="8" width="104" height="104" transform="rotate(45 60 60)"', 0.06, false],
  ["rect", 'x="24" y="24" width="72" height="72" transform="rotate(45 60 60)"', 0.12, false],
  ["rect", 'x="24" y="24" width="72" height="72"', 0.18, false],
  ["path", 'd="M60 42 L60 -13.5"', 0.10, true],
  ["path", 'd="M78 60 L133.5 60"', 0.12, true],
  ["path", 'd="M60 78 L60 133.5"', 0.14, true],
  ["path", 'd="M42 60 L-13.5 60"', 0.16, true],
  ["path", 'd="M47.3 47.3 L8 8"', 0.18, true],
  ["path", 'd="M72.7 47.3 L112 8"', 0.20, true],
  ["path", 'd="M72.7 72.7 L112 112"', 0.22, true],
  ["path", 'd="M47.3 72.7 L8 112"', 0.24, true],
  ["circle", 'cx="60" cy="60" r="18" fill="none"', 0.26, false],
];

// `trace` is the per-figure draw duration, `turn` one full rotation — 2.5s / 14s on the
// Core reveal, 2.0s / 9s on the Full Reading, per the two timing tables.
//
// `stroke` / `spoke` default to the handoff's 1.4 / 1.05, which is right at the Full
// Reading's 96px. The Core reveal draws the same figures at 300px, where those weights
// scale up with the emblem and the engraving turns into linework — it overrides them.
export function ashtakonaTraced({
  size = 300, trace = 2.5, turn = 14, stroke = 1.4, spoke = 1.05,
} = {}) {
  const figures = TRACE_FIGURES
    .map(([tag, attrs, d, isSpoke]) => `<${tag} ${attrs}${isSpoke ? ` stroke-width="${spoke}"` : ""}`
      + ` pathLength="1" stroke-dasharray="1" style="--d:${d}s"></${tag}>`)
    .join("\n    ");
  return `<div class="ak-turn" style="--turn:${turn}s">
    <svg class="ashtakona ak-traced" viewBox="-18 -18 156 156" width="${size}" height="${size}"
      style="--trace:${trace}s" fill="none" stroke="var(--ink)" stroke-width="${stroke}"
      stroke-linejoin="round" stroke-linecap="round" role="presentation">
    ${figures}
    </svg>
  </div>`;
}

/* ---------- BlendBar ---------- */
const DOSHA_NAME = { V: "Vata", P: "Pitta", K: "Kapha" };
// `beat` (the reveal's timing table, or null) staggers the three fills and the labels.
// The fills animate from width 0 to whatever this reading's percentages are — the
// keyframe declares only `from`, so the real widths stay in one place, here.
export function blendBar(percentages, beat = null) {
  const order = ["V", "P", "K"];
  const shown = order.filter((d) => percentages[d] > 0);
  const segs = shown
    .map((d, i) => {
      const delay = beat ? `;--d:${beat.fills[Math.min(i, beat.fills.length - 1)]}s` : "";
      return `<i class="${d.toLowerCase()}" style="width:${percentages[d]}%${delay}"></i>`;
    }).join("");
  const labels = shown.map((d) => `<span>${DOSHA_NAME[d]} ${percentages[d]}</span>`).join("");
  const track = beat ? ` data-beat="up" style="--d:${beat.bar}s"` : "";
  const caption = beat ? ` data-beat="up" style="--d:${beat.labels}s"` : "";
  return `<div>
    <div class="blend-bar" role="img" aria-label="Dosha blend"${track}>${segs}</div>
    <div class="blend-labels"${caption}>${labels}</div>
  </div>`;
}

/* ---------- Elemental weave ---------- */
// Order shown: Ether, Air, Fire, Water, Earth — the classical pancha mahabhuta
// sequence, from subtlest to densest. Matches the glyph row on the landing page.
const WEAVE_ORDER = [
  ["ether", "Ether"], ["air", "Air"], ["fire", "Fire"], ["water", "Water"], ["earth", "Earth"],
];
export function elementalWeave(elements, beat = null) {
  const items = WEAVE_ORDER.map(([key, label], i) => `
    <div class="weave-item"${beat ? ` data-beat="up" style="--d:${(beat.elements + i * beat.elementStep).toFixed(2)}s"` : ""}>
      <div class="weave-glyph">${elementGlyph(key, 42)}</div>
      <div class="weave-cap">
        <div class="mlabel">${label}</div>
        <div class="pct">${elements[key]}%</div>
      </div>
    </div>`).join("");
  return `<div class="weave">${items}</div>`;
}

/* ---------- EvidenceBadge (diamond mark) ---------- */
// Ported from the design-system handoff (design_handoff_evidence_marks). The mark is a
// single diamond — a silhouette used nowhere else in the system, so it can never be
// misread as a dosha (circle) or an element (square/triangle/crescent/bar). How much of
// the diamond is inked is how much is known: solid → half → outline+bindu → outline.
// Shape carries the meaning; colour only reinforces it.
//
// ONE STATE PER CLAIM. The handoff is explicit that split and double marks were explored
// and abandoned — do not stack marks on a single claim. Where two ratings genuinely
// apply they belong to different SCOPES and render as separate marks with their own
// scope labels (see evidenceBadgeScoped).
//
// `means` is the legend copy — one sentence per state, defined here rather than in a
// legend module so the four states have exactly one definition in the codebase. Each is
// written to be true of how the badge is actually assigned: Traditional says an absence
// of research, never implied support (the same rule education section 07 turns on).
const EV = {
  supported: {
    cls: "ev-supported", word: "Supported", gloss: "meets current evidence",
    means: "Good-quality studies find a real benefit from the practice itself. It does not mean the Ayurvedic reasoning behind it has been tested.",
  },
  promising: {
    cls: "ev-promising", word: "Promising", gloss: "early signals, unproven",
    means: "Studies point the right way, but there are too few of them, they are too small, or their certainty is too low to call it settled.",
  },
  traditional: {
    cls: "ev-traditional", word: "Traditional", gloss: "classical use only",
    means: "Classical use, with no adequate evidence either way. That is an absence of research, not quiet support — nobody has properly looked.",
  },
  contested: {
    cls: "ev-contested", word: "Contested", gloss: "evidence disagrees",
    means: "Evidence exists and points against the traditional advice, or a documented harm outweighs what benefit was found.",
  },
};

export const EVIDENCE_STATES = ["supported", "promising", "traditional", "contested"];

const DIAMOND = "M12 2.2 L21.8 12 L12 21.8 L2.2 12 Z";
const DIAMOND_HALF = "M12 2.2 L12 21.8 L2.2 12 Z";

// `currentColor` throughout, so the state colour comes from the .ev-<state> class and
// the SVG can be dropped anywhere.
export function evidenceMark(level, size = 20) {
  const key = String(level).toLowerCase();
  const sw = size <= 18 ? 1.8 : size <= 24 ? 1.6 : 1.4;
  const r = size <= 18 ? 2.4 : 2.1;
  let inner;
  if (key === "supported") {
    inner = `<path d="${DIAMOND}" fill="currentColor" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round"/>`;
  } else {
    inner = `<path d="${DIAMOND}" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="round"/>`;
    if (key === "promising") inner += `<path d="${DIAMOND_HALF}" fill="currentColor"/>`;
    if (key === "traditional") inner += `<circle cx="12" cy="12" r="${r}" fill="currentColor"/>`;
  }
  const label = (EV[key] || EV.supported).word;
  return `<svg class="ev-mark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    role="img" aria-label="${escapeHtml(label)}">${inner}</svg>`;
}

export function evidenceBadge(level, showGloss = false, showLabel = true, size = 20) {
  const key = String(level).toLowerCase();
  const e = EV[key] || EV.supported;
  const mark = evidenceMark(key, size);
  // Mark-only mode is used in list rows. The title keeps the state reachable on hover,
  // and the SVG's aria-label keeps it in the row's accessible name.
  if (!showLabel) {
    return `<span class="ev-badge ${e.cls}" title="${escapeHtml(e.word)}: ${escapeHtml(e.gloss)}">${mark}</span>`;
  }
  const gloss = showGloss ? ` <span class="ev-gloss">· ${escapeHtml(e.gloss)}</span>` : "";
  return `<span class="ev-badge ${e.cls}">${mark}<span class="ev-word">${escapeHtml(e.word)}${gloss}</span></span>`;
}

/* ---------- Evidence badge pair ---------- */
// Most practices need TWO ratings, because the evidence and the Ayurvedic claim are
// not the same claim: yoga is well supported as movement and entirely untested as a
// Vata prescription. Collapsing that to one badge either oversells the tradition or
// undersells the practice, so both are shown with the scope each one applies to.
//
// Takes `ratings`: [{ badge, scope }, ...]. One entry renders a single badge, so
// records with no split (nasya) use the same call. Scope text comes from the record —
// the pair is not always general-vs-dosha (oil pulling is rinse-vs-detox).
export function evidenceBadgeScoped(ratings) {
  const list = Array.isArray(ratings) ? ratings : [ratings];
  return `<span class="ev-pair">${list.map((r, i) => `
    ${i > 0 ? '<span class="ev-pair-sep" aria-hidden="true">/</span>' : ""}
    <span class="ev-pair-item">${evidenceBadge(r.badge)}<span class="ev-qual">${escapeHtml(r.scope)}</span></span>
  `).join("")}</span>`;
}

/* ---------- Evidence legend ---------- */
// The evidence-marks handoff requires a legend reachable in one tap from any screen
// that shows marks. Without it a reader meets four diamonds with no key, and the one
// thing the marks must never do is read as decoration.
//
// It is a pop-up rather than an inline panel because the marks appear on the reading
// screens, where a four-row key between the reading and the advice would push the
// advice down the page for the second and every later visit.
//
// The closing note is not garnish. Whatever the marks say about a practice, none of
// them says the dosha match is right (hard constraint #6) — a legend that explained the
// scale without saying that would be the exact overstatement the layer exists to stop.
export function evidenceLegend() {
  const rows = EVIDENCE_STATES.map((k) => `
    <li class="ev-legend-row">
      <span class="ev-badge ${EV[k].cls}">${evidenceMark(k, 22)}<span class="ev-word">${escapeHtml(EV[k].word)}</span></span>
      <p class="ev-legend-means">${escapeHtml(EV[k].means)}</p>
    </li>`).join("");
  return `
    <h3>What the diamonds mean</h3>
    <p class="ev-legend-lead">Every piece of advice in this app carries one of four marks, saying how well
      it holds up outside the tradition. How much of the diamond is inked is how much is known — filled,
      half, outlined with a dot, outlined.</p>
    <ul class="ev-legend-list">${rows}</ul>
    <div class="ev-legend-notes">
      <p><strong>Two marks on one line</strong> mean two separate claims, each with its own rating —
        not a combined score. The note under the line says which mark applies to which part.</p>
      <p><strong>No mark rates the dosha match.</strong> A rating says what is known about the practice
        itself. Whether doing it <em>for your type</em> is what makes it work is untested — dosha typing
        has no validated ground truth to test it against.</p>
    </div>
    <div class="btn-row" style="margin-top:22px">
      <a class="btn btn-quiet btn-sm" href="#/education" data-link>See the full evidence library →</a>
    </div>`;
}

// One-tap trigger. Rendered wherever marks appear; the click is handled by a single
// delegated listener in main.js, so a new surface only needs this call.
//
// Deliberately text-only. Every diamond shape is already spoken for by a state, so an
// uncoloured one used as a generic icon would read as Contested (plain outline) to
// exactly the reader who has not opened the legend yet.
export function evidenceLegendLink(label = "What do the diamonds mean?") {
  return `<button class="ev-legend-link" type="button" data-ev-legend aria-haspopup="dialog">${escapeHtml(label)}</button>`;
}

/* ---------- Tradition-vs-evidence split ---------- */
export function traditionVsEvidence(tradition, evidence) {
  return `<div class="ev-split">
    <div class="side tradition"><div class="side-label">Ayurveda says</div><p>${md(tradition)}</p></div>
    <div class="side evidence"><div class="side-label">Evidence says</div><p>${md(evidence)}</p></div>
  </div>`;
}

/* ---------- Safety note ---------- */
const TRIANGLE = (size, stroke) => `<svg class="tri" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${stroke}" stroke-width="1.7" aria-hidden="true"><path d="M12 3 2 21h20L12 3Z" stroke-linejoin="round"/><path d="M12 10v5M12 18h.01" stroke-linecap="round"/></svg>`;

export function safetyNote(title, body, level = "caution") {
  const accent = level === "high" ? "var(--ev-contested)" : "var(--accent)";
  const bodyHtml = Array.isArray(body) ? body.map((p) => `<p>${md(p)}</p>`).join("") : `<p>${md(body)}</p>`;
  return `<div class="safety-note ${level === "high" ? "high" : ""}" role="note">
    ${TRIANGLE(20, accent)}
    <span class="s-text">
      ${title ? `<span class="s-title">${escapeHtml(title)}</span>` : ""}
      <span class="s-body">${bodyHtml}</span>
    </span>
  </div>`;
}
export { TRIANGLE };

/* ---------- Disclaimer ---------- */
export function disclaimer(text) {
  return `<p class="disclaimer">${md(text)}</p>`;
}

/* ---------- ScopeNote ---------- */
export function scopeNote(text, block = false) {
  if (block) return `<div class="scope-note-block">${escapeHtml(text)}</div>`;
  return `<span class="scope-note">${escapeHtml(text)}</span>`;
}

/* ---------- Progress bar ---------- */
// Identical in both passes (Core and Full): counter + solid sage fill. The
// current-state pass is distinguished by its pass-note ("Your current state ·
// Vikriti") rather than by different progress chrome.
export function progressBar(current, total) {
  const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  const counter = `Question ${String(current).padStart(2, "0")} / ${total}`;
  return `<div class="progress">
    <div class="progress-head">
      <span class="progress-counter">${counter}</span>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
  </div>`;
}

/* ---------- Button helper ---------- */
export function button(label, { variant = "primary", size = "", href, id, attrs = "", link = false, extraClass = "" } = {}) {
  const cls = `btn btn-${variant}${size ? " btn-" + size : ""}${extraClass ? " " + extraClass : ""}`;
  if (href) return `<a class="${cls}" href="${href}"${link ? " data-link" : ""}${id ? ` id="${id}"` : ""} ${attrs}>${label}</a>`;
  return `<button class="${cls}" type="button"${id ? ` id="${id}"` : ""} ${attrs}>${label}</button>`;
}

/* ---------- Tier card ---------- */
export function tierCard({
  index, name, tagline, meta, commitment, href,
  locked = false, fullStart = false, blocked = false,
}) {
  const inner = `
    <div class="tier-head"><span class="tier-title"><span class="idx">${index}</span>&nbsp;·&nbsp;${escapeHtml(name)}</span></div>
    <div class="tier-tagline">${escapeHtml(tagline)}</div>
    <div class="tier-meta"><span>${escapeHtml(meta)}</span>${commitment ? `<span class="commit">${escapeHtml(commitment)}</span>` : ""}</div>`;
  if (locked) return `<div class="tier-card locked" aria-disabled="true">${inner}</div>`;
  // Full Reading is gated on the Core result. When Core isn't done the card takes a
  // blocked (red-tinted) hover and explains itself in a pop-up instead of navigating.
  if (blocked) {
    return `<a class="tier-card blocked" href="${href}" data-full-blocked role="button" aria-disabled="true">${inner}</a>`;
  }
  if (fullStart) return `<a class="tier-card" href="${href}" data-full-start>${inner}</a>`;
  return `<a class="tier-card" href="${href}" data-link>${inner}</a>`;
}
