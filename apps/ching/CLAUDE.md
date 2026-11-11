# ching

The I Ching learning app at `anyma.one/ching`. Full spec: `BUILD.md`. Screens: `design/DESIGN-HANDOFF.md`.

## Rules
- Content is final. User-facing text comes from `data/copy.json`, `data/hexagrams.json` and `data/ui.json` (interface labels from the approved design update). Don't write new copy; mark gaps as `[COPY NEEDED: ...]` and report them.
- Design: `design/update-2026-11-11/` (approved 9 to 11 Nov 2026; its `DESIGN-CLAUDE.md` has the rules). Colours, type and motion come from `src/styles/tokens.css`; layout in `src/styles/app.css`.
- `src/lib/cast.js` holds the coin odds (1/8, 3/8, 3/8, 1/8). Never replace it with a uniform pick.
- `buildReading()` in `src/lib/reading.js` decides what each level shows. Components render its output; they don't re-decide visibility.
- Lines are always bottom to top (line 1 = bottom).
- Animations show results that were already cast. They never decide results.
- Never put the user's question in a URL or analytics, and never in logs unless the owner has approved dialogue logging (BUILD §6.4).
- The Full Cast dialogue builds its prompt on the server from the data files (`api/_lib/reading-context.js`). Never send client-supplied reading text to the model. The client never sends or stores the `OPENER`.
- Server helpers and tests stay out of routed folders (`api/_lib/`, or soul's equivalent).
- Level names: Quick Cast, Deep Cast, Full Cast. Terms: "hexagram", "changing lines", "second hexagram", "Meaning", "cast".
- Chinese text gets `lang="zh-Hant"`; pinyin always appears with tone marks and the character.

## Tests
`npm test` (Node 21+). Keep them passing; one of them rebuilds the design sample casts exactly.
