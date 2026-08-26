import {
  EDU_SECTIONS, EDU_INTRO, EVIDENCE_LIBRARY, SAFETY,
  PRACTICE_EVIDENCE, PRACTICE_SAFETY, PROVENANCE_NOTE, isStale,
} from "../data/education.js";
import {
  evidenceBadge, evidenceBadgeScoped, traditionVsEvidence, safetyNote, md, escapeHtml,
  evidenceLegendLink,
} from "../ui/components.js";

// The two rated sections each carry the key. Section 03 is where a reader meets the
// marks for the first time if they came straight to the library rather than through a
// reading, and 04 is far enough down the page that scrolling back up for it is a real
// cost.
const legendRow = `<div class="legend-row" style="text-align:left;margin-bottom:16px">${evidenceLegendLink()}</div>`;

function libraryHtml() {
  return EVIDENCE_LIBRARY.map((e) => `
    <div class="evidence-entry">
      <div class="entry-head">
        <h4>${escapeHtml(e.name)}</h4>
        ${evidenceBadge(e.badge)}
      </div>
      ${traditionVsEvidence(e.tradition, e.evidence)}
    </div>`).join("");
}

// Practices carry a scoped badge pair rather than one badge, and any practice with a
// named risk renders its safety note inline — the note travels with the practice
// wherever it appears, it is not left to the Safety section further down.
function practicesHtml() {
  return PRACTICE_EVIDENCE.map((p) => {
    const risk = p.safetyId ? PRACTICE_SAFETY[p.safetyId] : null;
    // Provenance is a separate signal from the badge, per Cochrane's position that
    // funding and origin concentration do not belong inside a quality score.
    const prov = p.provenance
      ? `<p class="serif" style="font-size:13px;color:var(--ink-muted);margin-top:12px">
           <strong>${escapeHtml(PROVENANCE_NOTE.label)}:</strong> ${escapeHtml(PROVENANCE_NOTE.body)}</p>`
      : "";
    const stale = isStale(p)
      ? `<p class="mlabel" style="color:var(--ev-contested);margin-top:10px">Last reviewed ${escapeHtml(p.lastReviewed)} · may be out of date</p>`
      : `<p class="mlabel" style="color:var(--ink-muted);margin-top:10px">Last reviewed ${escapeHtml(p.lastReviewed)}</p>`;
    return `
    <div class="evidence-entry">
      <div class="entry-head">
        <h4>${escapeHtml(p.name)}</h4>
        ${evidenceBadgeScoped(p.ratings)}
      </div>
      ${traditionVsEvidence(p.tradition, p.evidence)}
      ${prov}
      ${risk ? `<div style="margin-top:14px">${safetyNote(risk.title, risk.body, "high")}</div>` : ""}
      ${stale}
    </div>`;
  }).join("");
}

function safetyHtml() {
  return `<p class="serif" style="font-size:15px;color:var(--ink-muted)">${escapeHtml(SAFETY.intro)}</p>
    <div class="stack" style="margin-top:16px">
      ${SAFETY.points.map((p) => safetyNote(p.head, p.body, "high")).join("")}
    </div>`;
}

function sectionHtml(s) {
  let body = "";
  if (s.type === "prose") body = s.paragraphs.map((p) => `<p>${md(p)}</p>`).join("");
  else if (s.type === "library") body = `<p class="serif" style="font-size:15px;color:var(--ink-muted);margin-bottom:16px">Every intervention carries one of four evidence tags. Where they sit is the whole point.</p>${legendRow}${libraryHtml()}`;
  else if (s.type === "practices") body = `<p class="serif" style="font-size:15px;color:var(--ink-muted);margin-bottom:16px">Most practices carry two ratings, because two different claims are being made. One is whether the practice works at all; the other is whether doing it <em>for your dosha</em> is what makes it work. The evidence usually reaches the first and not the second. A Supported rating here says nothing about whether the constitutional typing is right — there is no validated ground truth to test that against.</p>${legendRow}${practicesHtml()}`;
  else if (s.type === "safety") body = safetyHtml();
  return `<section class="edu-section" id="${s.id}">
    <div class="mlabel" style="margin-bottom:8px">${s.kicker}</div>
    <h2>${escapeHtml(s.title)}</h2>
    ${body}
  </section>`;
}

export function renderEducation({ app }) {
  app.innerHTML = `
  <div class="wrap">
    <a class="back-link" href="#/" data-link>← Home</a>
    <div class="kick">Open library · always free</div>
    <h1 style="font-family:var(--font-display);font-weight:500;font-size:40px;margin:16px 0 12px">${escapeHtml(EDU_INTRO.title)}</h1>
    ${EDU_INTRO.paragraphs.map((p) => `<p class="serif" style="font-size:17px">${escapeHtml(p)}</p>`).join("")}

    <nav class="edu-toc" aria-label="Sections">
      ${EDU_SECTIONS.map((s) => `<a href="#/education#${s.id}">${escapeHtml(s.title)}</a>`).join("")}
    </nav>

    ${EDU_SECTIONS.map(sectionHtml).join("")}

    <div class="dosha-depth" style="padding:24px 28px;margin-top:32px">
      <p class="serif" style="font-size:13px;color:var(--ink-muted);margin:0">This library is the honesty layer
        of the app, and it is never gated — not now and not in the future paid tier. Nothing here is a diagnosis
        or a substitute for professional care.</p>
    </div>
  </div>`;

  app.querySelectorAll(".edu-toc a").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").split("#").pop();
      const target = document.getElementById(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });
}
