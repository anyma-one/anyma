// POST /api/ching-unlock: Full Cast closed-beta unlock check (BUILD §6.1).
//
// Mirrors soul's api/deepdive-unlock.ts: checks the code and does nothing else. No model
// call, no storage. The real gate is the same check inside ching-dialogue.
//
//   200 { ok: true }          code matches CHING_PASSCODE
//   401 { error: "unlock" }   wrong or missing code
//   503 { error: "unlock" }   CHING_PASSCODE unset (Full Cast is closed)
import { checkPasscode } from "./_lib/access.js";

interface ReqLike {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}
interface ResLike {
  status: (code: number) => ResLike;
  json: (body: unknown) => void;
}

export default async function handler(req: ReqLike, res: ResLike): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "invalid" });
    return;
  }
  const access = checkPasscode(req.headers, process.env);
  if (access === "closed") return res.status(503).json({ error: "unlock" });
  if (access === "denied") return res.status(401).json({ error: "unlock" });
  res.status(200).json({ ok: true });
}
