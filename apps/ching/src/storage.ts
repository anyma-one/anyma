// Browser storage. Every access is wrapped: the app must work without it (BUILD §4).

export const KEYS = {
  current: "ching.current",
  history: "ching.history",
  casts: "ching.castsCompleted",
  passcode: "ching.passcode",
  device: "ching.device",
  session: "ching.sessionStart",
  signedUp: "ching.signedUp",
} as const;

export function readJSON<T>(key: string, fallback: T, store: "local" | "session" = "local"): T {
  try {
    const raw = (store === "local" ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns false when storage is unavailable. */
export function writeJSON(key: string, value: unknown, store: "local" | "session" = "local"): boolean {
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Start of this browser session. The re-cast note compares only against history from this
 * session (BUILD §10 item 6, default until the owner decides).
 */
export function sessionStart(): number {
  const existing = readJSON<number | null>(KEYS.session, null, "session");
  if (existing) return existing;
  const now = Date.now();
  writeJSON(KEYS.session, now, "session");
  return now;
}
