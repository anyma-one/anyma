import {
  ashtakona, elementGlyph, tierCard, button, safetyNote, evidenceBadge,
} from "../ui/components.js";
import { hasCoreResult } from "../lib/storage.js";
import { observeReveals } from "../ui/reveal.js";
import { TIERS } from "../data/tiers.js";

const GLYPHS = [["ether", "Ether"], ["air", "Air"], ["fire", "Fire"], ["water", "Water"], ["earth", "Earth"]];

export function renderLanding({ app }) {
  const coreDone = hasCoreResult();

  app.innerHTML = `
  <div class="wrap-wide">
    <section class="hero">
      <div class="watermark" aria-hidden="true">${ashtakona({ size: 1200, spin: true, opacity: 0.05 })}</div>
      <div class="hero-inner">
        <div class="kick rv" style="--d:.05s">Individual ayurveda assessment</div>
        <h1 class="rv" style="--d:.13s">3000-year-old alchemy,<br>five elements, <span class="em">one reading</span></h1>
        <p class="lead rv" style="--d:.21s">Explore the world of Ayurveda, learn about dosha types, and see how
          ancient advice compares to our modern understanding of the body and mind.<br><br>
          What are you made of?</p>
        <div class="glyph-row rv" style="--d:.29s">
          ${GLYPHS.map(([k, l]) => `<div class="g-item">${elementGlyph(k, 30)}<span class="elabel">${l}</span></div>`).join("")}
        </div>
      </div>
    </section>

    <div class="section-head rv">
      <div class="row">
        <h2>Deepen Your Exploration Step by Step</h2>
        <span class="hr"></span>
        <span class="note">From core type, to wellbeing and beyond</span>
      </div>
    </div>

    <div class="tier-grid rv" style="margin-top:18px">
      ${tierCard({ ...TIERS.core, meta: "Free · 20 questions" })}
      ${tierCard({
        ...TIERS.full,
        meta: coreDone ? "Free · core type ready" : "Locked · core type required",
        fullStart: coreDone, blocked: !coreDone,
      })}
      ${tierCard(TIERS.individual)}
    </div>

    <div class="cta-row rv" style="margin-top:32px">
      ${button("Begin your reading →", {
        variant: "primary", size: "lg", href: "#/core", link: true, extraClass: "btn-shine",
      })}
      <span class="cta-note">Reveal your core type, test your well-being and fine-tune your results.</span>
    </div>

    <div class="bento rv">
      <div class="dosha-depth">
        <h3>How It Works</h3>
        <div class="step">
          <div class="mlabel">Step 01 · Determine Your Dosha Type</div>
          <p>Twenty short questions across body, digestion, sleep, energy and temperament let you
            determine your core dosha type. This is the base for Ayurvedic advice and life.</p>
        </div>
        <div class="step">
          <div class="mlabel">Step 02 · Test Your Wellbeing</div>
          <p>You might have a core type and be living by core principles, but life is messy and things
            change. Ayurveda knows that too, which is why you can test for imbalances.</p>
        </div>
        <div class="step">
          <div class="mlabel">Step 03 · Fine-tune Your Results
            <span style="text-transform:none;letter-spacing:.03em">(coming soon)</span></div>
          <p>Multiple-choice tests and catalogs allow only for limited depth. Explore and compare in an
            interactive dialogue the details of your conditions and possible remedies against your
            preferences and doubts.</p>
        </div>
        <div class="btn-row" style="margin-top:24px">
          ${button("Learn more →", { variant: "accent", size: "sm", href: "#/education", link: true })}
        </div>
      </div>

      <div class="dosha-depth">
        <h3>Compare Advice Against Evidence</h3>
        <p class="serif" style="font-size:15px;line-height:1.6;margin-bottom:14px">Ayurveda is a
          three-thousand-year-old holistic health system. Some of the ideas and advice remain helpful;
          others have proven to be contested under the lens of modern medicine.</p>
        <p class="serif" style="font-size:15px;line-height:1.6;margin-bottom:24px">To help you
          make your own decisions, we developed a ranking system. So you can see immediately which advice
          holds up against the evidence, which remains to be proven, and which ancient recommendations may
          even be harmful.</p>
        <div style="display:flex;flex-direction:column;gap:14px">
          ${evidenceBadge("supported", true)}
          ${evidenceBadge("promising", true)}
          ${evidenceBadge("traditional", true)}
          ${evidenceBadge("contested", true)}
        </div>
      </div>
    </div>

    <div class="dosha-depth rv" style="padding:32px 40px;margin-top:24px">
      <h3 style="font-family:var(--font-display);font-weight:500;font-size:30px;margin-bottom:24px">Good to Know</h3>
      <div class="gtk">
        <div>
          <div class="mlabel">Tendencies, not tests</div>
          <p>These are traditional associations, not medical measurements. Dosha typing has no validated
            biological ground truth — even experienced practitioners often disagree — so the reading
            describes tendencies, it does not diagnose anything.</p>
        </div>
        <div>
          <div class="mlabel">No better type</div>
          <p>There is no better or worse constitution, and most people are a blend of two. The point is to
            recognise your own patterns in energy, digestion and temperament — not to score well.</p>
        </div>
        <div>
          <div class="mlabel">Useful, held lightly</div>
          <p>Treat a reading as a lens, not a verdict. Food, routine, warmth and rest are low-risk to try
            and easy to reverse. Anything you'd take — herbs, supplements — is where real caution belongs.</p>
        </div>
      </div>
    </div>

    <div class="rv" style="margin-top:48px">
      ${safetyNote("This is education, not medical advice.",
        "A constitutional reading can't diagnose or treat anything. Don't start, stop or change a medicine, supplement or herb based on it — and if a symptom worries you, or you're pregnant, on medication, or managing a condition, see a qualified clinician first.")}
    </div>
  </div>
  `;

  observeReveals(app);
}
