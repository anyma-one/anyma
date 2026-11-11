# I Ching Learning App — Project Brief

A working brief for building the design system. It captures what the product is,
who it's for, how it feels, what's on each screen, and every state the UI has to
handle. Content voice and tier logic are settled; visual direction is left open,
with constraints noted where a decision has already been made upstream.

---

## 1. What it is

A web app that teaches people to cast and read the I Ching by letting them do it,
one guided reading at a time. The user types a real question, performs a
divination with an animated coin cast, and receives a reading that gets deeper
as they move up the tiers.

**Core loop:** ask a question → cast (animated) → receive a reading → learn how
the reading was built → (optionally) go deeper.

This is not a fortune-telling toy. The goal is genuine literacy: by the end, a
motivated user can cast and interpret on their own.

---

## 2. Positioning & philosophy

This decides tone before it decides pixels.

- **Learning-first.** The product teaches a skill. Every mystical-feeling moment
  is also a teaching moment. Curiosity does the work that belief would otherwise
  have to.
- **The psychology layer is the differentiator.** Rather than asking users to
  believe, the app teaches *why the mind responds* to divination: narrative,
  meaning-making, the pull to find pattern. This converts the skeptic's
  objection into content. It threads through the whole experience.
- **"Rare and weighty," not casual.** Part of the education is that the I Ching
  was historically consulted rarely, for important decisions, not as daily
  entertainment. This is a deliberate contrast with how Tarot apps have
  positioned themselves, and it should be felt in the pacing and restraint of
  the interface. The cast is a considered act, not a slot pull.
- **Curiosity over blind faith.** The stance is honest throughout. Where a
  reading is generic, the app says so. Honesty is the hook, not a disclaimer.

**Design implication:** calm, deliberate, textual, a little ceremonial. Avoid
casino/slot-machine energy, avoid neon "mystic" clichés. The feeling to aim for
is a quiet, serious tool that happens to be beautiful, not an entertainment
product cosplaying depth. (Directional, not prescriptive — the palette is yours.)

---

## 3. Audience

Two groups with a real tension:

- **Curious skeptics** respond to the "structured mirror for reflection" framing
  and the psychology layer.
- **Mystically inclined** users want the ritual and the sense of contact.

The app leans toward the first group without alienating the second. The learning
frame and the honest voice serve skeptics; the ritual pacing and evocative
classical texts serve the mystically inclined. One voice has to hold both, which
is why the writing is warm and grounded but keeps the imagery.

---

## 4. Voice & tone (locked)

All written content follows one voice:

- **Grounded + imagistic.** Plain, modern, direct, but it keeps the nature
  imagery of the source (seeds, thunder, water, mountains) and glosses it rather
  than dropping it.
- **Speaks to "you."** Second person, warm, never clinical.
- **Ritual weight dropped.** No archaic solemnity, no "thus the sage." Modern
  register.
- **Fuller and reflective.** Room to breathe, a few sentences per idea, not
  terse.
- Original paraphrase throughout, faithful to each hexagram's traditional
  meaning but not lifting any copyrighted translation. One consistent voice
  across all 64.

**Sample (Hexagram 3, "Difficulty at the Beginning," Meaning field):**

> Something new is genuinely beginning, and it's hard in the way that only real
> beginnings are. Picture a seed that has cracked open underground but hasn't yet
> broken the surface. There's life in it, real momentum, but it's pushing through
> dense, tangled ground... The difficulty you feel isn't a sign you've chosen
> wrong; it's the friction of growth itself.

**Design implication:** typography and layout should support reading, not
skimming. This is a text-forward product. The words carry the experience;
type is a primary design surface, not decoration around graphics.

---

## 5. The tier system

The single most important structure for design. Same content everywhere; tiers
only gate *what is shown when*. The tier walls are where paywall, unlock, and
upsell UI live.

