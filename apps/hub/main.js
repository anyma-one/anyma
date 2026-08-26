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
// `done` turns the response body into the success message.
const wireForm = ({ formId, statusId, submitId, endpoint, collect, done }) => {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  const submit = document.getElementById(submitId);
  if (!form) return;

  const setStatus = (msg, kind) => {
    status.textContent = msg;
    status.className = "form__status" + (kind ? ` form__status--${kind}` : "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = collect(form);
    if (typeof payload === "string") {
      setStatus(payload, "error");
      return;
    }

    submit.disabled = true;
    setStatus("Sending…");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json().catch(() => ({}));
      form.reset();
      setStatus(done(data), "ok");
    } catch {
      setStatus("That didn't go through. Please try again, or write to hello@anyma.one.", "error");
    } finally {
      submit.disabled = false;
    }
  });
};

wireForm({
  formId: "suggest-form",
  statusId: "s-status",
  submitId: "s-submit",
  endpoint: "/api/suggest",
  collect: (form) => {
    // NOT `form.title` — HTMLElement.title (the attribute) shadows the named getter.
    const title = val(form, "title");
    const body = val(form, "body");
    const email = val(form, "email");

    if (!title || !body) return "Please fill in both a title and your idea.";
    // Email is optional here — but if one is given, a typo means we can never reply.
    if (email && !EMAIL_RE.test(email)) return "That email address doesn't look right.";

    return { title, body, email: email || null };
  },
  done: () => "Thank you — your suggestion reached us.",
});

wireForm({
  formId: "ching-form",
  statusId: "c-status",
  submitId: "c-submit",
  endpoint: "/api/waitlist",
  collect: (form) => {
    const email = val(form, "email");
    if (!email) return "Please enter your email address.";
    if (!EMAIL_RE.test(email)) return "That email address doesn't look right.";
    return { email, interest: "ching" };
  },
  done: (data) =>
    data.status === "already_verified"
      ? "You're already on the list — nothing more to do."
      : "Check your inbox: we sent one email to confirm.",
});
