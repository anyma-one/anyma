// Deep Cast sign-up: one email, posted to the shared anyma list (the monorepo's /api/waitlist,
// project "ching"), the same double opt-in soul uses. Deep Cast opens as soon as the list
// accepts the address; the confirmation email goes out in the background.
// This device remembers only that the sign-up happened, never the email.
import { ui } from "./data";
import { KEYS, readJSON, writeJSON } from "./storage";

let signedUpThisVisit = false;

export function isSignedUp(): boolean {
  return signedUpThisVisit || readJSON<boolean>(KEYS.signedUp, false);
}

function markSignedUp(): void {
  signedUpThisVisit = true;
  writeJSON(KEYS.signedUp, true);
}

// Same check as the shared endpoint, so obvious typos are caught before a round trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(raw: string): boolean {
  const email = raw.trim();
  return email.length > 0 && email.length <= 254 && EMAIL_RE.test(email);
}

export type SignupOutcome = { ok: true } | { ok: false; message: string };

/** Where the sign-up came from. The shared list stores only sources it knows, so "full-cast"
 *  is dropped there until the monorepo adds it (README, Monorepo follow-up). */
export type SignupSource = "deep-cast" | "full-cast";

export async function signUp(email: string, source: SignupSource = "deep-cast"): Promise<SignupOutcome> {
  const e = ui.gate.signup.errors;
  const trimmed = email.trim();
  if (!isValidEmail(trimmed)) return { ok: false, message: e.invalid };
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed, interest: "ching", source }),
    });
    if (res.ok) {
      markSignedUp();
      return { ok: true };
    }
    if (res.status === 400) return { ok: false, message: e.invalid };
    if (res.status === 501) return { ok: false, message: e.notLive };
    return { ok: false, message: e.generic };
  } catch {
    return { ok: false, message: e.network };
  }
}
