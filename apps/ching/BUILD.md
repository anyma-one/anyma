# Ching: build spec

Build **ching**, the I Ching learning app, as a new app in the anyma monorepo, served at `anyma.one/ching`.

**Read first:**
1. This file: architecture, behavior, API, phases.
2. `design/DESIGN-HANDOFF.md`: screens, content slots, casting animation, guided cast, components, states. This file doesn't repeat it.
3. `design/iching-project-brief.md`: what the product is and why. Voice and positioning live here.
4. `data/SCHEMA.md`: the data files.

**Ground rules**
- All content is written and reviewed. Use `data/copy.json` and `data/hexagrams.json`; don't write new user-facing text. If a screen still needs copy that doesn't exist, add a clearly marked placeholder (`[COPY NEEDED: ...]`) and list it in your report.
- Don't change the cast logic's odds or the level rules. They're in `src/lib/` with tests.
- Where this spec says **open**, ask the project owner; don't decide silently. All open items are listed in §10.

---

## 1. Step 0: inspect the monorepo before writing code

The kit's author had no access to the repository, so find out and mirror from **soul** (the existing app at `anyma.one/soul`, also Vite + React on Vercel):

- Package manager, workspace layout, shared packages (UI, fonts, analytics, Supabase client), Node version.
- How soul is served under `/soul`: Vite `base`, Vercel rewrites, where its serverless functions live, and how non-route helper code is kept out of routing.
- soul's paid unlock: the `deepdive-unlock` flow (`/api/deepdive-unlock`): checkout type (redirect or in-page), how a purchase is verified and remembered, what Supabase stores, how the client proves the unlock on later requests.
- How soul calls the Anthropic API: shared helper, env var names, streaming format, prompt caching, the model IDs it uses (confirm `claude-sonnet-5-5` and `claude-haiku-5-5` there).
- Fonts (Cormorant Garamond, Hanken Grotesk), Vercel Analytics setup, lint and test tooling.

Write a short plan from what you find (where ching lives, what it reuses, what's new, how the kit's folders map onto the monorepo) and get the owner's OK before building.

---

## 2. Architecture

- **Vite + React SPA** at `/ching` (Vite `base: '/ching/'`), deployed like soul.
- **Quick Cast and Deep Cast run entirely in the browser.** No server calls.
- **Full Cast** adds two serverless functions: unlock and dialogue (§6).
- **Data:** import `data/hexagrams.json`, `trigrams.json` and `copy.json` statically. `hexagrams.json` is about 65 KB gzipped; bundling it is fine. You may strip `status` and `names.legge` at build time; keep `binary` (used by `indexByBinary`).
- **Seals:** 64 SVGs of about 5 KB each. Load on demand with `import.meta.glob('<path>/seals/svg/*.svg', { query: '?raw' })` keyed by hexagram number; don't fetch `seal.file` as a relative URL (it breaks on nested routes).
- **Resources:** the seven Markdown pages in `resources/`, rendered at build time (or `?raw` import plus a Markdown renderer). They contain tables, including a 64-row table and an 8×8 grid.
- **Server code:** the kit keeps server helpers in `api/_lib/`, so Vercel doesn't deploy them as routes (Vercel ignores files and folders starting with `_` under `api/`). If soul uses a different convention (for example a `server/` folder), follow soul. Tests must never sit in a routed folder.

### Core logic (provided, tested)
| Module | Purpose |
|---|---|
| `src/lib/cast.js` | Three-coin toss with the correct odds; `lineFromCoins()` / `lineFromTotal()`; `resolve()` for primary, second hexagram and changing lines |
| `src/lib/reading.js` | `buildReading(cast, level, data)`: the single source of what each level shows; `templateParts()` |
| `src/lib/question.js` | `MAX_QUESTION_LENGTH`; `isYesNo()` for the gentle notice; `isRecast()` for the re-cast note |
| `api/_lib/full-cast-prompt.js` | The dialogue system prompt (`SYSTEM_PROMPT_TEMPLATE`) and `OPENER` |
| `api/_lib/reading-context.js` | Server-side: `buildSystemPrompt()`, `prepareMessages()`, `readingId()`, input validation |

Tests: `npm test` (22 tests, Node 21+, no dependencies; they also run under Vitest with small import changes). Keep them in CI. One test rebuilds the four design sample casts exactly, so design and build can't drift.

