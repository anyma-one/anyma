# Ching: design handoff

Everything needed to design the screens and the casting animation for **ching**, the I Ching app in the anyma family (`anyma.one/ching`).

**Read in this order:**
1. This document: screens, the casting animation, the guided cast, components and states.
2. `iching-project-brief.md`: positioning, audience, voice, tiers and the reasoning behind them. This document doesn't repeat it.
3. `data/sample-casts.json`: four complete example casts with real content per level. Design with these, not placeholder text.

All content is written. Where this document says **open**, it's a design decision for you to propose; everything else is decided.

---

## 1. The product in one paragraph

A web app that teaches people to cast and read the I Ching by doing it. The user asks a real question, casts six lines with three coins, and receives a reading. There are three levels: **Quick Cast** (free, automatic cast, a first glimpse), **Deep Cast** (free, the user casts and learns to read), **Full Cast** (paid, one-time: the complete reading plus an AI dialogue). The tone is calm, deliberate and text-forward: a serious tool that happens to be beautiful, not a fortune-telling toy. The tradition consulted the I Ching rarely, for things that mattered, and the pacing should feel like that.

---

## 2. Inputs and constraints

**Brand (anyma family)**
- Type: **Cormorant Garamond** (display, reading) and **Hanken Grotesk** (interface), as used across anyma.
- Chinese characters need a CJK serif fallback; Cormorant has none. Suggestion: Noto Serif TC. Mark Chinese text with `lang="zh-Hant"`.
- The hexagram Unicode glyphs (䷀ to ䷿) are poorly supported in many fonts. Draw hexagram figures from line components; use the glyph only for small inline references, with a symbol font fallback.
- Colors: **open.** Working values so far: seal red `#B3261E` and paper `#FBF7F0`. soul uses a deep night blue (`#0A1124`). Propose a palette with light and dark modes. The seals must work on it (see §7).

**Platform**
- Mobile-first web, also used on desktop. Single reading column on mobile; comfortable line length (about 60 to 70 characters) on desktop.
- Text-forward: typography is the main design surface.

**Do / don't**
- Do: stillness, weight, settling, generous space, a real pause before reveals.
- Don't: slot-machine energy, spinning blurs, confetti, glowing "mystic" effects, gamified badges.

---

## 3. Flow

```
Landing ──► choose level ──► Question ──► Cast ──► Reading ──► (upgrade)
                                     Quick: automatic animation
                                     Deep:  guided cast (§6)
```

**Decided**
- Quick Cast and Deep Cast are free. Full Cast is a one-time payment.
- Full Cast completes the user's **current** Deep Cast reading (no new cast). The prompt appears at the second-hexagram teaser in the Deep Cast reading.
- Re-casting the same question isn't blocked; a gentle note appears (copy `recast`).

