# ching

The I Ching learning app for `anyma.one/ching`. Spec: `BUILD.md`. Design: `design/update-2026-11-11/` (approved 9 to 11 Nov 2026), which overrides the original `design/DESIGN-HANDOFF.md` where they differ.
Conventions: `CLAUDE.md`.

Built standalone first. It's laid out so it can move into the monorepo as `apps/ching` (see below).

## Run

Node 20+ (the monorepo's CI uses 20). On this machine Node lives at
`~/.local/spirit-node/node-v20.18.1-darwin-arm64/bin`.

```bash
npm install
npm run dev        # http://localhost:5174/ching/
npm test           # 27 tests: the kit's 22 + usage limits
npm run typecheck
npm run build
```

`npm run dev` also runs `api/*.ts` locally (`dev/vite-plugin-dev-api.ts`, copied from soul).
Copy `.env.example` to `.env.local` for the Full Cast. The local `.env.local` uses the code
`local-test` and in-memory usage counters, with no Anthropic key, so the dialogue answers
"unavailable".

## Manual testing (Quick Cast and Deep Cast)

**Without a terminal:** double-click `Start CHING.command` in Finder. A small window opens and
your browser goes to `http://localhost:5174/ching/`. Keep that window open while testing; close
it to stop. (If macOS blocks it the first time: right-click → Open.)

From a terminal: `./dev.sh` (finds Node, installs if needed, opens the same address).
Quick and Deep Cast need no server, keys or `.env.local`.

- **Force a case:** the question screen has a dashed "Dev only, force a cast" picker (dev server
  only, not in production builds). It runs one of the four design sample casts (no, one, two or
  all six changing lines) through the normal animation and guided cast. It resets on page reload.
- **Skip the animation:** "Skip to my reading" appears from your second cast on.
- **Re-cast note:** ask the same question twice in one browser session. It doesn't appear on
  "Continue with Deep Cast".
- **Reduced motion:** turn on macOS Settings → Accessibility → Display → Reduce motion.
- **Sign-up:** locally any valid email is accepted and nothing is stored or sent (a stand-in in
  `dev/vite-plugin-dev-api.ts`). To see the sign-up again, remove `ching.signedUp` from site storage.
- **Start over:** "Clear my past questions" on the question screen clears the history. To clear
  everything, remove the `ching.*` keys in the browser's site storage.

## What's here

| Path | What |
|---|---|
| `src/lib/` | The kit's cast logic, level rules, question helpers (unchanged) |
| `src/signup.ts` | Deep Cast sign-up: email to the shared anyma list (`/api/waitlist`, project `ching`) |
| `src/store.tsx` | Current cast (coins persisted), history of 10, Quick → Deep upgrade, Deep → Full unlock |
| `src/screens/` | Landing, Ask, Cast (Quick animation), GuidedCast (Deep), Reading, Gate, Dialogue, Learn |
| `src/components/` | Hexagram figure (drawn from lines), coins, seals (inlined on demand), reading blocks |
| `src/styles/tokens.css` | The design's tokens, verbatim except fonts (self-hosted via `@fontsource`, no Google request) |
| `src/styles/app.css` | All layout and motion, desktop first; tablet ≤ 960px, mobile ≤ 720px |
| `data/ui.json` | Interface labels from the design update (copy-overrides `ui-strings`, screen and component specs) |
| `api/ching-unlock.ts` | Full Cast closed-beta code check (mirrors soul's `deepdive-unlock`) |
| `api/ching-dialogue.ts` | Streamed dialogue. Prompt built server-side from the data files; limits fail closed |
| `api/_lib/` | Kit helpers + `access.js` (code gate) + `usage.js` (limits, Supabase or dev memory store) |
| `supabase/waitlist.sql` | The shared anyma waitlist table (Deep Cast sign-up, Full Cast waitlist); safe to re-run |
| `supabase/ching.sql` | Tables and atomic counting functions for the usage limits |

## Decisions taken (defaults until the owner decides; BUILD §10)

- **Owner, 11 Nov 2026 (after first test):**
  - Level III on the start screen says "coming soon", darkens on hover and opens the Full Cast sign-up.
  - Choosing Deep Cast on the start screen asks for the sign-up there, then goes to the question.
  - Deep Cast from a Quick reading: after the sign-up (or straight away if already signed up)
    the person chooses "reveal this cast" (the same cast, now read at Deep Cast, BUILD §4's new
    cast no longer forced) or "cast again myself" (the guided cast). Copy: `gate.deepChoice`, approved.
  - The guided cast asks for the total as a typed number, and asks again until it's right.
    Copy: `cast.typedTotal`, approved.
- **Owner, 11 Nov 2026 (second round):**
  - "reveal this cast" is offered only when the cast has changing lines; otherwise Deep Cast is
    the guided cast, after the sign-up if needed.
  - Deep Cast's next box: "Make It Yours" / "Learn to interpret by asking specific questions."
  - While Full Cast is closed, its buttons in the reading say "coming soon" (no arrow) and open
    the Full Cast sign-up.

- **Full Cast is closed for now (owner, 11 Nov 2026).** Payment is decided later. Every Full Cast
  button opens a sign-up modal instead ("Make It Yours"), with one email for the shared anyma
  list (`source: "full-cast"`), then "You're on the list". Nothing unlocks. Its copy
  (`data/ui.json` → `gate.waitlist`) is approved by the owner.
  On the dev server only, a dashed "Dev only" box under it still takes the closed-beta access code
  (`local-test`), so Full Cast and Make It Yours can be tested locally. Production builds leave it out.

- **Deep Cast sign-up (owner, 11 Nov 2026):** one email, posted to the shared anyma list
  (`/api/waitlist` in the monorepo, `interest: "ching"`), the same double opt-in as soul. Deep Cast
  opens as soon as the list accepts the address; the confirmation email goes out in the
  background. The device remembers only that it signed up (`ching.signedUp`), never the email.
  It's asked before any Deep Cast: from the Quick reading, and on the question screen when Deep
  or Full Cast was chosen up front. The copy (`data/ui.json` → `gate.signup`) was adapted from
  soul and approved by the owner.
  **Monorepo follow-ups:** the shared confirmation email says "let you know when ching opens",
  which doesn't fit a Deep Cast that's already open. And `api/waitlist.ts` only stores sources it
  knows, so add `deep-cast` and `full-cast` to `KNOWN_SOURCES` to tell the two lists apart.

- **Full Cast unlock = closed-beta access code** (`CHING_PASSCODE`), like soul's Deep Dive. soul has
  no payment flow to mirror. Usage limits count per device id under the shared code. Device ids
  are chosen by the client, so this isn't a hard boundary; the daily token cap is the backstop.
- Level choice on the landing page. Picking Full Cast up front runs the Deep Cast guided cast, then shows the gate.
- Re-cast window: this browser session.
- Model `claude-sonnet-5-5` with thinking off (`between_tools`) so 600 output tokens go to the
  reply; `CHING_MODEL=claude-haiku-5-5` also works. Server-side refusal fallback is on
  (`fallbacks: "default"`).
- No dialogue logging. Only hashed reading ids, counters and daily token totals are stored.
- Judgment and Image shown in full at Deep and Full Cast. Dialogue sits inline at the end of the Full reading.
- The question's submit button uses the chosen level's name ("Quick Cast" etc.): no submit copy exists.

## Design update (11 Nov 2026): how it was applied

- Copy overrides applied to `data/copy.json`, `data/hexagrams.json` and `data/sample-casts.json`
  (only the six fields listed). Learn section 02 split into 02 and 03; later sections renumbered.
- Make It Yours (the Full Cast dialogue) is now its own page, `/ching/make-it-yours`.
- The sign-up and unlock steps are a modal over the reading.
- Fonts: Young Serif, Crimson Pro, IBM Plex Mono and Kaisei Tokumin, self-hosted.
- "learn more" on the yes/no note and About in the footer open the Learn (resources) page (owner, 11 Nov 2026).
- The landing ring's centre is `src/assets/home-centre-seal.svg` (屯 in bronze, sent by the owner
  separately; the package only linked to it). It stays still while the ring turns in.

**Where the build differs from the renders, following the text (design CLAUDE.md: text wins):**
- The renders show the headings in a fallback serif; the build uses Young Serif as `tokens.css` specifies.
- "replay" and "jump to reveal" in the cast renders are canvas controls. The product has "Skip to my
  reading →" in the header (still only from the second cast on, as before).
- The Learn render shows an empty table; the build shows the real one.
- The reading no longer shows the question (no screen spec places it there); it's on the Make It Yours card.
- During the trigram step the figure's eyebrow stays "bottom line first"; the prototype showed the
  hexagram's label ("Water over Thunder"), which gives the answer away. It appears at the reveal.
- `bone-300` (named in two component specs) isn't in the token file; mapped to `bone-200`, as the prototypes use.

**Open decisions shown as bracketed placeholders (design CLAUDE.md "ask, do not decide"):**
- Payment mechanism and price: left for later; Full Cast shows a sign-up until then.
- `[Open the full reading]`: brackets kept as the design wrote them.
- Both Level III calls to action are kept. The mark is the bronze one everywhere.

## Copy gaps

- `[COPY NEEDED: label for the Full Cast access-code field]`: shown in the gate.
- `gate.payment` (`{price}`) is hidden while Full Cast is a closed beta.
- The dialogue's "try the opening again" button is a bare ↻ with no text.

## In the monorepo (`ANYMA ONE`)

ching lives at `apps/ching` and is served at `anyma.one/ching`:
- `build.mjs` builds it with `--base=/ching/` and copies its `dist` to `dist/ching`.
- `vercel.json` rewrites `/ching/:path*` to `/ching/index.html`, so its screens work as deep
  links; `dev-server.mjs` does the same locally.
- The hub's ching tile links to `/ching`.

**No ching functions are deployed yet.** Full Cast is closed, and Deep Cast's sign-up uses the
hub's shared `/api/waitlist`. `apps/ching/api/` (`ching-unlock`, `ching-dialogue` and `_lib/`)
isn't deployed from there, because Vercel only deploys the root `api/`. When Full Cast opens:
1. Move `api/ching-*.ts` and `api/_lib/*` to the root `api/`, and fix the relative imports in
   `reading-context.js`, `ching-dialogue.ts` and `usage.test.js`. Check this on a preview deploy:
   soul inlines everything into each function because local imports weren't reliably bundled.
2. Run `supabase/ching.sql`, and set `CHING_PASSCODE`, the three `CHING_*` limits and
   (optionally) `CHING_MODEL` in Vercel.
3. Mind the function count: the root `api/` already has 15, and the monorepo README says Hobby
   allows 12.

## Not done yet

- The Full Cast dialogue hasn't been run against the real API (no key in this folder), and the
  manual prompt checks in `api/_lib/full-cast-system-prompt.md` are still to do.
- Optional extras: shake-to-toss, sound, switching off guided-cast help for returning users.
- Noto Serif TC isn't self-hosted yet; Chinese falls back to system serif fonts.
