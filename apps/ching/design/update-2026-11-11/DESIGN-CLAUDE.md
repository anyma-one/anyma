# anyma CHING: design instructions for Claude Code

anyma CHING teaches people to cast and read the I Ching. A user asks a real question, casts three coins six times, and gets a reading that deepens over three levels: Quick Cast (Level I, free), Deep Cast (Level II, free with sign-up) and Full Cast (Level III, one-time payment). Build the product so it matches the approved designs exactly, at desktop, tablet and mobile sizes.

## Sources of truth, in order
1. **Decisions in `design/`** (this folder, approved 9 to 11 November 2026). They override everything below where they differ.
   - `design/screens.md`: every screen and its states, per breakpoint.
   - `design/components/*.md`: ten components, values and states.
   - `design/motion.md`: the toss, line and reveal timings, with the prototype's keyframes.
   - `design/tokens.css`: all design tokens (the design system plus this update). `design/responsive.css`: the responsive rules as plain CSS.
   - `design/copy-overrides.json`: every copy change against the handoff data files.
   - `design/reference/*.jpg`: renders of seven screens at 1280, 768 and 390px. When the text and a render disagree, the text wins; tell the user.
   - `design/prototypes/*.dc.html`: the canvas prototypes, for interaction reference only (see "Do not copy").
2. **The anyma CHING Design System** (README, tokens, components). Its rules hold unless this update changes them; the changelog doc lists each change as an old-rule and new-rule pair: https://claude.ai/artifact/Bvs2Sw669xRdMRSUVxLVxb
3. **The handoff data** (`ching-design-handoff/`): `data/hexagrams.json`, `trigrams.json`, `copy.json`, `sample-casts.json`, `resources/*.md`, `seals/svg/01..64.svg`, `code/iching.js`. Apply `copy-overrides.json` to it; never edit content beyond those overrides.

If something is not specified in any of these, do not invent it. Leave a visible placeholder in square brackets, e.g. `[Sign-up fields]`, and list it in your summary.

## Stack
[Placeholder: the target stack has not been chosen. Ask before scaffolding. Everything here is framework-neutral: CSS custom properties, semantic HTML, no CSS-in-JS assumptions.]

## Rules that are easy to get wrong
- **Title case** for headlines, section headings and dropdown titles ("Learn to Cast and Read The I Ching", "What Is Your Question?", "In Few Words"). Minor words (a, an, and, of, the, to, in, for, from, with…) stay lower case unless first or last, or after a colon. Body copy is sentence case. Mono labels are UPPERCASE via CSS.
- **Button labels are lowercase via CSS**, with a literal → after them. A Roman numeral stays capitals: wrap it so `text-transform` does not touch it ("begin level III").
- **Button colour means importance**: cinnabar `#991613` with white text for the one forward action; bronze `#B7884D` with ink text for regular actions; bronze ghost for secondary actions on lacquer; white ghost on cinnabar surfaces.
- **No em dashes** anywhere in UI copy. Use a spaced en dash only between a name and its translation ("Zhūn 屯 – Beginning").
- **No emoji.** Icons are the hexagram lines, Unicode trigrams, the seal, a 1px padlock and a literal arrow.
- **Text on cinnabar is white.** Text on paper is ink; on lacquer, bone.
- **Locked content is never blurred real text.** Show redacted bars and the tier name.
- **Level labels use Roman numerals** (Level I, II, III). Hexagram and line numbers stay zero-padded ("Hexagram 03").
- **The empty hexagram slot is one continuous 1px outline** the size of a drawn line, never two halves.
- **Coins land on the face that was cast**: whole turns only, no settle.
- **Paragraph rule** for long texts: keep author paragraph breaks; otherwise split texts over about 420 characters at sentence ends, about every 300 characters.
- **The changing line in the cast record is clickable**: it opens the lines dropdown, scrolls to that line and rings it for 1.8s.
- **Reduced motion** is required; see `motion.md`.
- **Accessibility**: tap targets ≥ 44px; focus ring 2px bronze at 3px offset; the modal traps focus and closes on Escape; the hexagram figure has a text label ("Hexagram figure, bottom to top: line 1 solid; line 2 broken, changing; …"); the mark's link is named "anyma CHING, home".

## Do not copy from the prototypes
The `.dc.html` files were built for a design canvas. They use a template runtime (`<x-dc>`, `sc-if`, `sc-for`, `{{ }}`), inline styles everywhere, build-time `ch-r-*` class hooks for responsiveness, and CSS `zoom` on the coins. Rebuild the behaviour natively with components, tokens and the rules in `responsive.css`. Take values from them, never structure.

## Definition of done for a screen
- [ ] Matches its reference renders at 1280, 768 and 390px (layout, sizes, colours, copy).
- [ ] Every string comes from the data files with `copy-overrides.json` applied, or from `copy-overrides.json` `ui-strings`.
- [ ] Uses tokens from `tokens.css`; no raw hex except where a token does not exist (then add the token).
- [ ] Keyboard and screen reader pass; reduced motion pass.
- [ ] No horizontal page scroll at 320px wide.
- [ ] Open placeholders listed in the PR description.

## Open decisions (ask, do not decide)
Sign-up flow and copy · payment mechanism and price · which Learn section the question screen's "learn more" opens · whether the reading keeps both Level III calls to action · the mark on paper and on cinnabar · the Wilhelm line's position on desktop.
