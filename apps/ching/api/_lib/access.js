// access.js: the Full Cast closed-beta gate. Mirrors soul's DEEPDIVE_PASSCODE gate
// (api/deepdive-unlock.ts in the monorepo) until a paid unlock replaces it (BUILD §6.1, §10).
//
// The client sends the code in the `x-ching-passcode` header (URI-encoded) and a random
// per-device id in the body's `unlock` field. Fails CLOSED: with CHING_PASSCODE unset nothing
// gets through.

import { createHash, timingSafeEqual } from 'node:crypto';

export const PASSCODE_HEADER = 'x-ching-passcode';

const digest = (s) => createHash('sha256').update(s.trim()).digest();

/** 'ok' | 'closed' (no code configured) | 'denied' (wrong or missing code). */
export function checkPasscode(headers, env) {
  const expected = env.CHING_PASSCODE?.trim();
  if (!expected) return 'closed';
  const raw = headers?.[PASSCODE_HEADER];
  let given = (Array.isArray(raw) ? raw[0] : raw) ?? '';
  try {
    given = decodeURIComponent(given);
  } catch {
    // Malformed encoding: compare as-is; it won't match.
  }
  return timingSafeEqual(digest(given), digest(expected)) ? 'ok' : 'denied';
}

/**
 * The id usage limits are counted against. With one shared beta code, the device id keeps
 * testers apart; it's client-chosen, so it isn't a hard boundary. The daily token cap is the
 * backstop. A paid unlock would use its purchase id here instead.
 */
export function unlockIdFor(env, device) {
  const d = typeof device === 'string' && /^[a-z0-9-]{8,64}$/i.test(device) ? device : 'none';
  return createHash('sha256').update(`${env.CHING_PASSCODE?.trim() ?? ''}|${d}`).digest('hex');
}
