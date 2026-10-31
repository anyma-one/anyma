// anyma start screen — pop-up handling + the "suggest a project" form.
// Vanilla on purpose: this screen is one view and a modal; a framework earns nothing here.

/* ---------- pop-ups ---------- */

let lastFocused = null;

// Must match the longest .card transition in styles.css.
const EXIT_MS = 380;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

const openDialog = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  lastFocused = document.activeElement;

  el.hidden = false;
  // Force a reflow so the browser has a "closed" frame to transition away from — without
  // this the element goes straight to its open state and nothing animates.
  void el.offsetWidth;
  el.classList.add("is-open");

  document.body.classList.add("no-scroll");
  // Focus the first real control inside the card, not the close button, when there is a form.
  const target = el.querySelector("input, textarea") || el.querySelector("[data-close]");
  if (target) target.focus();
};

const closeDialog = (el) => {
  if (el.hidden) return;
  el.classList.remove("is-open");

  // Focus goes back straight away; only the visual teardown waits for the transition.
  if (lastFocused instanceof HTMLElement) lastFocused.focus();

  const finish = () => {
    el.hidden = true;
    // A pop-up that ended on its success screen opens on the form again next time.
    el.querySelectorAll("[data-form]").forEach((n) => { n.hidden = false; });
    el.querySelectorAll("[data-success]").forEach((n) => { n.hidden = true; });
    if (!document.querySelector(".overlay.is-open")) {
      document.body.classList.remove("no-scroll");
    }
  };

  if (reduced.matches) finish();
  else setTimeout(finish, EXIT_MS);
};

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener) {
    e.preventDefault();
    openDialog(opener.dataset.open);
    return;
  }

  const closer = e.target.closest("[data-close]");
  if (closer) {
    const overlay = closer.closest(".overlay");
    if (overlay) closeDialog(overlay);
    return;
  }

  // Click on the backdrop itself (not the card) closes.
  if (e.target.classList.contains("overlay")) closeDialog(e.target);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = document.querySelector(".overlay.is-open");
  if (open) closeDialog(open);
});

// Keep Tab inside an open dialog.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const open = document.querySelector(".overlay.is-open");
  if (!open) return;

  const focusables = open.querySelectorAll(
    'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ---------- forms ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const val = (form, name) => form.elements.namedItem(name).value.trim();

// `collect` returns the payload to send, or a string to show as a validation error.
// `done` turns the response body into the success message. `required` names the field that
// must hold text before the submit button wakes up.
const wireForm = ({ formId, statusId, submitId, required, endpoint, collect, done }) => {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  const submit = document.getElementById(submitId);
  if (!form) return;
  const card = form.closest(".card");
  const field = form.elements.namedItem(required);

  const sync = () => { submit.disabled = !field.value.trim(); };
  field.addEventListener("input", sync);
  sync();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";

    const payload = collect(form);
    if (typeof payload === "string") {
      status.textContent = payload;
      return;
    }

    submit.disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json().catch(() => ({}));
      form.reset();
      card.querySelector("[data-message]").textContent = done(data);
      card.querySelectorAll("[data-form]").forEach((n) => { n.hidden = true; });
      const success = card.querySelector("[data-success]");
      success.hidden = false;
      success.querySelector(".btn").focus();
    } catch {
      status.textContent = "That didn't go through. Please try again, or write to hello@anyma.one.";
    } finally {
      sync();
    }
  });
};

wireForm({
  formId: "suggest-form",
  statusId: "s-status",
  submitId: "s-submit",
  required: "body",
  endpoint: "/api/suggest",
  collect: (form) => {
    const body = val(form, "body");
    const email = val(form, "email");

    if (!body) return "Please tell us your idea.";
    // Email is optional here — but if one is given, a typo means we can never reply.
    if (email && !EMAIL_RE.test(email)) return "That email address doesn't look right.";

    // The form has no title field any more; the inbox subject uses the idea's first line.
    const first = body.split("\n")[0].trim();
    const title = first.length > 80 ? `${first.slice(0, 79).trimEnd()}…` : first;
    return { title, body, email: email || null };
  },
  done: () =>
    "Your idea has reached us. If it grows into a project, you will be among the first to hear about it.",
});

wireForm({
  formId: "ching-form",
  statusId: "c-status",
  submitId: "c-submit",
  required: "email",
  endpoint: "/api/waitlist",
  collect: (form) => {
    const email = val(form, "email");
    if (!EMAIL_RE.test(email)) return "That email address doesn't look right.";
    return { email, interest: "ching" };
  },
  done: (data) =>
    data.status === "already_verified"
      ? "You're already on the list. We'll write to you when ching opens."
      : "We sent you one email. Click the link in it to confirm, and we'll write again when ching opens.",
});

/* ---------- hand old deep links back to soul ---------- */

// soul lived at this origin until the start screen took it, and its screens were hashes:
// anyma.one/#privacy, /#waitlist and so on. A hash never reaches the server, so no redirect
// rule can catch these — only the page that now answers at the root can. The hub itself
// uses no hashes, so anything in this list is a link from before the move.
const SOUL_HASHES = new Set([
  "privacy",
  "imprint",
  "impressum",
  "terms",
  "waitlist",
]);

(() => {
  const hash = location.hash.replace(/^#/, "");
  if (!hash) return;
  // Deep Dive screens are all prefixed, so match the family rather than list every one.
  if (SOUL_HASHES.has(hash) || hash.startsWith("deep")) {
    location.replace(`/soul/#${hash}`);
  }
})();
