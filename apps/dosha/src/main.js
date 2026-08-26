// Hash router. Views render into #app; internal quiz navigation re-renders locally
// without touching the hash (so history isn't flooded with 20 question steps).

import { renderLanding } from "./views/landing.js";
import { renderTiers } from "./views/tiers.js";
import { renderQuiz } from "./views/quiz.js";
import { renderCoreResult } from "./views/coreResult.js";
import { renderFullResult } from "./views/fullResult.js";
import { renderEducation } from "./views/education.js";
import { renderPlaceholder } from "./views/placeholder.js";
import { openEmailModal, openCoreRequiredModal } from "./views/emailModal.js";
import { hasCoreResult, hasEmail } from "./lib/storage.js";
import { closeModal, openEvidenceLegend } from "./ui/modal.js";

const app = document.getElementById("app");

function navigate(path) {
  if (location.hash === `#${path}`) {
    render(); // same route — force a re-render
  } else {
    location.hash = `#${path}`;
  }
}

// Begin (or resume into) Full Reading. Sign-up is a pop-up, not a page: it opens
// over whatever screen you're on. Requires the Core result first.
function startFullReading() {
  // Tier 2 is locked until the Core Reading exists — explain, don't silently redirect.
  if (!hasCoreResult()) { openCoreRequiredModal(navigate); return; }
  if (hasEmail()) { navigate("/full"); return; }
  openEmailModal(() => navigate("/full"));
}

const ctx = { app, navigate, startFullReading };

function parsePath() {
  // Strip a trailing in-page anchor (e.g. #/education#safety -> /education).
  const raw = location.hash.replace(/^#/, "") || "/";
  return raw.split("#")[0] || "/";
}

// render() runs from a hashchange listener, and an exception in a listener does not
// propagate to whatever dispatched it — the router would carry on believing it had
// navigated while the previous screen stayed on display. Catch it here so a broken
// view produces a visible, recoverable state instead of a frozen one.
function render() {
  try {
    renderRoute();
  } catch (err) {
    console.error("Render failed for", location.hash, err);
    app.innerHTML = `
      <div class="wrap">
        <div class="kick" style="color:var(--ev-contested)">Something went wrong</div>
        <h1 style="font-family:var(--font-display);font-weight:500;font-size:36px;margin:14px 0 12px">This screen could not be shown</h1>
        <p class="serif" style="font-size:17px;max-width:60ch">Your saved reading may be from an older version of the app. Starting a new reading should clear it.</p>
        <div class="btn-row" style="margin-top:24px">
          <a class="btn btn-primary" href="#/core" data-link>Start a new reading</a>
          <a class="btn btn-quiet" href="#/" data-link>Home</a>
        </div>
      </div>`;
  }
}

function renderRoute() {
  closeModal();
  // Tear down any per-view timers (e.g. the reveal medallion crossfade) before swapping.
  if (app.__cleanup) { app.__cleanup(); app.__cleanup = null; }
  const path = parsePath();
  // The focused "reading" screens (question + reveal) render as a framed paper card
  // on the taupe canvas; landing and browsing screens stay full-bleed.
  const framed = ["/core", "/full", "/core/result", "/full/result"].includes(path);
  document.body.classList.toggle("framed", framed);
  window.scrollTo(0, 0);

  switch (path) {
    case "/":
    case "":
      renderLanding(ctx); break;
    case "/tiers":
      renderTiers(ctx); break;
    case "/core":
      renderQuiz("prakriti", ctx); break;
    case "/core/result":
      renderCoreResult(ctx); break;
    case "/full/start":
      // Direct URL: render tiers as the base and open the relevant pop-up over it.
      if (!hasCoreResult()) { renderTiers(ctx); openCoreRequiredModal(navigate); return; }
      if (hasEmail()) { navigate("/full"); return; }
      renderTiers(ctx); openEmailModal(() => navigate("/full")); break;
    case "/full":
      // Guards: needs Core result and a captured email (the sign-up pop-up).
      if (!hasCoreResult()) { renderTiers(ctx); openCoreRequiredModal(navigate); return; }
      if (!hasEmail()) { renderCoreResult(ctx); openEmailModal(() => navigate("/full")); return; }
      renderQuiz("vikriti", ctx); break;
    case "/full/result":
      renderFullResult(ctx); break;
    case "/education":
      renderEducation(ctx); break;
    case "/legal":
      renderPlaceholder("legal")(ctx); break;
    case "/terms":
      renderPlaceholder("terms")(ctx); break;
    default:
      renderLanding(ctx); break;
  }

  // Move focus to main content for screen readers on route change. preventScroll is
  // essential: focusing <main> otherwise scrolls it to the top of the viewport,
  // pushing the header (and its rule) off-screen on load.
  app.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

// Full Reading entry points open a pop-up in place (no page switch).
document.addEventListener("click", (e) => {
  const blocked = e.target.closest("[data-full-blocked]");
  if (blocked) { e.preventDefault(); openCoreRequiredModal(navigate); return; }
  const fs = e.target.closest("[data-full-start]");
  if (fs) { e.preventDefault(); startFullReading(); return; }
  // Evidence-mark key. One delegated listener rather than per-view wiring, so the
  // legend is reachable from every screen that renders a mark — including views
  // rendered after this file has run.
  const legend = e.target.closest("[data-ev-legend]");
  if (legend) { e.preventDefault(); openEvidenceLegend(); return; }
  // In-app links keep everything on the hash router; close any open modal on nav.
  const link = e.target.closest("a[data-link]");
  if (link) closeModal();
});

// Don't let the browser restore a previous scroll position on reload — the app is a
// single scroll container per route, so restoration can land mid-page and make a
// reload look different from an in-app navigation.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

window.addEventListener("hashchange", render);
// Render exactly once on startup (guard against both listeners firing).
let started = false;
function start() {
  if (started) return;
  started = true;
  render();
}
window.addEventListener("DOMContentLoaded", start);
if (document.readyState !== "loading") start();