Render what `buildReading()` returns. Don't re-decide in components what a level may show.

---

## 3. Routes

| Route | Screen |
|---|---|
| `/ching/` | Landing (level choice here unless the owner decides otherwise, §10) |
| `/ching/ask` | Question (the chosen level held in state) |
| `/ching/cast` | Quick Cast animation, or the Deep Cast guided cast |
| `/ching/reading` | The current reading, at the level reached. With no cast: `errors.noReading` and a link to ask |
| `/ching/learn` and `/ching/learn/:slug` | Resources. Slug = file name without the number prefix and `.md` (`history`, `gua-table`, `trigrams`, `how-to-cast`, `how-to-read`, `on-translation`, `why-divination`) |

**Never put the question in the URL**, analytics or logs (§6.4). Readings aren't shareable by link in this version.

---

## 4. State and persistence

- A cast is `{ question, level, lines }`, where `lines` are the six line objects from `castHexagram()`.
- **Persist coins, not just totals:** store `coins` per line (`[[3,2,2], ...]`) and rebuild with `lineFromCoins()`, so the faces survive a reload.
- Flow: `idle → asking → casting (toss 1–6) → complete → reading`. The reading is `buildReading(cast, level, data)`.
- **Question length:** the field enforces `MAX_QUESTION_LENGTH` (500) at every level, with a live character count; over the limit, show `question.tooLong` (fill `{max}`). The server checks the same constant.
- **localStorage**, every access wrapped in try/catch; the app must work without it, except for the Full Cast checkout (§6.1):
  - the current cast;
  - a history of up to 10 entries `{ question, level, coins, at }`, used for `isRecast()` and for "Return to my first reading" (`recast.goBack` loads the matching entry);
  - `labels.clearHistory` clears it.
- **Re-cast note:** compare against history entries inside the re-cast window (**open**, §10: per session or a time window). Don't show it when the user re-casts on purpose to upgrade.
- **Upgrades:**
  - **Quick → Deep:** a new guided cast of the same question.
  - **Deep → Full:** unlocks the **same** cast; no new cast.

---

## 5. Levels and gating

- `buildReading()` decides content per level. At Full Cast, Deep Cast's framing, changing-line list and purchase teaser are cleared (`null` / `[]`); Full Cast's framing, all six lines and the second hexagram replace them.
- **The second hexagram's Meaning never appears below Full Cast.** The Deep Cast teaser shows only its glyph and name (`reading.deep.secondTeaser`, with `parts` for styling the glyph). The "locked" block shows placeholder bars, never the real text.
- **Gating strength:** all hexagram texts ship in the public bundle (the Resources pages also list every hexagram), so hiding the second hexagram's texts in the browser is soft gating. That's acceptable: what costs money, and needs real server-side enforcement, is the dialogue.

---

## 6. Full Cast API

