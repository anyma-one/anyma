// Persistence. The Core (prakriti) result is measured once and carried forward into
// Full Reading (hard constraint #2). Stored in localStorage so it survives the time
// gap between the two passes. The current-state pass never reads Core ANSWERS from
// here for display — only the final score comparison uses the stored counts.

// v2: the scoring margins changed (SINGLE 3->5, DUAL 2->1) and dual labels are now
// canonical. A v1 reading would still show its old stored label on the Core screen
// while the Full Reading re-scored the same answers to a different one, so v1 is
// deliberately abandoned rather than migrated — the reading is 20 questions.
const KEY_CORE = "anyma.coreResult.v2";
const KEY_EMAIL = "anyma.email.v1";

export function saveCoreResult(data) {
  try {
    localStorage.setItem(KEY_CORE, JSON.stringify(data));
  } catch (_) { /* storage unavailable — flow still works within the session */ }
}

export function loadCoreResult() {
  try {
    const raw = localStorage.getItem(KEY_CORE);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearCoreResult() {
  try { localStorage.removeItem(KEY_CORE); } catch (_) {}
}

export function hasCoreResult() {
  return !!loadCoreResult();
}

// Email capture gate for Full Reading. No backend in v1 — we only record that an
// email was provided so the gate is honoured. (Wiring a real provider is deferred.)
export function saveEmail(email) {
  try { localStorage.setItem(KEY_EMAIL, email); } catch (_) {}
}

export function getEmail() {
  try { return localStorage.getItem(KEY_EMAIL) || null; } catch (_) { return null; }
}

export function hasEmail() {
  return !!getEmail();
}

// The reveal is a one-shot, and this is what makes it one. The choreographed sequence
// (~5s on the Core reading, ~4.5s on the Full) belongs to the moment the reading is
// first shown — the handoff is explicit that the loader IS the result screen. Coming
// back to a reading you have already read is not that moment, and replaying five seconds
// of drawing before the reader can get at the advice would be a cost with no payoff.
//
// sessionStorage, not localStorage: a new tab or a returning visitor should see the
// reveal again. Set as the quiz hands off, read exactly once by the result view.
const KEY_REVEAL = (id) => `anyma.reveal.${id}`;

export function armReveal(id) {
  try { sessionStorage.setItem(KEY_REVEAL(id), "1"); } catch (_) {}
}

// Reads and clears in one go, so a re-render (or the router replaying a route) shows
// the finished frame rather than starting the sequence over.
export function takeReveal(id) {
  try {
    const armed = sessionStorage.getItem(KEY_REVEAL(id)) === "1";
    if (armed) sessionStorage.removeItem(KEY_REVEAL(id));
    return armed;
  } catch (_) { return false; }
}

export function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

// One-time safety acknowledgements. Used for risks where the failure mode is severe
// enough to justify interrupting once, but where firing on every visit would be
// counterproductive: the alert-fatigue literature shows repeated interruptive warnings
// get habituated and clicked through, degrading the safety they exist to provide. The
// persistent inline note carries the message thereafter.
//
// INTENDED BEHAVIOUR, NOT A BUG: clearing localStorage re-fires the acknowledgement.
// A cleared store is indistinguishable from a new user, and for a near-always-fatal
// risk the safe default is to show the warning again. See HANDOVER §7 on the missing
// in-app reset — a "Start over" control will re-trigger this by design.
const KEY_ACK = (id) => `anyma.ack.${id}.v1`;

export function hasAcknowledged(id) {
  try { return localStorage.getItem(KEY_ACK(id)) === "1"; } catch (_) { return false; }
}

export function acknowledge(id) {
  try { localStorage.setItem(KEY_ACK(id), "1"); } catch (_) { /* session-only is fine */ }
}
