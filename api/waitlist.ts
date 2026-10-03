// Serverless endpoint (Vercel Node function): step 1 of the shared anyma waitlist double
// opt-in. Upserts an UNVERIFIED row in Supabase and emails the signer a confirmation link.
//
// This is the SHARED list — it lives on the hub at /api/waitlist so every anyma app can post
// to it same-origin. It writes to the same `waitlist` table SOUL already uses, and touches
// only the columns it sends, so a row created by SOUL keeps its own `source`.
//
// SELF-CONTAINED on purpose: a function's imports are not available at runtime on these
// projects, so helpers are inlined. Same pattern as SOUL's api/waitlist.ts.
//
// Config (host env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY (all required);
// WAITLIST_FROM / WAITLIST_SITE_URL (optional overrides).

const SITE_URL = process.env.WAITLIST_SITE_URL ?? "https://www.anyma.one";
const RESEND_FROM = process.env.WAITLIST_FROM ?? "anyma <hello@anyma.one>";

// Which project the signer came in for. Kept closed so a caller cannot write arbitrary text.
const KNOWN_INTERESTS = new Set(["ching", "dosha", "soul"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ReqLike {
  method?: string;
  body?: unknown;
}
interface ResLike {
  status: (code: number) => ResLike;
  json: (body: unknown) => void;
}
interface WaitlistRow {
  token: string;
  verified: boolean;
}

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

function supabaseHeaders(key: string, prefer: string): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

async function sendConfirmation(to: string, token: string, interest: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const link = `${SITE_URL}/api/waitlist-confirm?token=${encodeURIComponent(token)}`;
  const text =
    `Please confirm your email so we can let you know when ${interest} opens.\n\n${link}\n\n` +
    `If you did not sign up at anyma, ignore this message and nothing further will happen.\n`;
  const html =
    `<div style="font:16px/1.65 -apple-system,system-ui,sans-serif;color:#2f3640;max-width:520px">` +
    `<p>Please confirm your email so we can let you know when <strong>${interest}</strong> opens.</p>` +
    `<p><a href="${link}" style="display:inline-block;padding:14px 24px;border-radius:12px;` +
    `background:#1d2734;color:#f3efe5;text-decoration:none;font-weight:500">Confirm my email</a></p>` +
    `<p style="font-size:13px;color:#79808a">If you did not sign up at anyma, ignore this ` +
    `message and nothing further will happen.</p></div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: "anyma · please confirm your email",
        text,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function handler(req: ReqLike, res: ResLike): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload =
    typeof req.body === "string" ? safeParse(req.body) : (req.body as Record<string, unknown>);

  const email = normalizeEmail(payload?.email);
  const rawInterest = typeof payload?.interest === "string" ? payload.interest : "";
  const interest = KNOWN_INTERESTS.has(rawInterest) ? rawInterest : null;

  if (!email || !interest) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(500).json({ error: "not_configured" });
    return;
  }

  let row: WaitlistRow | undefined;
  try {
    // Upsert on email, merging — only the columns sent here are written, so a row that SOUL
    // created keeps its own `source` and its existing token.
    const upsert = await fetch(`${url}/rest/v1/waitlist?on_conflict=email`, {
      method: "POST",
      headers: supabaseHeaders(key, "resolution=merge-duplicates,return=representation"),
      body: JSON.stringify([{ email, interest, consent_at: new Date().toISOString() }]),
    });
    if (!upsert.ok) throw new Error(`supabase ${upsert.status}`);
    row = (await upsert.json())[0] as WaitlistRow;
  } catch {
    res.status(502).json({ error: "storage_failed" });
    return;
  }

  if (row?.verified) {
    res.status(200).json({ ok: true, status: "already_verified" });
    return;
  }

  // An unconfirmable row is useless, so a failure to send is surfaced rather than swallowed.
  const sent = await sendConfirmation(email, row.token, interest);
  if (!sent) {
    res.status(502).json({ error: "email_failed" });
    return;
  }

  res.status(200).json({ ok: true, status: "pending" });
}

function safeParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
