// Daily housekeeping (Vercel Cron, vercel.json): keeps Supabase awake and deletes stale
// unconfirmed sign-ups.
//
// SELF-CONTAINED (README §4 / HANDOVER §4).
//
// Supabase pauses a free-plan project after about a week with no database activity,
// and this site's traffic alone does not reliably prevent that. A Vercel Cron job
// (vercel.json) calls this once a day; it makes one tiny read (a single waitlist id)
// so the project always counts as active. It returns nothing from the table.
//
// It also deletes waitlist rows that were never confirmed within 30 days of the (latest)
// sign-up, as the privacy policy promises. Confirmed rows are never touched here.
//
// If CRON_SECRET is set in Vercel, Vercel sends it as `Authorization: Bearer …` on
// cron calls and anything else is refused. Without it anyone can trigger the run, which is
// harmless: the read returns nothing and the delete only removes rows that are due anyway.

// Double opt-in tables. Each has `verified` and `consent_at` (refreshed on every sign-up).
const UNCONFIRMED_TABLES = ["waitlist", "dosha_individual_waitlist"];
const UNCONFIRMED_TTL_DAYS = 30;

interface ReqLike {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}
interface ResLike {
  status: (code: number) => ResLike;
  json: (body: unknown) => void;
}

export default async function handler(req: ReqLike, res: ResLike): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers?.authorization;
    if ((Array.isArray(auth) ? auth[0] : auth) !== `Bearer ${secret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(501).json({ error: "Supabase not configured" });
    return;
  }
  try {
    const r = await fetch(`${url}/rest/v1/waitlist?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      res.status(502).json({ ok: false, status: r.status });
      return;
    }

    const cutoff = new Date(Date.now() - UNCONFIRMED_TTL_DAYS * 86_400_000).toISOString();
    const deleted: Record<string, number | string> = {};
    for (const table of UNCONFIRMED_TABLES) {
      const d = await fetch(
        `${url}/rest/v1/${table}?verified=eq.false&consent_at=lt.${encodeURIComponent(cutoff)}`,
        {
          method: "DELETE",
          headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal,count=exact" },
        }
      );
      // Report per table rather than failing the run: one missing table must not stop the
      // other from being cleaned, nor the keep-alive read from counting.
      // count=exact reports how many rows went in Content-Range ("*/3") without returning them.
      deleted[table] = d.ok
        ? Number(d.headers.get("content-range")?.split("/")[1] ?? 0)
        : `error ${d.status}`;
    }
    res.status(200).json({ ok: true, deleted });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ ok: false, detail });
  }
}