### 6.1 Unlock: `POST /api/ching-unlock`
Mirror soul's unlock flow (Step 0). One-time payment. Before starting checkout, save `{ question, level, coins }` to localStorage. If storage is unavailable, show `errors.storageRequired` and don't start checkout (unless soul's flow can hold the cast server-side under an opaque checkout id). Checkout returns to `/ching/reading`; a return token in the URL is fine, the question never is. On cancel: `errors.paymentCancelled`; on a failed verification: `errors.unlockFailed`.

**Open (§10):** price (`{price}` in copy), and what one purchase covers (one reading, several, all future readings). If one purchase covers one reading, bind the unlock to that cast at checkout (store `readingId`, §6.3).

### 6.2 Dialogue: `POST /api/ching-dialogue`
Request:
```json
{
  "unlock": "<whatever soul's flow uses to prove a purchase>",
  "question": "What should I understand about...?",
  "totals": [7, 8, 8, 8, 9, 8],
  "messages": [{ "role": "assistant", "content": "..." }, { "role": "user", "content": "..." }]
}
```
- `messages` holds only real turns, starting with the assistant's opening reply. The client never sends, shows or stores the opener. An empty array asks for the opening.

Server steps:
1. **Verify the unlock**, then compute `readingId(unlockId, {question, totals})` and check limits (§6.3).
2. **Validate:** `validateCastInput({question, totals})` and `prepareMessages(messages)`. That function checks roles, alternation, lengths (2,000 characters per message, `errors.messageTooLong`), and that the last message is the person's. It keeps the most recent 20 messages and returns them with the `OPENER` prepended, so the array sent to the API always starts with a user turn.
3. **System prompt:** `buildSystemPrompt({question, totals}, hexagrams)`. It builds the reading from the data files; **never use reading text sent by the client.** The question goes in delimited and flattened to one line.
4. **Call** the Anthropic Messages API with streaming. Model from env `CHING_MODEL`, default `claude-sonnet-5-5` (better at holding a position under pushback); `claude-haiku-5-5` is the cheaper option. `max_tokens` around 600 (replies are meant to be short). The system prompt repeats every turn, so use prompt caching if soul's helper supports it.
5. **Stream** the reply in soul's streaming format. If the model stops at `max_tokens`, show the text as it is. Record usage as described in §6.3.
6. **Errors:** non-2xx JSON `{ "error": "limit" | "unlock" | "invalid" | "unavailable" }`, mapped in the UI to `errors.limitReached`, `errors.unlockFailed`, `errors.messageTooLong` or `errors.generic`, and `errors.dialogueUnavailable`.

Show `dialogue.privacy` near the dialogue. Starter prompts: `dialogue.startersByCount.zero | one | several`, chosen by the number of changing lines.

### 6.3 Usage limits
A one-time payment against a per-message cost needs server-side caps. The mechanism is decided; the values are **open** (§10):
- A **reading** is `readingId = sha256(unlockId | totals | normalized question)` (`readingId()`); store only the hash, never the question.
- On every dialogue request, increment a server-side counter (Supabase, as soul) for the `readingId`, and track the unlock's set of distinct `readingId`s. Reject over the limit with HTTP 429 `{error:'limit'}`. The automatic opening counts as one message.
- Add up `input_tokens + cache_creation_input_tokens + cache_read_input_tokens + output_tokens` per day (with prompt caching, the system prompt is counted in the cache fields, not in `input_tokens`). Take input usage from the stream's `message_start` event and output usage from the final `message_delta`. Once the daily cap is reached, return 503 `{error:'unavailable'}`.
- Config: `CHING_MAX_MESSAGES_PER_READING`, `CHING_MAX_READINGS_PER_UNLOCK`, `CHING_DAILY_TOKEN_CAP`. If any is missing, the dialogue endpoint **fails closed** (503). No silent unlimited defaults.

### 6.4 Data handling
Store as little as possible: the hashed `readingId`, counters, the unlock record. Never log question or message text unless the owner approves dialogue logging (§10). Privacy-policy wording for EU users is the owner's decision.

---

## 7. Implementation notes

**Casting animation** (spec: DESIGN-HANDOFF §5)
- Get the result first (`castLine()`), then animate to **those** coin faces. Animation never decides results.
- Animate in order, bottom to top. Respect `prefers-reduced-motion`. Keep the toss step swappable (yarrow may come later).

**Guided cast** (spec: DESIGN-HANDOFF §6)
- Each toss: `castLine()` on the user's action, show the coins, ask for the total, check it, then draw the line. `{type}` is `LINE_TYPES[total].name` (lowercase).
- Track the help level per toss (full, on request, none) and whether the first-changing-line note has been shown.
- **Sequence after toss 6:** `guide.complete` → `guide.findIntro` → `guide.findLower` (on a wrong choice, show the correct trigram and continue) → `guide.findUpper` → `guide.found` (this reveals the number) → `cast.beforeReveal` → seal and name. Skipping (`guide.findSkip`) goes straight to `cast.beforeReveal`.
- Fully keyboard-operable; shake-to-toss only as an extra.

**Copy**
- Tokens: `{count}` (filled by `reading.js`), `{glyph}`, `{name}`, `{wilhelm}`, `{n}`, `{total}`, `{type}`, `{number}`, `{max}`, `{price}`. `_placeholders` in `copy.json` explains each. For a styled glyph, render `secondTeaser.parts`, or use `templateParts()` for other templates.
- Section headings and small labels: `labels.*`.
- Wrap Chinese text in `lang="zh-Hant"`.

**Seals**
- `hexagram.seal.shape` is `square` or `tall`. The red comes from the CSS variable `--seal-color`, which applies only when the SVG is **inlined**.
- Each file uses the mask id `seal-mask-NN`. If you inline the same seal twice on one page, make the ids unique.

**Hexagram figures:** draw from `hexagram.lines` with components, not the Unicode glyphs (poor font support).

**Design:** screens come from Claude Design. Until they arrive, build with a plain, neutral baseline driven by CSS custom properties (colors, type scale, spacing), so the design can be applied without rewriting components. Don't invent a visual style.

**Analytics:** Vercel Analytics as in soul. Suggested events: level chosen, cast completed (level, changing-line count), guided answer (correct or not, toss number), upgrade clicked, unlock completed, dialogue message sent. Never send question or message text.

---

## 8. Accessibility

DESIGN-HANDOFF §9, plus:
- The cast figure has a text equivalent (hexagram name; lines described bottom to top, changing lines named).
- A live region announces each new line during the cast.
- Focus moves sensibly between cast steps and to the reading.
- Contrast checked on the final palette, including the seals.

---

## 9. Phases and acceptance criteria

**Phase 0: setup.** Step 0 findings and plan approved. ching runs locally at `/ching`, deploys to a preview, `npm test` passes in CI.

**Phase 1: Quick Cast and Resources.**
- Landing → question → animated cast → Quick Cast reading, on mobile and desktop.
- Question length limit with counter; yes/no notice and re-cast note behave as specified, and neither blocks.
- Reading shows identity, seal, figure with changing marks, Judgment, Image, honest frame, Deep Cast CTA.
- All seven Resources pages render at their slugs, tables included, readable on mobile.
- Reduced motion works; a reload keeps the current reading with its coin faces.

**Phase 2: Deep Cast.**
- Guided cast with real coins, answer checking, fading help, the first-changing-line note, the trigram step in the specified order.
- Reading matches `buildReading(..., 'deep')` for all four changing-line cases (force them in development with the coins from `data/sample-casts.json`).
- Teaser and Full Cast gate shown when there's a second hexagram; the gate's `gate.noSecond` variant otherwise. The second hexagram's Meaning appears nowhere in the Deep Cast view.
- Quick → Deep upgrade works without the re-cast note.

**Phase 3: Full Cast.**
- Unlock mirrored from soul, verified server-side, survives the checkout round trip and a reload; cancel and failure states.
- Full reading: transformation, all six lines, second hexagram; no duplicated framing and no purchase prompt.
- Dialogue: streaming, automatic opening, history contract enforced, limits enforced server-side and failing closed, privacy notice, error and limit states, count-appropriate starters.
- The manual prompt checks in `api/_lib/full-cast-system-prompt.md` pass, including: a crisis-worded **question** produces a supportive, non-interpretive opening.

**Phase 4: polish.** Design applied from Claude Design, analytics, accessibility pass, performance (seals load on demand, no layout shift during the cast).

---

## 10. Open items for the owner

1. Price, and what one purchase covers (one reading, several, all).
2. Usage limit values: messages per reading, readings per unlock, daily token cap.
3. Whether to log dialogues; privacy-policy wording.
4. Model choice (`claude-sonnet-5-5` default vs `claude-haiku-5-5`).
5. Where the level choice sits (landing or after the question), and what picking Full Cast up front does. Default until decided: run the Deep Cast guided cast, then show the gate.
6. The re-cast window: per session, or a time window.
7. Visual design (coming from Claude Design).

---

## 11. Files in this kit

| Path | What it is |
|---|---|
| `BUILD.md` | This spec |
| `CLAUDE.md` | Short conventions file to place in the app folder |
| `package.json` | Test script and Node version (merge into the app's own package.json) |
| `design/DESIGN-HANDOFF.md` | Screens, animation, guided cast, components, states |
| `design/iching-project-brief.md` | Product brief |
| `data/` | `hexagrams.json`, `trigrams.json`, `copy.json`, `sample-casts.json`, `SCHEMA.md` |
| `src/lib/` | `cast.js`, `reading.js`, `question.js`, tests |
| `api/_lib/` | `full-cast-prompt.js`, `reading-context.js`, `full-cast-system-prompt.md` (how the prompt works, manual checks), tests |
| `seals/` | 64 SVGs, `manifest.json`, `CREDITS.md`, contact sheet |
| `resources/` | Seven Markdown pages |
