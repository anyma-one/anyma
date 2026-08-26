# Anyma — Ayurvedic Constitution Reading (v1)

A mobile-first web app that reads a person's Ayurvedic constitution through a tiered
questionnaire, paired with an open, honest education layer. Built to the specs in this
folder (see `BUILD-README.md` and its linked documents).

## Running it locally

This machine has no Node, so the app is a **no-build static site** — plain HTML, CSS,
and vanilla ES-module JavaScript. It needs a tiny local server only because ES modules
don't load over `file://`.

```bash
cd "ANYMA DOSHA"
python3 serve.py        # serves http://127.0.0.1:8123/ with no-cache headers
```

Then open **http://127.0.0.1:8123/** in a browser. (Pass a port as an argument to
change it, e.g. `python3 serve.py 9000`.)

Any static server works; `serve.py` just adds no-cache headers so edits show on reload.

## What's built (v1)

- **Core Reading** (tier 1, free) — 20 constitution questions → one of 7 results.
- **Full Reading** (tier 2, free, email gate) — carries the Core result forward and runs
  a present-tense current-state pass → constitution + imbalance + per-dosha guidance.
- **Individual Reading** (tier 3) — scoped only; a locked "coming soon" slot in tier select.
- **Education module** — six sections, evidence library, safety, always free/ungated.

## Structure

```
index.html            App shell (header, persistent scope note, footer)
styles.css            Design system (earthy/grounded; three dosha identities; 4 evidence badges)
serve.py              No-cache static dev server
src/
  main.js             Hash router + route guards (Core-before-Full)
  data/               Verbatim content: questions, results, imbalance, guidance, education
  lib/                scoring.js (port of the spec reference), shuffle.js, storage.js
  ui/                 components.js (emblems, badges, splits, safety, disclaimer), modal.js
  views/              landing, tiers, quiz, constitution, coreResult,
                      emailGate, fullResult, education
                      (loading.js is unused — the reveal replaced the interstitial)
```

## Hard constraints, as implemented

1. **Randomised option order** — shuffled once per question at render; V/P/K mapping kept
   in data and never shown (`shuffle.js`, `quiz.js`).
2. **Constitution carried forward** — measured once in Core, stored, reused by Full;
   never re-asked (`storage.js`, guards in `main.js`).
3. **Prior answer never shown** — the current-state pass renders only current questions;
   Core answers are used solely for the final score comparison.
4. **Education & safety always free** — `/education` and all safety notes are ungated.
5. **No open chat box** — none anywhere; tier 3 stays locked.
6. **Never claim accuracy** — copy uses "more personal / more thorough" only.
7. **Herbs = education only** — they appear solely in the reliability section and the
   education library, with badges + safety pointers, never in Favour/Ease off.
8. **Disclaimer + risk routing** — the disclaimer shows with all guidance, and a
   self-declared safety check routes pregnancy / liver-or-kidney / medication users to a
   professional before the (still-educational) guidance is revealed.

## Design system (anyma · Dosha)

Styled to the high-fidelity handoff in `design_handoff_dosha_screens/`. `styles.css`
inlines the anyma token system (Spectral display serif, IBM Plex Sans, Courier Prime
mono via Google Fonts; warm paper + ink; one sage interactive voice; warm shadows,
paper grain, torn-edge plates). Components rebuilt from the `_ds` bundle as vanilla
JS/SVG in `src/ui/components.js`: the engraved **Ashtakona** emblem (counter-rotating
rings), **DoshaMedallion** (colour disc + white element glyph, with a dual/tridoshic
crossfade on the reveal), **ElementGlyph** ×5, **BlendBar**, the **elemental weave**,
dot-meter **EvidenceBadge**, letter-chip **AnswerOption**, **ProgressBar** with a
Lifelong/Right-now lens tag, **TierCard**, **ScopeNote**, **SafetyNote**. The wordmark
PNG lives in `assets/`. Fonts load from Google Fonts (needs internet; falls back to
Georgia / system-ui / monospace offline).

### Layout — framed vs full-bleed (matches the standalone prototypes)

The focused "reading" screens (question, Core reveal, Full reveal) render as a floating
paper **frame card** (radius 8, `0 34px 80px rgba(74,48,20,.24)` shadow) on the taupe
`#C9C0A8` canvas — exactly as the standalone prototypes show. The landing and browsing
screens (tiers, email, education) stay full-bleed paper. Toggled by a `framed` body
class in `src/main.js`; collapses to clean full-bleed under 720px.

### Where I diverged from the mock (to keep the earlier build contract's constraints)

- **No evidence badges on the Favour / Avoid rows.** The reveal mock shows an
  EvidenceBadge on every guidance row, but the guidance spec + hard constraint #7 say
  the action buckets carry no badges (herbs/evidence live only in the reliability
  section). Kept the constraint; badges stay in "How reliable is this?".
- **Guidance stays a Full Reading feature.** The mock puts a guidance plate on the
  Core/Prakriti reveal; per the logic spec, guidance is keyed to the current imbalance,
  so it appears in Full Reading. The Core reveal ends with the honest hook + upsell.
- **Elemental weave percentages are derived, not measured.** The five elements are the
  three dosha scores re-expressed through the classical mapping (Vata→Air+Ether,
  Pitta→Fire+Water, Kapha→Earth+Water), split **evenly** per dosha so no invented
  precision is implied. See `src/lib/elements.js`. (Can be made qualitative on request.)

### Fixes applied after the first design pass

- Column label is now **"Avoid"** (per your OK); plate title reverted to "General guidance".
- Removed the **lens pill** from the Core question screen (matches the mock); the
  current-state pass keeps its "Right now" pill + striped fill as its distinct chapter.
- Removed a **duplicate paragraph** on the Core reveal (the verbatim hook already said it).
- Element weave switched from invented ratios to the even split above.
- **Select-then-Next** interaction (per the question-flow mock) instead of auto-advance;
  all questions still required, no skip control.

## Decisions made during the build

- **Stack:** no-build static site instead of Next.js/Tailwind, because there's no Node
  runtime on this machine (installing one would require a restricted download). Same
  logic, content, and flow; no framework build step.
- **Email capture:** gated but **no backend** — the email is validated and stored
  locally only. Wiring a real provider is deferred (`api/subscribe` intentionally absent).
- **High-risk gate:** implemented as a self-declared safety check before the guidance
  (the 20 questions don't ask about pregnancy/liver/medication, so there's no quiz input
  to trigger it automatically).
- **No skips:** every question must be answered to reach a result; there is no skip
  control. Scoring still tolerates skips, but the UI can't produce them.

## Deferred / to tune (from the spec)

- Scoring margins in `src/lib/scoring.js` (`SINGLE_MARGIN`, `DUAL_MARGIN`,
  `IMBALANCE_MARGIN`) — provisional, to tune against real answer data.
- Reliability lines in `src/data/guidance.js` — first-draft copy, pending a UI pass.
- Individual Reading (tier 3) — full spec and build.
- Email backend integration.
