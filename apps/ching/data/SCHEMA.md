# Ching data reference

Paths are relative to the package root. All content is written and reviewed.

| Path | What it is |
|---|---|
| `data/hexagrams.json` | The 64 hexagrams: structure, names, texts, seal reference |
| `data/trigrams.json` | The eight trigrams |
| `data/copy.json` | All interface copy, by screen |
| `data/sample-casts.json` | Four example casts with content per level (for design) |
| `seals/svg/NN.svg` | The 64 seals; `seals/manifest.json` lists the sources of each |
| `resources/*.md` | The eight Learn pages (02 split per the design update of 11 Nov 2026) |
| `cast.js` | Cast logic: coin simulation and hexagram lookup. Design package: `code/cast.js`; build kit: `src/lib/cast.js`, with `reading.js` and tests |

Level names, used throughout: **Quick Cast** (Tier 1), **Deep Cast** (Tier 2), **Full Cast** (Tier 3).

## data/hexagrams.json: 64 entries

| field | type | notes |
|---|---|---|
| `number` | int 1–64 | King Wen number |
| `char` | string | Unicode hexagram glyph, e.g. `䷂` |
| `lines` | int[6] | bottom→top, `1` = yang (solid), `0` = yin (broken) |
| `binary` | string | `lines` joined, bottom→top, used for lookup |
| `trigrams` | {lower, upper} | trigram keys; lower = lines 1–3 |
| `label` | string | "Upper over Lower" in English, e.g. "Water over Thunder" |
| `names.huang` | string | **primary display name** (Alfred Huang, *The Complete I Ching*) |
| `names.wilhelm` | string | reference name, shown smaller beneath Huang's |
| `names.pinyin` | string | with tone marks, e.g. "Zhūn" |
| `names.chinese` | string | traditional characters, e.g. "屯" |
| `names.legge` | string | empty, unused |
| `judgment` | string | Quick Cast and up |
| `image` | string | Quick Cast and up |
| `general` | string | the **Meaning** text; Deep Cast and up. Field name kept for stability |
| `beneficial` | string | Deep Cast; one-line summary of what's favorable |
| `beware` | string | Deep Cast; one-line summary of the risk; always paired with `beneficial` |
| `reflections` | string[3] | Deep Cast; questions that apply the Meaning to the user's question |
| `lineTexts` | string[6] | bottom→top; Deep Cast shows changing lines only, Full Cast all six |
| `allChanging` | string | hexagrams 1 and 2 only: the extra text read when all six lines change |
| `seal` | object | `file` (SVG path), `shape` (`square` or `tall`), `composed` (built from parts) |
| `status` | object | review state per text type (all reviewed or approved) |

## data/trigrams.json: 8 entries
`key`, `english`, `symbol` (☰ etc.), `bits` (bottom→top), `pinyin`, `chinese`, `quality`, `family`.

## data/copy.json
Interface copy grouped by screen: `levels`, `labels`, `landing`, `question`, `recast`, `cast`, `guide`, `tier1`, `tier2`, `gate`, `changingLines`, `lineTypes`, `dialogue`, `errors`, `resources`. Tokens in curly braces are filled at runtime; `_placeholders` explains each. The only undecided value is `{price}`.

## Cast logic (`cast.js`)
- `castHexagram()` → six line objects, bottom→top, each `{ coins, total, key, name, yang, changing }`. The coin math gives the correct 1/8 · 3/8 · 3/8 · 1/8 distribution. Do not replace it with a uniform pick.
- `resolve(lines, indexByBinary(hexagrams))` → `{ primary, second, changingLines }`. `second` is `null` when no lines change; `changingLines` lists positions 1 to 6.
- `lineFromCoins(coins)` rebuilds a line from its three saved coins (preferred for saved casts: keeps the faces); `lineFromTotal(total)` is for replays and tests.

## Conventions (don't drift from these)
- Lines are always ordered **bottom → top** (line 1 = bottom).
- Yang = 1 = solid; yin = 0 = broken.
- `label` names the upper trigram first ("Heaven over Earth"), matching spoken convention, while `lines` and `binary` are bottom-first. Both orders are intentional.
- Always show pinyin with tone marks and the character: several names differ only by tone.

## Seals
`seals/svg/NN.svg`: the hexagram's name in seal script, knocked out of a red block (the cut-out is transparent). Color via the CSS variable `--seal-color` (default `#B3261E`). Square viewBox `0 0 100 100`; the 15 two-character names are tall, viewBox `0 0 100 186`. Stroke weight is 2.2, lighter for the ten densest characters so their inner spaces stay open. Sources and licences (all public domain or CC0): `seals/CREDITS.md` and `seals/manifest.json`.

## Name verification
- Every Wilhelm name matches the Unicode name of its hexagram glyph (only spelling variants differ: Break-through/Breakthrough, Caldron/Cauldron).
- Every pinyin syllable is a valid dictionary reading of its character. Two characters have two readings; the data follows Huang's list: 畜 as Xù (9, 26; many references use Chù) and 解 as Jiě (40; many use Xiè).
- All 64 Huang names were checked against the book by the project owner.

## Review standard
Texts are simplified paraphrases, not translations. They were reviewed against James Legge's public-domain translation (1882; kept in the project files, not in this package) for meaning only: wrong hexagram or image, inverted advice, a dropped core condition. Evocative details that follow Wilhelm or other mainstream readings are intended.
