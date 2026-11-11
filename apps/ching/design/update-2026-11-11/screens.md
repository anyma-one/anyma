# Screens

Seven screens in one flow: Landing → Question → Cast (toss) → Reading (unfolds on the same page) → Make It Yours (dialogue), plus Learn. Every screen has a header (CHING mark left, page label or nav right) and the footer (About · Imprint · Data & Privacy).

Reference renders: `reference/NN-<screen>-<desktop|tablet|mobile>.jpg`. Interactive prototypes: `prototypes/<Screen>.dc.html` (desktop), `M-…` (390px), `T-…` (768px). Breakpoints: tablet ≤ 960px, mobile ≤ 720px.

## 1. Landing (`Main`)
- Hero: "Learn to Cast and Read The I Ching" + lede; the bagua ring (eight trigrams in bronze, rotates in from −45° over 2.6s on load) beside it on desktop, below on mobile (260px).
- "Choose Your Level of Depth": three LevelTiles (Level I Quick Cast · free, Level II Deep Cast · sign-up, Level III Full Cast · one-time payment). Desktop hover per LevelTile. Touch: red on scroll.
- "What is the I Ching?" paper sheet with a bronze "learn more →" to Learn.
- Each tile links to Question with its level.

## 2. Question
- "What Is Your Question?", intro line, a textarea (placeholder "Type Your Question Here.", empty by default, underline turns bronze on focus).
- "begin the cast →" (important) below the field; disabled until there is text. Mobile: full width, pinned to the bottom.
- Yes/no detection: if the question reads as yes/no, show the "Are You Sure?" note (lacquer panel; mobile: bottom sheet) with keep (bronze), rephrase (bronze), learn more (ghost).
- Guidance column "A good question" with four numbered tips (right on desktop, below on tablet and mobile).
- Repeat question: a note that the user has asked this before, with "cast again" (important) and "return to my first reading" (regular).

## 3. Cast (toss), level Quick Cast
- Automatic six-toss sequence; see `motion.md`.
- Desktop: progress row, coins, count under the coins; hexagram builds in the right column with its eyebrow "Your cast · bottom line first" and the hint "A hexagram is built from the bottom up, one line per toss."
- Tablet and mobile: progress row ("Heads 3 · Tails 2" pinned right), coins left with the count right behind a fixed rule, hexagram below (hint hidden). Mobile fits 390 × 844 with no scrolling.
- Header right: level name and "Skip to my reading →" (jumps to the reveal).
- Deep Cast variant: the user starts each toss with a button, then answers the coin sum (6/7/8/9 choice buttons, "Show me how" opens the coin table), then finds the lower and upper trigram from eight choices ("Skip this step" allowed).

## 4. Reading (same page, after the reveal)
Paper sheet with the margin column (desktop) or one column (tablet/mobile).
1. Header: seal (152px desktop, 96px tablet/mobile), "Your hexagram · 03", name (e.g. "Beginning"), "Zhūn 屯 – Beginning", "Classic Translation by Wilhelm: Difficulty at the Beginning" (desktop: in the header; tablet/mobile: under the Traditional Meaning heading). Tablet: seal, name block and hexagram share one row.
2. Hexagram figure beside "Traditional Meaning" + its text (paragraph rule applies).
3. Rule, then "Image" + text beside the upper and lower trigram pair (drawn bars + English name + pinyin and hanzi).
4. Quick Cast only: DeepCastNote.
5. 2px bronze rule.
6. Deep Cast and up: FramingNote (cinnabar), copy keyed to the changing-line count.
7. Dropdowns: In Few Words (Beneficial / Beware), Modern Meaning, Reflection (three numbered questions), Changing Lines (Deep: changing ones; Full: All Six Lines, each "Line n · position" with its text; the changing one tinted), Second Hexagram (Full only: its seal, name, figure beside Traditional Meaning, trigrams beside Image, Modern Meaning). Locked ones show the padlock and tier.
8. Margin column: CastRecord ("Your cast · one changing line"), then NextBox ("Next · Deep Cast" or "Next · Full Cast"; on Full Cast "Make It Yours" with "begin level III →").
9. Below the sheet on the dark ground, centred: "The Final Stage", its line, "begin →" (Full Cast → dialogue; other levels → the Full Cast modal).
10. GateModal for sign-up (Deep) and unlock (Full); see `components/GateModal.md`.

## 5. Make It Yours (`Dialogue`)
- Headline "Make It Yours", intro "Ask about your reading, or tell me more about your situation. I'll stay close to the texts and won't simply tell you what you want to hear."
- Conversation log; empty state shows "Start with" and three starter questions.
- Input "Ask about your reading" with a bronze send button (52px square).
- "Your reading" summary card (paper): question, seal, "Hexagram 03 → 24", name, small figure, the changing line text, "[Open the full reading] →". Mobile: at the top, collapsed.
- [Placeholder: the dialogue backend and its guardrails are out of scope for the design.]

## 6. Learn (`Resources`)
- "Learn" with a numbered list of 8 sections; the selected section renders on a paper sheet with previous/next links at the bottom.
- Content from `resources/*.md`; section 02 is split (see `copy-overrides.json`). Wide tables scroll sideways with a sticky first column.
- Mobile: the list collapses into a "Section 02 of 08 · <title> ▾" selector.

## Not designed yet (placeholders)
Sign-up fields and copy · payment mechanism and price · the Learn target of the question screen's "learn more" · whether the reading keeps both Level III calls to action · logo on paper and cinnabar · the Wilhelm line position on desktop.
