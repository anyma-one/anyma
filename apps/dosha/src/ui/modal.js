// Minimal modal used for the single general info pop-up (one per reading, not per
// question — per the spec's progressive-honesty pattern).

import { escapeHtml, md, evidenceLegend } from "./components.js";

let lastFocus = null;

// `dismissible: false` makes this a soft stop: no close button, no backdrop click, no
// Escape. The content must supply its own control to close it. Used for the one-time
// safety acknowledgement, where a warning that can be waved away without being read
// defeats the point of interrupting at all.
export function openModal(contentHtml, { dismissible = true, label = "Information" } = {}) {
  closeModal();
  lastFocus = document.activeElement;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "modal-backdrop";
  backdrop.dataset.dismissible = dismissible ? "true" : "false";
  backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(label)}">
    ${dismissible ? '<button class="modal-close" aria-label="Close">&times;</button>' : ""}
    ${contentHtml}
  </div>`;

  if (dismissible) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop || e.target.closest(".modal-close")) closeModal();
    });
  }
  document.addEventListener("keydown", onKeydown);
  document.body.appendChild(backdrop);
  const focusTarget = backdrop.querySelector(".modal-close, .btn");
  if (focusTarget) focusTarget.focus();
}

function onKeydown(e) {
  if (e.key !== "Escape") return;
  const backdrop = document.getElementById("modal-backdrop");
  if (backdrop && backdrop.dataset.dismissible === "false") return;
  closeModal();
}

export function closeModal() {
  const existing = document.getElementById("modal-backdrop");
  if (existing) existing.remove();
  document.removeEventListener("keydown", onKeydown);
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  lastFocus = null;
}

// One-time forced acknowledgement for a severe, avoidable risk (D5). Hybrid per the
// evidence: interrupt once, then rely on the persistent inline note. NOT a repeated
// gate — repeated interruptive alerts get habituated and clicked through.
//
// Deliberately NOT used on the education layer: interrupting a free, ungated library
// would work against hard constraint #4. It fires where the app actually recommends
// the practice.
export function openAckModal(record, onAck) {
  const body = Array.isArray(record.body) ? record.body : [record.body];
  openModal(`
    <div class="kick" style="color:var(--ev-contested);margin-bottom:12px">Before you try this</div>
    <h3 style="margin-bottom:10px">${escapeHtml(record.title)}</h3>
    ${body.map((p) => `<p class="serif" style="font-size:15px;line-height:1.6;color:var(--ink-soft)">${md(p)}</p>`).join("")}
    <div class="btn-row" style="margin-top:24px">
      <button class="btn btn-primary" type="button" id="ack-btn">I understand</button>
    </div>
  `, { dismissible: false, label: "Safety information" });

  const btn = document.getElementById("ack-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      closeModal();
      if (typeof onAck === "function") onAck();
    });
    btn.focus();
  }
}

// The evidence-mark key. Dismissible in every way (close button, backdrop, Escape) —
// it is a reference the reader asked for, the opposite of the safety acknowledgement.
export function openEvidenceLegend() {
  openModal(`<div class="ev-legend">${evidenceLegend()}</div>`, { label: "Evidence marks — key" });
}

export function infoPopupHtml(info) {
  return `<h3>${escapeHtml(info.title)}</h3>
    ${info.body.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
    <ul>${info.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
    <p><em>${escapeHtml(info.footer)}</em></p>`;
}