**Open**
- Where the level choice sits: on the landing page (soul's "How deep do you want to go?" pattern; copy exists for this) or after the question.
- Upgrading Quick Cast to Deep Cast: Deep Cast means casting yourself, so the upgrade starts a new cast of the same question. In that case the re-cast note must **not** appear.
- Whether Full Cast can be chosen up front, before casting.

---

## 4. Screens and content slots

Copy keys refer to `data/copy.json`; data fields to `data/hexagrams.json`. Section headings and small labels (Judgment, Image, "Line {n}", "Wilhelm: {wilhelm}" and so on) are in `labels`. Real examples of every slot are in `data/sample-casts.json`.

### 4.1 Landing
- `landing.eyebrow`, `landing.headline`, `landing.subhead`
- Level cards from `levels` (name + one-line description, in order)
- `landing.learnLink` to Resources

### 4.2 Question
- `question.heading`, `question.threshold` (the "rare and weighty" line), text field with `question.placeholder` and a character count (limit 500; over it, `question.tooLong`), `question.guidance` (4 short tips)
- Yes/no notice, shown inline when the question starts with Will/Should/Is/Can and similar: `question.yesNoNotice` (text, example, two buttons). It never blocks.
- Re-cast note (modal or inline): `recast`

### 4.3 Casting (Quick Cast)
The automatic animation. See §5. Copy: `cast.progress`, `cast.buildNote`, `cast.beforeReveal`, `cast.skip`.

### 4.4 Quick Cast reading
In reading order:
1. The user's question (pinned, quiet)
2. **Identity:** seal · number · Huang name (primary) · pinyin and character · "Wilhelm: …" (smaller reference) · trigrams, upper over lower
3. The cast figure, with changing lines marked (§5.3)
4. **Judgment** (37 to 71 words)
5. **Image** (23 to 51 words)
6. Honest frame: `tier1.honestFrame`, then `tier1.cta`

### 4.5 Guided cast (Deep Cast)
See §6.

### 4.6 Deep Cast reading
1. Question, identity, figure (as 4.4)
2. Changing-line framing, by count: `changingLines.zero|one|several|all.tier2` (hexagrams 1 and 2 use `tier2_hex1_2` when all six change)
3. **Beneficial / Beware** pair (one line each, 6 to 15 words). Always together, never one alone.
4. **Meaning** (93 to 146 words), the main teaching text
5. **Reflections**: `tier2.reflectionsHeading`, three short questions (`reflections`), then `tier2.selfReadingNote`
6. **Changing lines**: the text of each changing line, bottom to top, labelled by position ("Line 5"). 30 to 60 words each. Absent when nothing changes. Hexagrams 1 and 2 with all six changing also show `allChanging`.
7. Judgment and Image remain available (open: shown in full or collapsed)
8. **Second-hexagram teaser** (when any line changes): its glyph and name, `tier2.secondHexagramTeaser`, a locked block for its Meaning, `tier2.secondHexagramCta`. Absent when nothing changes.

### 4.7 Full Cast gate
`gate.heading`, `gate.body`, `gate.payment` (price is a placeholder), `gate.cta`, `gate.keep`. For casts without changing lines, use `gate.noSecond` instead of the second-hexagram promise.

### 4.8 Full Cast reading
1. Question, identity, figure
2. Framing: `changingLines.*.tier3`
3. The **transformation**: first hexagram becomes second as the changing lines flip (§5.4)
4. **All six lines** as one story, bottom to top, changing lines highlighted (not by color alone)
5. **Second hexagram**: identity, Judgment, Image, Meaning
6. Everything else from Deep Cast stays available (Meaning, Beneficial / Beware, reflections). Full Cast's framing replaces Deep Cast's, the six lines replace the changing-line list, and the purchase teaser disappears.
7. Entry to the dialogue

### 4.9 Dialogue
Chat interface. `dialogue.heading`, `dialogue.intro`, `dialogue.privacy` (needs a visible place near the input), `dialogue.placeholder`, three starters from `dialogue.startersByCount` (`zero`, `one` or `several`, by the number of changing lines). The conversation opens with an automatic first reply from the companion; the person doesn't type first. The reading stays reachable (side panel on desktop, collapsible on mobile: **open**). Errors: `errors.dialogueUnavailable`.

### 4.10 Resources
Index (`resources.pages`) and a long-form page template for the seven Markdown pages in `resources/`. They include tables (a 64-row hexagram table and an 8×8 trigram grid in `02-gua-table.md`), so the template needs good table styling and must handle wide tables on mobile.

---

## 5. Casting animation

The emotional center of the app. One cast is six tosses of three coins; each toss produces one line, and the hexagram is built **from the bottom up**.

### 5.1 The rule that matters most
The coin faces shown must be the **actual result** of the cast logic (`cast.js`, which simulates three fair coins; in this package `code/cast.js`, in the build kit `src/lib/cast.js`). Never animate random faces and pick a line afterwards. The odds are uneven on purpose: changing lines come up 1 time in 4, and each line type has its own frequency. The animation is showing a real event.

### 5.2 One toss
1. **Toss:** three coins rise and turn.
2. **Land:** they settle, each showing one face. The two faces must be clearly different: one side counts **3** (heads, the yang side), the other **2** (tails, the yin side).
3. **Read:** the total appears (6, 7, 8 or 9).
4. **Draw:** the line draws into its slot above the previous one.
   - 7 → solid line · 8 → broken line · 9 → solid, marked as changing · 6 → broken, marked as changing
5. **Hold** briefly, then the next toss.

After line 6: a real pause, then the reveal (`cast.beforeReveal`), then the seal and name.

### 5.3 Line notation
- Solid line: one bar. Broken line: two bars with a gap.
- Changing lines carry a mark: traditionally **○** on a changing solid line (9) and **×** on a changing broken line (6). Never mark changing lines with color alone.
- Show the marks in Quick Cast too (recommended): they're a natural hook, since what they mean is explained in Deep Cast.

### 5.4 Transformation (Full Cast)
The second hexagram is the first with every changing line flipped: solid becomes broken, broken becomes solid. Animate only the changing lines, in place (a gap opening or closing), so the user sees exactly which lines moved.

### 5.5 Timing (recommendations, not rules)
- One toss: about 2 to 2.5 s in Quick Cast (toss ~1.0 s, settle ~0.4 s, total ~0.4 s, draw ~0.5 s).
- Whole cast: about 13 to 16 s, plus 1 to 1.5 s before the reveal.
- **Open:** a skip option (`cast.skip`) for returning users; recommended after a user's first full cast.
- Sound: off by default (**open** whether to offer it).

### 5.6 States
Idle · tossing · landed · total shown · line drawn · complete · reveal. Progress: six slots stacked bottom-up, filling as lines are drawn; `cast.progress`.

### 5.7 Reduced motion
With `prefers-reduced-motion`: no tossing or spinning. Coins appear showing their faces, the total appears, the line appears. Keep the pause before the reveal, shorter. All information must be readable without motion.

### 5.8 Later
Yarrow stalks may become a second casting method. Keep the toss step swappable rather than building the whole screen around coins.

---

## 6. Guided cast (Deep Cast)

The main teaching screen and the most interactive one. The user does each step; help fades as they learn.

**Start:** `guide.intro`, then `guide.toss`.

**Each toss (1 to 6):**
1. The user starts the toss (`guide.toss`, then `guide.tossAgain`). **Open:** shake-to-toss on mobile as an optional extra.
2. Coins land (as §5.2, with the real result).
3. The app asks `guide.askTotal`. The user answers (**open:** four buttons 6/7/8/9, or tapping the matching line type).
4. Feedback: `guide.correct` or `guide.incorrect` (shows the right total). Then `guide.lineIs` names the line type, and the line draws into place.
5. The first time a changing line appears: `guide.firstChanging`.

**Fading help (recommended):**
- Toss 1: the rule is shown up front (`guide.firstHint`), with the line-type table from `lineTypes` (coins, totals, line drawings, odds).
- Tosses 2 and 3: help on request (`guide.hintButton`).
- Tosses 4 to 6: no help unless the answer is wrong.

**After toss 6:** `guide.complete`. Then an optional step that teaches trigrams (recommended, skippable with `guide.findSkip`): `guide.findIntro`, then highlight lines 1 to 3 and ask `guide.findLower` with the eight trigrams as choices (a wrong choice shows the right one and moves on), then lines 4 to 6 with `guide.findUpper`, then `guide.found`, which reveals the hexagram's number. Trigram data: `data/trigrams.json`.

**Then:** `cast.beforeReveal`, the seal and name, and the Deep Cast reading (§4.6). Skipping the trigram step goes straight to `cast.beforeReveal`.

**Open:** whether returning users can switch the help off.

---

## 7. Components

- **Hexagram figure:** six line rows. Line states: empty slot, drawing, solid, broken, changing mark, highlighted, dimmed. Sizes: hero, inline, small. An accessible label describing the lines bottom to top.
- **Coin:** two distinct faces (3 and 2), tossing and landed states. The design is open; a round coin with a square hole is the traditional form.
- **Seal** (`seals/svg/NN.svg`): the hexagram's name in seal script, cut out of a red block. The cut-out is transparent, so the background shows through. Color comes from the CSS variable `--seal-color` (default `#B3261E`). Two shapes: **square** (viewBox 100×100) and **tall** (100×186) for the 15 two-character names (9, 13, 14, 21, 25, 26, 28, 34, 36, 37, 54, 61, 62, 63, 64). Layouts must handle both, including grids. `seals/contact-sheet.png` shows all 64.
- **Name block:** Huang name (primary, longest: "Establishing the New") · pinyin with tone marks and the character (never pinyin alone: several names differ only by tone) · "Wilhelm: …" smaller (longest: "Work on What Has Been Spoiled").
- **Trigram pair:** upper over lower, symbol plus name.
- **Text blocks:** Judgment, Image, Meaning, the Beneficial / Beware pair, reflection list, changing-line entries, honest-frame note, changing-line framing note.
- **Locked block:** shows that content exists but is locked, with a CTA. It uses placeholder bars, never the real text blurred (the real text isn't sent to this view). soul has a tiered-blur pattern; adapt it if it fits.
- **Second-hexagram teaser card:** glyph and name visible, Meaning locked.
- **Question display:** the user's question, pinned quietly above the reading.
- **Level cards** (three).
- **Notices:** yes/no notice (inline), re-cast note.
- **Chat:** messages, input, starter prompts.
- **Resource page:** long text, headings, tables, source lists.

---

## 8. States and edge cases

| Changing lines | How often | Second hexagram | Copy key |
|---|---|---|---|
| None | ~1 in 6 | No | `changingLines.zero` |
| One | ~1 in 3 | Yes | `changingLines.one` |
| Two to five | ~1 in 2 | Yes | `changingLines.several` (`{count}` = two to five) |
| All six | ~1 in 4,000 | Yes | `changingLines.all` (hexagrams 1 and 2 have their own variant) |

Also design for:
- Square and tall seals; long names on narrow screens.
- Text length ranges: Judgment 37 to 71 words, Image 23 to 51, Meaning 93 to 146, line texts 30 to 60.
- Locked vs unlocked versions of the same screen.
- Loading the dialogue; its errors (`errors.dialogueUnavailable`, `errors.limitReached`, `errors.messageTooLong`); checkout cancelled or failed (`errors.paymentCancelled`, `errors.unlockFailed`, `errors.storageRequired`); an empty reading page (`errors.noReading`); `errors.generic`.
- First cast vs returning user (skip, fading help).

---

## 9. Accessibility

- Reduced motion (§5.7).
- Changing lines marked by symbol, not only color; highlighted lines likewise.
- Contrast: check the knocked-out seal on the chosen backgrounds, and text on any tinted surfaces.
- Each seal SVG has a `<title>` with its characters; pair it with the hexagram name in visible text.
- Keyboard and screen-reader support for the guided cast (every step reachable without touch or shaking).
- `lang="zh-Hant"` on Chinese characters.

---

## 10. Open decisions, in one place

1. Palette, light and dark; how much of soul's night-sky look carries over.
2. Where the level choice sits; whether Full Cast can be chosen before casting.
3. The Quick Cast to Deep Cast upgrade (a new cast of the same question, without the re-cast note).
4. Skip animation for returning users; sound.
5. Answer format in the guided cast (totals or line types); shake-to-toss.
6. Judgment and Image in Deep Cast and Full Cast: full or collapsed.
7. The transformation visual in Full Cast.
8. Dialogue layout next to the reading.
9. Seal grids mixing square and tall seals.
10. Price and payment UI (mechanism follows soul's unlock).

---

## 11. Files

| File | What it is |
|---|---|
| `DESIGN-HANDOFF.md` | This document |
| `iching-project-brief.md` | Product brief: positioning, audience, voice, tiers, decisions |
| `data/sample-casts.json` | Four example casts (none, one, two, all six changing) with all content per level |
| `data/hexagrams.json` | All 64 hexagrams: names, lines, trigrams, texts, seal reference |
| `data/trigrams.json` | The eight trigrams |
| `data/copy.json` | All interface copy, by screen |
| `data/SCHEMA.md` | Field reference for the data files |
| `seals/svg/01.svg` … `64.svg` | The 64 seals |
| `seals/contact-sheet.png` | All 64 seals at a glance |
| `seals/CREDITS.md` | Seal sources and licences (all public domain or CC0) |
| `resources/*.md` | The seven Resources pages |
| `cast.js` | The cast logic the animation must follow: `code/cast.js` in the design package, `src/lib/cast.js` in the build kit |
