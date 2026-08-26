import {
  CONSTITUTION_QUESTIONS, CURRENT_STATE_QUESTIONS, LENS, INFO_POPUP,
} from "../data/questions.js";
import { buildOrders } from "../lib/shuffle.js";
import { profile } from "../lib/scoring.js";
import { saveCoreResult, armReveal } from "../lib/storage.js";
import { progressBar, ashtakona, button } from "../ui/components.js";
import { openModal, infoPopupHtml } from "../ui/modal.js";

const QUESTIONS = { prakriti: CONSTITUTION_QUESTIONS, vikriti: CURRENT_STATE_QUESTIONS };
const PASS_NOTE = {
  prakriti: "Your core type · Prakriti",
  vikriti: "Your current state · Vikriti",
};
const LETTERS = ["A", "B", "C", "D"];

function newSession(lensKey) {
  const questions = QUESTIONS[lensKey];
  return {
    lensKey, questions,
    orders: buildOrders(questions),        // shuffled once (hard constraint #1)
    answers: new Array(questions.length).fill(null),
    index: 0,
  };
}

export function renderQuiz(lensKey, ctx) {
  const { app, navigate } = ctx;
  const session = newSession(lensKey);

  // Build the shell ONCE. The background emblem lives in a persistent layer that is
  // never re-rendered, so it stays perfectly still (and keeps its rotation) as the
  // question content changes — no jump when an option is chosen. Only the option
  // tiles and buttons sit on solid fills over it; everything else is transparent.
  app.innerHTML = `
    <div class="wrap-quiz quiz-root">
      <div class="quiz-bg" aria-hidden="true">${ashtakona({ size: 640, spin: false, opacity: 0.06 })}</div>
      <div class="quiz-content"></div>
    </div>`;
  const contentEl = app.querySelector(".quiz-content");

  function draw() {
    const q = session.questions[session.index];
    const order = session.orders[q.id];
    const total = session.questions.length;
    const selected = session.answers[session.index];
    const answered = selected != null;
    const isLast = session.index === total - 1;

    const optionsHtml = order.map((optIdx, pos) => {
      const opt = q.options[optIdx];
      const on = selected === opt.dosha ? "true" : "false";
      return `<li>
        <button class="answer-option" type="button" data-dosha="${opt.dosha}" aria-pressed="${on}">
          <span class="ao-letter" aria-hidden="true">${LETTERS[pos]}</span>
          <span class="ao-label">${opt.text}</span>
        </button>
      </li>`;
    }).join("");

    // Prompt + options live in a fixed-height box so the nav row below does not move
    // between questions. Prompts run 1–3 lines (and option text wraps on narrow
    // screens), which was shifting the whole footer up and down question to question.
    contentEl.innerHTML = `
      ${progressBar(session.index + 1, total)}
      <div class="q-topline">
        <div class="kick">${q.dimension}</div>
        <button class="info-trigger" type="button" id="info-btn" aria-label="Why these questions?" title="Why these questions?">
          <span class="info-mark" aria-hidden="true">i</span>
        </button>
      </div>
      <div class="q-body">
        <h2 class="qh">${q.prompt}</h2>
        <ul class="options">${optionsHtml}</ul>
      </div>
      <div class="q-nav">
        <div class="back-slot">
          ${session.index > 0 ? button("← Back", { variant: "quiet", size: "sm", id: "back-btn" }) : ""}
        </div>
        <span class="mlabel pass-note">${PASS_NOTE[lensKey]}</span>
        <div class="next-slot">
          ${isLast ? button("Result →", { variant: "primary", size: "sm", id: "next-btn", attrs: answered ? "" : "hidden" }) : ""}
        </div>
      </div>`;

    contentEl.querySelectorAll(".answer-option").forEach((btn) => {
      btn.addEventListener("click", () => choose(btn.dataset.dosha));
    });
    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.addEventListener("click", back);
    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) nextBtn.addEventListener("click", next);
    document.getElementById("info-btn").addEventListener("click", () => openModal(infoPopupHtml(INFO_POPUP)));
  }

  // Selecting an option advances on its own — there is no Next button to press. The
  // short pause is deliberate: the chosen option fills in first, so the answer is seen
  // to register rather than the screen changing out from under the tap.
  //
  // The LAST question does not auto-advance. It reveals the "Result →" button instead,
  // so entering the reveal is always a deliberate act.
  const ADVANCE_MS = 210;
  let advanceTimer = null;
  let advancing = false;

  function choose(dosha) {
    if (advancing) return;                  // ignore taps during the hand-off
    session.answers[session.index] = dosha;
    // Update in place, never re-render: the background emblem sits in a persistent
    // layer and re-rendering the whole screen makes it visibly jump.
    contentEl.querySelectorAll(".answer-option").forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.dosha === dosha ? "true" : "false");
    });

    const isLast = session.index === session.questions.length - 1;
    if (isLast) {
      const nextBtn = document.getElementById("next-btn");
      if (nextBtn) nextBtn.hidden = false;
      return;
    }
    advancing = true;
    advanceTimer = window.setTimeout(() => {
      advancing = false;
      session.index += 1;
      draw();
    }, ADVANCE_MS);
  }

  function back() {
    if (advanceTimer) { window.clearTimeout(advanceTimer); advanceTimer = null; advancing = false; }
    if (session.index > 0) { session.index -= 1; draw(); }
  }
  function next() {
    if (session.answers[session.index] == null) return; // all questions required
    if (session.index < session.questions.length - 1) { session.index += 1; draw(); }
    else finish();
  }

  // Straight to the result — no loading interstitial. The reveal handoff is explicit
  // that the loader IS the result screen ("one continuous shot"), so the 1.6s holding
  // beat that used to sit here is now the first 1.6s of the emblem drawing itself.
  // `armReveal` is what tells the result view this is the reveal moment rather than a
  // return visit.
  function finish() {
    if (lensKey === "prakriti") {
      const prakriti = profile(session.answers);
      saveCoreResult({ label: prakriti.label, prakriti, answers: session.answers });
      armReveal("core");
      navigate("/core/result");
    } else {
      try { sessionStorage.setItem("anyma.vikriti.v1", JSON.stringify(session.answers)); } catch (_) {}
      armReveal("full");
      navigate("/full/result");
    }
  }

  draw();

  // Cancel a pending auto-advance if the route changes mid-hand-off, or the timer
  // fires against a screen that is no longer on display.
  if (app.__cleanup) app.__cleanup();
  app.__cleanup = () => {
    if (advanceTimer) { window.clearTimeout(advanceTimer); advanceTimer = null; }
    advancing = false;
  };
}