| | Tier 1 · **Quick Cast** (free) | Tier 2 · **Deep Cast** (free) | Tier 3 · **Full Cast** (paid) |
|---|---|---|---|
| **Tagline** | A first glimpse of your hexagram. | Cast it yourself and learn to read it. | The whole story of your cast, read with you. |
| **What the user does** | Types a question, watches an automatic cast | Performs the cast: tosses the coins, reads them, places each line | Reads the complete cast and talks it through in a dialogue |
| **Shown** | Seal, name, trigrams, **Judgment**, **Image**, the cast figure | Everything in Quick Cast + **Meaning**, **Beneficial / Beware**, **reflection prompts**, the **changing-line texts**, and the second hexagram's **name and glyph** as a teaser | Everything in Deep Cast + the **second hexagram** with its Meaning, **all six lines** with changing lines highlighted, and the AI dialogue |
| **Locked** | Meaning, lines, second hexagram | Second hexagram's Meaning, full line reveal, dialogue | — |
| **Purpose** | The hook. Evocative but cryptic, creates the itch | The real teaching payload. Learn by doing | Application and synthesis |
| **Payment** | — | — | One-time payment; sign-up prompt at the Deep Cast teaser. Mechanism open (reuse soul's unlock) |

**Tier 1 honest frame:** the Judgment and Image are deliberately cryptic. A
one-line honest note (`tier1.honestFrame` in `copy.json`: the traditional texts
in a modern rendering, the same for everyone; reading them for your own question
is what Deep Cast is for) turns the crypticness into an invitation rather
than a wall. This "honest frame" is a recurring UI pattern, not a one-off.

**Cross-cutting:** the psychology/education content (why divination works,
meaning-making, historical rarity) is not a tier. It threads through as
interstitials or a dedicated Learn section.

---

## 6. Content types

Every hexagram carries these fields. Designers should treat each as a distinct
content block with its own tone and placement.

- **Identity** — number (1–64), Chinese glyph (e.g. ䷂), name (pinyin + Chinese +
  translation comparisons), the two trigrams. *Tier 1.*
- **Judgment** — short, evocative, slightly cryptic core text. *Tier 1.*
- **Image** — a nature scene plus a response to it ("Thunder stirs below and
  clouds gather above..."). Evocative. *Tier 1.*
- **Meaning** — the plain-language guided reading. The main teaching text.
  *Unlocked in Tier 2.* (Named "Meaning," settled.)
- **Line texts** — six short texts per hexagram, bottom to top. Two jobs:
  - *As study:* read all six in sequence, they form the hexagram's story arc
    across six intensifying stages (line 1 nascent/too early → line 6
    exhausted/too late; lines 2 and 5 are the strong central positions).
  - *As divination:* in a real cast you read only the **changing** lines. Those
    are the oracle's specific message and they generate the second hexagram.
  - Changing-line texts appear in Tier 2; the full six (highlighted) in Tier 3.
- **Beneficial / Beware** — a pair of one-line summaries: what's favorable and
  what the risk is. Always shown as a pair. *Deep Cast.*
- **Reflection prompts** — three short open questions that turn the Meaning
  toward the user's own question, shown next to it. *Deep Cast.*
- **All-six text** — hexagrams 1 and 2 only: an extra text read when all six
  lines change.
- **Seal** — the name in seal script, red carved block (`seals/svg`). Square for
  one-character names, tall for the 15 two-character names.
- **Changing-line microcopy** — dynamic framing text, keyed by how many lines
  changed (see §8). Reused across all hexagrams, not written per hexagram.

The Image texts render the traditional "superior person" (junzi) as plain "you".

---

## 7. Core user flow & screens

Screens implied by the flow. Each needs its own design treatment.

1. **Intro / landing** — states what this is (learning, not fortune-telling) and
   sets the serious-but-inviting tone. First contact with positioning.
2. **Question input** — the user frames a real question. This is a ritual
   threshold, not a search box. Design should encourage a considered question
   (the app can teach what makes a good question here).
3. **Casting animation** — the divination moment. Six coin tosses build the
   hexagram from the bottom up. This is the emotional centerpiece; it must feel
   deliberate and weighty, never like a spinner (see §9).
4. **Reading — Quick Cast** — identity, Judgment, Image, honest frame, and the
   invitation to Deep Cast.
5. **Guided cast — Deep Cast** — the user performs each toss, reads the three
   coins, and places the resulting line. Teaching scaffolding explains *why* a
   given coin result is a given line, then the Meaning, Beneficial / Beware,
   reflection prompts and changing-line texts unlock.
6. **Full reading — Full Cast** — both hexagrams, all six lines with changing
   lines highlighted, and the AI dialogue interface.
7. **Resources** — the seven reference pages (history, gua table, trigrams, how
   to cast, how to read, on translation, why divination can help).
8. **Sign-up / unlock** — the Full Cast gate.
9. *(Optional, later)* **Hexagram reference browser** — all 64 as a study
   library.

Screen-level detail is in `DESIGN-HANDOFF.md`.

---

## 8. States the UI must handle

**Changing-line count is dynamic and drives the reading.** Each line changes with
probability 1/4. Distribution across casts:

| Changing lines | Frequency | Second hexagram? |
|---|---|---|
| Zero | ~18% | No |
| Exactly one | ~36% | Yes |
| Two or more | ~47% | Yes |
| All six | ~0.02% (edge) | Special case |

**Critical:** almost one cast in six has **no changing lines**, so there is no
second hexagram and no changing-line text. The Tier 2/Tier 3 upsell ("you have
changing lines, there's a second hexagram") silently evaporates for those users
unless the copy is dynamic. The zero-case needs its own value framing (the cast
is a single settled picture; the whole message lives in one hexagram). The
second-hexagram hook fires for ~82% of casts.

The framing copy is a small set of **dynamic microcopy templates keyed by
changing-line count** (zero / one / two-or-more / all-six), reused across all 64
hexagrams. Designers should plan for a variable-length text block here and a
count-dependent visual state (e.g. highlighted lines, present-or-absent second
hexagram panel).

Other states to design: loading/casting, locked/gated content blocks, the
all-six edge case (reading passes to the second hexagram; hexagrams 1 and 2 have
special all-lines text), and error.

---

## 9. The casting mechanic

- **Coin method** (three coins, six tosses). Yarrow may come later; design should
  not hard-code "coins" so tightly that a second method can't be added.
- **Bottom-up build.** The hexagram assembles from line 1 (bottom) to line 6
  (top). The animation should show this directional build; it's also how the
  reading is structured.
- **Weighted, not uniform.** The four line types are not equally likely: the two
  changing types occur 1/8 each, the two stable types 3/8 each. This is correct
  and intentional. It can become a teaching point in Tier 2 (why three tails is
  rarer than a mixed toss). Design implication: if the animation visualizes coin
  faces, it should reflect real coins, not an abstract 4-way pick.
- **Tier 2 interaction.** The user reads the three coins and chooses the
  resulting line, with scaffolding that teaches the coin-to-line logic rather
  than quizzing an arbitrary mapping. This is an interactive, stateful,
  toss-by-toss screen, the most mechanically complex in the app.

**Design implication:** the cast is the ritual heart. Pace it. A too-fast or
too-playful animation undercuts the "rare and weighty" positioning. Deliberate,
tactile, a real pause before the reveal.

---

## 10. Visual & symbolic vocabulary

A rich, ready-made symbolic system to draw on. Core primitives:

- **The line.** Yang = solid line (⚊). Yin = broken line (⚋). Every hexagram is
  six of these, stacked. The single most reusable visual unit in the product.
- **Changing lines.** Old yin and old yang, the transforming lines, traditionally
  marked (a cross or a circle). These need a distinct visual state (the
  "highlighted" lines in Tier 3).
- **The eight trigrams** — three-line building blocks, each with a nature image.
  A natural palette for iconography, section theming, and the trigram-teaching
  screens:

| Trigram | Symbol | Nature |
|---|---|---|
| Qian | ☰ | Heaven |
| Kun | ☷ | Earth |
| Zhen | ☳ | Thunder |
| Kan | ☵ | Water |
| Gen | ☶ | Mountain |
| Xun | ☴ | Wind |
| Li | ☲ | Fire |
| Dui | ☱ | Lake |

- **The 64 hexagram glyphs** — each hexagram has a single Unicode character
  (䷀–䷿). Useful as compact identifiers, list markers, and decorative anchors.
- **Naming (decided).** Each hexagram shows Alfred Huang's English name as the
  primary name, with Richard Wilhelm's name as a smaller reference beneath it,
  plus pinyin and the Chinese character. Example: **Initiating**, Qián 乾,
  *Wilhelm: The Creative*. Huang's names are mostly verbs (Initiating,
  Responding, Turning Back), Wilhelm's mostly nouns or archetypes (The
  Creative, The Receptive). That contrast is itself a teaching point about
  translation: classical Chinese doesn't mark a word as noun or verb, so each
  translator's choice reveals a worldview. Huang's verbs fit a book about
  *change*. Design needs a clean primary/reference name pair, not a table of
  equals.
- **Duplicate romanizations.** Several hexagrams share a pinyin spelling and are
  told apart only by tone and character (Qián 1 / Qiān 15, Kūn 2 / Kùn 47,
  Lǚ 10 / Lǚ 56, Bǐ 8 / Bì 22, Jiǎn 39 / Jiàn 53, Jiě 40 / Jié 60,
  Yí 27 / Yì 42). Always show tone marks and the character alongside pinyin.

---

## 11. Terminology (for consistent microcopy)

- **"Meaning"** — the guided reading text (settled; not "Interpretation").
- **Hexagram** throughout the app; the Resources section explains the Chinese
  term *gua* (卦).
- **Changing lines** — the transforming lines in a cast (not "moving lines").
- **Second hexagram** — the hexagram the changing lines transform into (also
  "relating hexagram" in the literature; "second hexagram" is the plainer term
  in use here).
- **Cast / casting** — the act of divining. Not "roll," not "draw."

---

## 12. Emotional design goals per moment

- **Question input:** a threshold. Slight gravity. "This matters."
- **Casting:** ritual, anticipation, a real pause. The heart of the feeling.
- **Tier 1 reveal:** intrigue and a productive itch. Evocative but withholding.
- **Tier 2 learning:** competence and satisfaction. "I did this myself and I get
  it now." Self-efficacy is the target emotion.
- **Tier 3 dialogue:** depth and application. Being met, not fed answers.
- **Throughout:** honesty and calm. The app never oversells the mystical or
  condescends to the skeptic.

---

## 13. Data model (reference)

The content layer already exists as structured data. Each of the 64 hexagrams
has: number, Unicode glyph, six-line pattern (bottom to top), lower/upper
trigram, an English "upper over lower" label, name fields (pinyin, Chinese,
translation variants), the text fields (Judgment, Image, Meaning, Beneficial,
Beware, reflection prompts, six line texts, and the all-six text for 1 and 2) and
a seal. A separate reference lists the eight trigrams. See `SCHEMA.md`. Components map cleanly to
these fields; the design system can assume this shape is stable.

---

## 14. Decisions and open items

Decided:

- **"Superior person"** is rendered as plain "you" in all 64 Image texts.
- **"Meaning"** is the name of the guided reading panel.
- **Tier 2 teaser: shown.** Tier 2 reveals the second hexagram's name and glyph.
  Its Meaning stays locked, with a sign-up prompt for Tier 3.
- **Terminology: "hexagram"** throughout the app. The Resources section explains
  that the Chinese term is *gua* (卦).
- **Seals: treatment C, carved block.** Each hexagram's name character in seal
  script, cut out in paper color from a solid red square. 57 of 71 characters
  come from Wikimedia Commons (public domain); the other 14 (坤 訟 噬 剝 遯 壯 晉 睽 損 益 姤 渙 既 濟)
  were built from public-domain seal-script components. Two-character names
  are stacked in a tall seal. All 64 are built (`seals/`).
- **Level names:** Quick Cast (Tier 1, "A first glimpse of your hexagram."),
  Deep Cast (Tier 2, "Cast it yourself and learn to read it."), Full Cast
  (Tier 3, "The whole story of your cast, read with you.").
- **Re-casting the same question** is not blocked. The app mentions the
  traditional view (Hexagram 4: asking again because you disliked the answer
  means you've stopped listening) but distinguishes it from practice: casting
  many times to learn the method is exactly what the app is for.

Still open:

- **Payment / unlock flow** for Tier 3: one-time payment, reusing soul's
  unlock pattern. Details to confirm when building Tier 3.
- **Yarrow method:** deferred, but leave room for a second casting method.


---

## 15. Resources section (written: `resources/*.md`)

A browsable reference area alongside the game. Each item is a content page the
design system should accommodate (long-form reading layout, tables, diagrams).

- **Brief history of the I Ching.** Origins, the Zhou layer and later
  commentaries, how it was actually consulted (rarely, for weighty matters).
- **Gua table.** All 64 hexagrams in one view: glyph, Huang name, Wilhelm
  reference, pinyin, character, trigram pair. Built directly from the data file.
- **The eight trigrams.** What each represents and how pairs form hexagrams.
- **How to cast.** The coin method step by step, including why the line types
  are not equally likely.
- **How to read.** Judgment, Image, changing lines, second hexagram, and the
  six-line arc.
- **On translation.** Huang vs Wilhelm and why naming choices matter.
- **Why divination can help.** The psychology layer, including the
  impartiality angle: advice from people carries social weight (judgment,
  obligation, status, the feeling of being told what to do), so people often
  resist it even when it's good. An impersonal oracle removes the messenger, so
  a perspective can be considered on its merits. Frame this as *impersonal*,
  not *objective*: the source is impartial, but the meaning is still made by
  the reader, which is the honest core of the app's stance.

## Content status

All content is written and reviewed: Judgment, Image, Meaning, Beneficial /
Beware, reflection prompts and line texts for all 64 hexagrams, the interface
microcopy (`data/copy.json`), the seven Resources pages and all 64 seals. Texts
were reviewed against Legge's public-domain translation (kept in the project
files, not in the design package) at meaning level only: wrong hexagram or image, inverted advice, a dropped core
condition.

## Stack (decided)

Matches the existing anyma **soul** app so the projects share one setup:
- **Monorepo.** anyma is a monorepo hosting multiple projects (soul, dosha, and
  now ching). Ching is added as one more app in it, sharing tooling, brand
  assets and, where they exist, shared packages. Access to the monorepo is
  needed before the build starts.
- **Vite + React** single-page app, served at `anyma.one/ching`.
- **Vercel** hosting, with Vercel Analytics, like soul.
- **Vercel serverless functions** (`/api/...`) only for Tier 3: the Anthropic API call and the paid unlock. Tiers 1 and 2 run fully in the browser.
- **Supabase** only if Tier 3 needs stored data (unlocks, logs), as soul does.
- Shared brand type from anyma: Cormorant Garamond and Hanken Grotesk.
