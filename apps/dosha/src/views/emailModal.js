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
    <p class="serif" style="font-size:15px;color:var(--ink-soft)">Full Reading is free. We ask for an
      email so your reading has a home you can return to. Your Core result
      (<strong style="color:var(--ink)">${escapeHtml(label)}</strong>) is carried forward — you'll only
      answer the present-tense questions.</p>
    <form id="email-form" novalidate style="margin-top:18px">
      <div class="field">
        <label for="email">Email address</label>
        <input type="email" id="email" name="email" autocomplete="email" placeholder="you@example.com" required />
        <p class="hint">Educational content only. No diagnosis, and nothing here is medical advice.</p>
        <p class="error" id="email-error" hidden>Please enter a valid email address.</p>
      </div>
      ${button("Start the current-state pass →", { variant: "primary", size: "lg", attrs: 'style="width:100%"' })}
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
    closeModal();
    if (typeof onDone === "function") onDone();
  });
}
