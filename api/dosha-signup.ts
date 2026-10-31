// Serverless endpoint (Vercel Node function): dosha's two email sign-ups, each in its own table.
//
//   kind "full"        Full Reading gate. Stores the email in `dosha_full_signups` and returns.
//                      No email is sent and the reader is never blocked: the client opens the
//                      Full Reading whatever this answers.
//   kind "individual"  Individual Reading waitlist, double opt-in. Upserts an UNVERIFIED row in
//                      `dosha_individual_waitlist`, emails a confirmation link
//                      (/api/dosha-confirm) and pings hello@anyma.one.
//
// SELF-CONTAINED on purpose: a function's local imports are not available at runtime on Vercel,
// so helpers are inlined (same pattern as api/waitlist.ts).
//
// Config (host env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY;
// WAITLIST_FROM / WAITLIST_SITE_URL (optional overrides, shared with api/waitlist.ts).

const SITE_URL = process.env.WAITLIST_SITE_URL ?? "https://www.anyma.one";
const RESEND_FROM = process.env.WAITLIST_FROM ?? "anyma <hello@anyma.one>";
const INBOX = "hello@anyma.one";
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

async function upsert(table: string, row: Record<string, unknown>): Promise<unknown[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("not_configured");
  // Upsert on email, merging: a repeat sign-up refreshes consent_at and keeps the row's token.
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=email`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([row]),
  });
  if (!res.ok) throw new Error(`supabase ${res.status}`);
  return (await res.json()) as unknown[];
}

async function sendMail(mail: Record<string, unknown>): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, ...mail }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function confirmationMail(to: string, token: string): Record<string, unknown> {
  const link = `${SITE_URL}/api/dosha-confirm?token=${encodeURIComponent(token)}`;
  const text =
    `Please confirm your email so we can let you know when the dosha Individual Reading opens.\n\n` +
    `${link}\n\nIf you did not sign up at anyma, ignore this message and nothing further will happen.\n`;
  const html =
    `<div style="font:16px/1.65 -apple-system,system-ui,sans-serif;color:#2f3640;max-width:520px">` +
    `<p>Please confirm your email so we can let you know when the <strong>dosha Individual ` +
    `Reading</strong> opens.</p>` +
    `<p><a href="${link}" style="display:inline-block;padding:14px 24px;border-radius:12px;` +
    `background:#1d2734;color:#f3efe5;text-decoration:none;font-weight:500">Confirm my email</a></p>` +
    `<p style="font-size:13px;color:#79808a">If you did not sign up at anyma, ignore this ` +
    `message and nothing further will happen.</p></div>`;
  return { to: [to], subject: "anyma · please confirm your email", text, html };
}

export default async function handler(req: ReqLike, res: ResLike): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const payload =
    typeof req.body === "string" ? safeParse(req.body) : (req.body as Record<string, unknown>);
  const email = normalizeEmail(payload?.email);
  const kind = payload?.kind;

  if (!email || (kind !== "full" && kind !== "individual")) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }
  // The individual waitlist rests on consent; the form's tick box must have been checked.
  if (kind === "individual" && payload?.consent !== true) {
    res.status(400).json({ error: "consent_required" });
    return;
  }

  const consent_at = new Date().toISOString();

  if (kind === "full") {
    try {
      await upsert("dosha_full_signups", { email, consent_at });
    } catch {
      res.status(502).json({ error: "storage_failed" });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  let row: WaitlistRow | undefined;
  try {
    row = (await upsert("dosha_individual_waitlist", { email, consent_at }))[0] as WaitlistRow;
  } catch {
    res.status(502).json({ error: "storage_failed" });
    return;
  }

  if (row?.verified) {
    res.status(200).json({ ok: true, status: "already_verified" });
    return;
  }

  // An unconfirmable row is useless, so a failure to send is surfaced rather than swallowed.
  if (!(await sendMail(confirmationMail(email, row.token)))) {
    res.status(502).json({ error: "email_failed" });
    return;
  }

  // Inbox ping is best-effort: the sign-up already succeeded.
  await sendMail({
    to: [INBOX],
    subject: "dosha · new Individual Reading sign-up",
    text: `${email} signed up for the dosha Individual Reading (confirmation pending).\n`,
  });

  res.status(200).json({ ok: true, status: "pending" });
}

function safeParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
