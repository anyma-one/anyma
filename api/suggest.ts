// Serverless endpoint (Vercel Node function): receives a "suggest a project" submission
// from the anyma start screen, stores it in Supabase and emails it to the anyma inbox.
//
// SELF-CONTAINED on purpose: on the sibling anyma projects a function's imports are NOT
// available at runtime (`_`-prefixed helpers are excluded from the bundle and devDependencies
// are pruned), so each function inlines its helpers. Same pattern as ANYMA SOUL's api/*.ts.
//
// Config (host env): RESEND_API_KEY (required to send); SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY (optional — storage is best-effort); SUGGEST_TO / SUGGEST_FROM
// (optional overrides).
//
// The email address is OPTIONAL and is collected for one purpose only: replying to the
// suggestion. It is covered by the hub's privacy policy (§2) and is deleted once the
// exchange is over. Nothing else is collected.

const TO = process.env.SUGGEST_TO ?? "hello@anyma.one";
const FROM = process.env.SUGGEST_FROM ?? "anyma <hello@anyma.one>";

const MAX_TITLE = 120;
const MAX_BODY = 2000;
const MAX_EMAIL = 254;
// Conservative: one @, a dot in the domain, no spaces. Mirrors the client guard.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ReqLike {
  method?: string;
  body?: unknown;
}
interface ResLike {
  status: (code: number) => ResLike;
  json: (body: unknown) => void;
}

function clean(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > max) return null;
  return value;
}

// Returns the normalized address, or null for "absent" AND for "malformed" alike — an
// unusable address is the same as none, and must never block an otherwise valid suggestion.
function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return null;
  return email;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Best-effort persist. Never throws — a storage outage must not lose the email.
async function store(title: string, body: string, email: string | null): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(`${url}/rest/v1/suggestions`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ title, body, email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Best-effort send via Resend. Never throws; returns whether it was accepted.
async function sendEmail(title: string, body: string, email: string | null): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const sender = email ?? "not given — no reply possible";
  const text =
    `New project suggestion from the anyma start screen.\n\n` +
    `Title: ${title}\n\nFrom: ${sender}\n\n${body}\n`;
  const html =
    `<p style="font:14px/1.6 -apple-system,system-ui,sans-serif;color:#2f3640">` +
    `New project suggestion from the anyma start screen.</p>` +
    `<p style="font:600 16px/1.4 -apple-system,system-ui,sans-serif;color:#1d2734">` +
    `${escapeHtml(title)}</p>` +
    `<p style="font:14px/1.65 -apple-system,system-ui,sans-serif;color:#2f3640;white-space:pre-wrap">` +
    `${escapeHtml(body)}</p>` +
    `<p style="font:13px/1.6 -apple-system,system-ui,sans-serif;color:#79808a">` +
    `From: ${escapeHtml(sender)}</p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        // Hitting reply in the inbox answers the person directly when they left an address.
        ...(email ? { reply_to: email } : {}),
        subject: `anyma · project suggestion — ${title}`,
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

  const title = clean(payload?.title, MAX_TITLE);
  const body = clean(payload?.body, MAX_BODY);
  const email = normalizeEmail(payload?.email);

  if (!title || !body) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }

  const [stored, sent] = await Promise.all([
    store(title, body, email),
    sendEmail(title, body, email),
  ]);

  // The submission is only truly received if at least one channel took it. Failing both
  // must surface, or a suggestion vanishes while the visitor is told "thank you".
  if (!stored && !sent) {
    res.status(502).json({ error: "delivery_failed" });
    return;
  }

  res.status(200).json({ ok: true, stored, sent });
}

function safeParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
