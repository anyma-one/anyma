// Serverless endpoint (Vercel Node function): step 2 of the shared anyma waitlist double
// opt-in. Follows the link from the confirmation email, flips the row to verified, and
// returns a standalone branded page. Idempotent — a second click says "already confirmed"
// rather than erroring.
//
// SELF-CONTAINED on purpose (see api/waitlist.ts).
//
// Config (host env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

interface ReqLike {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
}
interface ResLike {
  status: (code: number) => ResLike;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
}

// Loose UUID shape check — the token column is a uuid, so anything else cannot match a row.
const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${title} — anyma</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 32px; background: #faf7f0; color: #1d2734;
    font: 400 17px/1.65 ui-sans-serif, system-ui, -apple-system, sans-serif;
    text-align: center;
  }
  .card { max-width: 460px; }
  h1 { margin: 0 0 12px; font-size: 30px; font-weight: 500; line-height: 1.2; }
  p { margin: 0; color: #2f3640; }
  a { display: inline-block; margin-top: 28px; padding: 14px 26px; border-radius: 12px;
      background: #1d2734; color: #f3efe5; text-decoration: none; font-size: 15px; }
  @media (prefers-color-scheme: dark) {
    body { background: #1d2734; color: #f3efe5; }
    p { color: #b9c2cd; }
    a { background: #f3efe5; color: #1d2734; }
  }
</style></head>
<body><div class="card">${body}<a href="/">Back to anyma</a></div></body></html>`;
}

export default async function handler(req: ReqLike, res: ResLike): Promise<void> {
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const raw = req.query?.token;
  const token = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  if (!token || !TOKEN_RE.test(token)) {
    res.status(400).send(
      page("Link not valid", "<h1>That link isn't valid</h1><p>Please use the button in the confirmation email, or sign up again.</p>")
    );
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).send(page("Something went wrong", "<h1>Something went wrong</h1><p>Please try again later.</p>"));
    return;
  }

  try {
    // Only flip rows that are still unverified; a second click matches nothing and falls
    // through to the "already confirmed" message.
    const patch = await fetch(
      `${url}/rest/v1/waitlist?token=eq.${encodeURIComponent(token)}&verified=eq.false`,
      {
        method: "PATCH",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ verified: true, verified_at: new Date().toISOString() }),
      }
    );
    if (!patch.ok) throw new Error(`supabase ${patch.status}`);

    const updated = (await patch.json()) as unknown[];
    if (updated.length > 0) {
      res.status(200).send(
        page("You're in", "<h1>You're in</h1><p>Thank you for confirming. We will write to you once, when it opens — and not before.</p>")
      );
      return;
    }

    res.status(200).send(
      page("Already confirmed", "<h1>Already confirmed</h1><p>This address is on the list. Nothing more to do.</p>")
    );
  } catch {
    res.status(502).send(page("Something went wrong", "<h1>Something went wrong</h1><p>Please try the link again in a moment.</p>"));
  }
}
