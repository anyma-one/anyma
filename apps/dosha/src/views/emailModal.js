import { loadCoreResult, saveEmail } from "../lib/storage.js";
import { openModal, closeModal } from "../ui/modal.js";
import { escapeHtml, button } from "../ui/components.js";

// Shown when Full Reading is opened before the Core Reading has been completed.
export function openCoreRequiredModal(navigate) {
  openModal(`
    <div class="kick" style="color:var(--ev-contested);margin-bottom:12px">Core type required</div>
    <h3 style="margin-bottom:10px">Please Complete the Core Reading First</h3>
    <p class="serif" style="font-size:16px;line-height:1.6;color:var(--ink-soft)">Once you determine
      your core dosha type, you can continue the full reading.</p>
    <div class="btn-row" style="margin-top:24px">
      ${button("Start the core reading →", { variant: "primary", id: "goto-core" })}
    </div>
  `);

  const go = document.getElementById("goto-core");
  if (go) go.addEventListener("click", () => { closeModal(); navigate("/core"); });
}

// Full Reading sign-up as a pop-up (not a separate page). Opens over the current
// screen; on submit it stores the email and runs `onDone`.
export function openEmailModal(onDone) {
  const core = loadCoreResult();
  const label = core ? core.label : "your core type";

  openModal(`
    <div class="kick" style="margin-bottom:10px">Full Reading · Vikriti · Free</div>
    <h3>One Step Before the Current-State Pass</h3>
    <p class="serif" style="font-size:15px;color:var(--ink-soft)">Full Reading is free. We ask for your
      email so we can write to you about dosha. Your Core result
      (<strong style="color:var(--ink)">${escapeHtml(label)}</strong>) is carried forward — you'll only
      answer the present-tense questions.</p>
    <form id="email-form" novalidate style="margin-top:18px">
      <div class="field">
        <label for="email">Email address</label>
        <input type="email" id="email" name="email" autocomplete="email" placeholder="you@example.com" required />
        <p class="hint">We store your email and nothing from your answers, and may write to you about
          dosha — new readings, and when the Individual Reading opens. Unsubscribe any time. See
          <a href="#/legal" data-link>Privacy</a>.</p>
        <p class="error" id="email-error" hidden>Please enter a valid email address.</p>
      </div>
      ${button("Start the current-state pass →", { variant: "primary", size: "lg", type: "submit", attrs: 'style="width:100%"' })}
    </form>
    <p class="serif" style="font-size:13px;color:var(--ink-muted);margin-top:14px">Prefer not to? The
      education library and all safety content stay open to everyone, no email needed.</p>
  `);

  const form = document.getElementById("email-form");
  const input = document.getElementById("email");
  const error = document.getElementById("email-error");
  if (input) input.focus();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { error.hidden = false; input.focus(); return; }
    error.hidden = true;
    saveEmail(value);
    // Stored server-side without waiting: the reader is never held up or blocked by it.
    // keepalive lets the request finish even though the view changes straight away.
    fetch("/api/dosha-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "full", email: value }),
      keepalive: true,
    }).catch(() => {});
    closeModal();
    if (typeof onDone === "function") onDone();
  });
}

// Individual Reading sign-up (not open yet). Double opt-in: the server stores the address
// unconfirmed and emails a confirmation link; nothing is kept in the browser.
export function openIndividualModal() {
  openModal(`
    <div class="kick" style="margin-bottom:10px">Individual Reading · Coming soon</div>
    <h3>Hear When It Opens</h3>
    <p class="serif" style="font-size:15px;color:var(--ink-soft)">The Individual Reading goes further
      than a questionnaire can — your reading explored against your own situation, your preferences
      and your doubts. Leave your email and we'll tell you when it opens.</p>
    <form id="individual-form" novalidate style="margin-top:18px">
      <div class="field">
        <label for="ind-email">Email address</label>
        <input type="email" id="ind-email" name="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required />
      </div>
      <label class="consent">
        <input type="checkbox" id="ind-consent" />
        <span>I'd like an email when the dosha Individual Reading opens. We send one confirmation
          email now. Unsubscribe any time — see <a href="#/legal" data-link>Privacy</a>.</span>
      </label>
      <p class="error" id="ind-error" role="alert" hidden></p>
      <p class="status" id="ind-status" role="status" aria-live="polite" hidden></p>
      ${button("Notify me →", { variant: "primary", size: "lg", type: "submit", id: "ind-submit", attrs: 'style="width:100%"' })}
    </form>
  `, { label: "Individual Reading sign-up" });

  const form = document.getElementById("individual-form");
  const input = document.getElementById("ind-email");
  const consent = document.getElementById("ind-consent");
  const error = document.getElementById("ind-error");
  const status = document.getElementById("ind-status");
  const submit = document.getElementById("ind-submit");
  if (input) input.focus();

  const fail = (msg, focus) => { error.textContent = msg; error.hidden = false; if (focus) focus.focus(); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    const value = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return fail("Please enter a valid email address.", input);
    if (!consent.checked) return fail("Please tick the box so we may email you.", consent);

    submit.disabled = true;
    try {
      const res = await fetch("/api/dosha-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "individual", email: value, consent: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "failed");
      form.querySelectorAll(".field, .consent, #ind-submit").forEach((el) => { el.hidden = true; });
      status.textContent = data.status === "already_verified"
        ? "You're already on the list. Nothing more to do."
        : "Almost there. Check your inbox and click the link to confirm.";
      status.hidden = false;
    } catch {
      submit.disabled = false;
      fail("Something went wrong. Please try again in a moment.");
    }
  });
}
