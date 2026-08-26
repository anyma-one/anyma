import { tierCard } from "../ui/components.js";
import { hasCoreResult } from "../lib/storage.js";
import { TIERS } from "../data/tiers.js";

export function renderTiers({ app }) {
  const coreDone = hasCoreResult();
  app.innerHTML = `
  <div class="wrap-wide">
    <a class="back-link" href="#/" data-link>← Home</a>
    <div class="kick">Choose your reading</div>
    <h1 style="font-family:var(--font-display);font-weight:500;font-size:46px;margin:16px 0 10px">Three Readings, One System</h1>
    <p class="serif" style="font-size:18px;max-width:56ch">Each builds on the one before it. Core Reading is
      the required starting point; the others deepen it, they don't replace it. Deeper does not mean more
      true, only more personal and more thorough.</p>

    <div class="tier-grid" style="margin-top:32px">
      ${tierCard({
        ...TIERS.core,
        meta: coreDone ? "Free · completed" : "Free · 20 questions",
      })}
      ${tierCard({
        ...TIERS.full,
        meta: coreDone ? "Free · core type ready" : "Locked · core type required",
        fullStart: coreDone, blocked: !coreDone,
      })}
      ${tierCard(TIERS.individual)}
    </div>
  </div>
  `;
}
