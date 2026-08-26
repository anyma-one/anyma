import { escapeHtml } from "../ui/components.js";

// Placeholder legal pages (Imprint & Privacy, Terms). Content to be supplied later.
const PAGES = {
  legal: {
    kicker: "Imprint & Privacy",
    title: "Imprint & Privacy",
    body: "Placeholder. Company details, contact information and the privacy policy (what data is collected, how it's used, and your rights) will live here.",
  },
  terms: {
    kicker: "Terms",
    title: "Terms of Use",
    body: "Placeholder. The terms of use for anyma — including the educational-only scope and limitation of liability — will live here.",
  },
};

export function renderPlaceholder(key) {
  return ({ app }) => {
    const p = PAGES[key] || PAGES.legal;
    app.innerHTML = `
    <div class="wrap">
      <a class="back-link" href="#/" data-link>← Home</a>
      <div class="kick">${escapeHtml(p.kicker)}</div>
      <h1 style="font-family:var(--font-display);font-weight:500;font-size:40px;margin:16px 0 12px">${escapeHtml(p.title)}</h1>
      <p class="serif" style="font-size:17px;max-width:60ch">${escapeHtml(p.body)}</p>
      <p class="mlabel" style="margin-top:24px;color:var(--ink-muted)">Coming soon</p>
    </div>`;
  };
}
