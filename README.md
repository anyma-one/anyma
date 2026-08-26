# anyma

The start screen and the games it opens, served as one site at **anyma.one**.

```
/            apps/hub     the start screen — brand, three tiles, sign-up, suggestions
/soul/       apps/soul    Spirit Animal (Vite + React)
/dosha/      apps/dosha   Ayurvedic constitution reading (plain static)
/ching/      —            not built; its tile is locked
/api/*       api/         shared serverless functions (all three apps call these)
```

One repo, one Vercel project, one domain. No subdomains, no cross-project proxying.

## Build and run

```bash
npm install
npm run dev
```

`npm run dev` assembles `dist/` and serves it at <http://localhost:8100>, so you are testing
the same tree Vercel publishes. `npm run build` assembles only; `npm run serve` serves an
existing `dist/`.

`build.mjs` copies each app into its slot and runs SOUL's Vite build with `--base=/soul/`.
The base is passed on the command line rather than written into SOUL's `vite.config.ts`, so
SOUL stays independently buildable.

**Everything in `dist/` is public.** The build therefore skips dotfiles and `.md` files when
copying an app — without that, `apps/dosha/HANDOVER.md` and `.claude/` would be fetchable at
`anyma.one/dosha/…`. Keep that filter if you touch `build.mjs`.

## Vercel

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | default |

`api/` is picked up from the repo root automatically, independently of the output directory.
Hobby allows 12 serverless functions per project; this repo uses 3, and SOUL adds 7 once its
own functions move in — see below.

### Environment

| Variable | Required for | Purpose |
|---|---|---|
| `RESEND_API_KEY` | suggestions, waitlist | sending mail |
| `SUPABASE_URL` | suggestions, waitlist | database |
| `SUPABASE_SERVICE_ROLE_KEY` | suggestions, waitlist | service-role key |
| `SUGGEST_TO` / `SUGGEST_FROM` | optional | override recipient / sender |
| `WAITLIST_SITE_URL` | optional | confirmation-link origin (default `https://anyma.one`) |
| `ANTHROPIC_API_KEY` + `ANTHROPIC_*_MODEL` | SOUL's Deep Dive | once SOUL's functions move in |

### Database

```sql
create table public.suggestions (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  email      text,                                    -- optional, reply-to only
  created_at timestamptz not null default now()
);
alter table public.suggestions enable row level security;

alter table public.waitlist add column if not exists interest text;
```

RLS on with no policies is correct: the functions use the service-role key, which bypasses
RLS, and nothing else should read these tables.

## Folding SOUL in

SOUL still lives in its own repo (`anyma-one/spirit-shape`) and is **not yet** in `apps/soul`.
The build skips it and logs `SKIP /soul/` — everything else works meanwhile.

Two source changes it needs are **already made in that repo** and are safe in both layouts,
because `import.meta.env.BASE_URL` is `/` for a standalone build and `/soul/` here:

- `src/components/ui/Layout.tsx` — header logo
- `src/data/animalArt.ts` — `ANIMAL_ART_BASE`

The 50 `url(/fonts/…)` references in `src/fonts.css` need no change: Vite rewrites CSS URLs
against the base at build time. Only paths built in JavaScript had to be fixed.

When SOUL's in-flight work is committed:

1. Move its files to `apps/soul/` (`git mv`, or a fresh copy if you would rather not carry
   the history — this repo becomes the origin either way).
2. Delete `apps/soul/api/waitlist.ts` and `apps/soul/api/waitlist-confirm.ts`, and point
   `src/persistence/waitlist.ts` at `/api/waitlist` with `interest: "soul"`. The shared
   functions in `api/` replace them. Confirmation links already in people's inboxes keep
   working: same table, same `token` column.
3. Move SOUL's remaining 7 functions from `apps/soul/api/` up into the root `api/`.
4. Update SOUL's OG tags to `anyma.one/soul`.
5. `npm run build` and check `/soul/` locally.

## To do

- **Style the waitlist confirmation page to match the start screen.** `api/waitlist-confirm.ts`
  currently returns a self-contained page in system fonts — functional, but it is the first
  thing a new sign-up sees after their only email, and it looks nothing like the site. It is
  served from this origin, so it can link `/fonts.css`, `/styles.css` and `/legal.css` and use
  the same markup as the legal pages, rather than carrying a second copy of the palette that
  would drift. Keep it self-contained enough to render if a stylesheet ever 404s.
- **A proper light-on-dark logo export.** Dark mode currently runs the wordmark through a CSS
  `invert()` filter, which reads acceptably but is not a real asset. Flagged in the original
  design handoff too.
- **Fold SOUL in** — see above.

## Review link

`npm run review` inlines the hub — fonts, images, CSS, JS — into one self-contained file at
`.review/`, with the legal pages folded in as overlays. That file is what gets published as
the shared review artifact; it is not part of the site.

## Notes

- **Dosha needed no changes at all.** Every path in it was already relative and it uses a hash
  router, so it works at any depth. It has no build step and no serverless functions.
- **The ching tile is locked** and opens the sign-up pop-up. To ship ching: add `apps/ching`,
  give it a slot in `build.mjs`, swap the tile's `<button>` for `<a href="/ching">`, and drop
  the `tile--locked` class, the `tile__soon` span and the `#ching` overlay.
- **Fonts are self-hosted** in every app rather than linked from Google's CDN — a GDPR
  requirement given the German imprint. Do not reintroduce a `fonts.googleapis.com` import.
- **Legal pages** live at `/imprint` and `/privacy`, served from the hub. SOUL keeps its own
  reviewed pages for its own processing; the imprint text is identical in both.
