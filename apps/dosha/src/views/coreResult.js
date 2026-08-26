import { loadCoreResult, takeReveal, prefersReducedMotion } from "../lib/storage.js";
import {
  renderConstitution, wireMedallion, isRenderableProfile, prakritiReminder, CORE_REVEAL_MS,
} from "./constitution.js";
import { button, disclaimer } from "../ui/components.js";
import { GUIDANCE_DISCLAIMER } from "../data/guidance.js";
import { generalRecommendations, evidenceCurrency } from "./recommendations.js";

export function renderCoreResult({ app, navigate }) {
  const stored = loadCoreResult();
  // A stored reading must be complete and carry a label the result copy defines.
  // Anything else (empty answers, a reading written by an older scoring version)
  // sends the user back to the quiz rather than to a half-rendered reveal.
  if (!stored || !isRenderableProfile(stored.prakriti)) { navigate("/core"); return; }

  // Order: what your type is → what it is made of → what the tradition advises for it
  // and how well that holds up → the reminder that this is a constitution, not a
  // current-state reading → the way on. The reminder closes the page rather than sitting
  // between the type and the advice.
  // The 2A reveal plays on arrival from the quiz and nowhere else — `takeReveal` reads
  // the flag once and clears it, so a re-render or a return visit lands on the finished
  // frame. Reduced motion skips the choreography entirely rather than racing it to zero.
  const animate = takeReveal("core") && !prefersReducedMotion();

  app.innerHTML = `
  <div class="wrap">
    ${renderConstitution(stored.prakriti, {
      passLabel: "Core Reading · Prakriti",
      subline: "Your Dosha Type",
      animate,
    })}

    <hr class="dosha-rule" style="margin:40px 0 32px">
    ${generalRecommendations(stored.prakriti)}

    ${evidenceCurrency()}
    ${prakritiReminder(stored.prakriti)}

    <div class="upsell center">
      <div class="btn-row" style="justify-content:center;margin-top:30px">
        ${button("Take the full reading →", { variant: "primary", size: "lg", href: "#/full/start", attrs: "data-full-start" })}
        ${button("Retake the reading", { variant: "ghost", href: "#/core", link: true })}
      </div>
      <div class="btn-row" style="justify-content:center;margin-top:20px">
        <button class="btn btn-quiet btn-sm" type="button" id="share-btn">Share this result</button>
        <a class="btn btn-quiet btn-sm" href="#/education" data-link>Evidence &amp; safety</a>
      </div>
    </div>

    ${disclaimer(GUIDANCE_DISCLAIMER)}
  </div>`;

  if (app.__cleanup) app.__cleanup();
  app.__cleanup = wireMedallion(app, animate ? CORE_REVEAL_MS : 0);

  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: "anyma · Dosha — my Ayurvedic type",
        text: `My Ayurvedic constitution reads as ${stored.label}. It's a lens for noticing patterns, not a diagnosis.`,
        url: location.href,
      };
      try {
        if (navigator.share) await navigator.share(shareData);
        else {
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          shareBtn.textContent = "Copied";
          setTimeout(() => { shareBtn.textContent = "Share this result"; }, 2000);
        }
      } catch (_) {}
    });
  }
}
