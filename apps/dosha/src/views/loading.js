import { ashtakona } from "../ui/components.js";

// UNUSED as of the reveal-animation handoff, and kept deliberately rather than deleted.
// The quiz used to render this for 1.6s between the last answer and the result; the
// reveal choreography replaced it, because the handoff's whole premise is that the
// loader IS the result screen — a separate loading page is the thing it rules out.
// Still here because a future screen with a real wait (a network call, a paid tier
// generating something) would want exactly this beat, and it is ten lines.
//
// A short anticipation beat before the reveal. Calm, not a fake "analyzing" theatre.
export function renderLoading({ app, message }) {
  app.innerHTML = `
    <div class="loading-beat">
      <div class="l-emblem">${ashtakona({ size: 96, spin: true, opacity: 1 })}</div>
      <p>${message || "Charting your weave"}</p>
    </div>`;
}
