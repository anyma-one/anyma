// usage.js: server-side usage limits for the Full Cast dialogue (BUILD.md §6.3).
// Lives in api/_lib so Vercel doesn't deploy it as a route.
//
// Mechanism (decided): count messages per readingId, track the distinct readingIds of each
// unlock, and add up tokens per UTC day. Values come from env and are open (BUILD §10); if any
// is missing the dialogue fails closed. Stores keep only hashes and counters, never text.

export const LIMIT_VARS = ['CHING_MAX_MESSAGES_PER_READING', 'CHING_MAX_READINGS_PER_UNLOCK', 'CHING_DAILY_TOKEN_CAP'];

/** Parsed limits, or null when any is missing or not a positive integer (= fail closed). */
export function readLimits(env) {
  const vals = LIMIT_VARS.map((k) => {
    const raw = env[k];
    if (raw === undefined || String(raw).trim() === '') return NaN;
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : NaN;
  });
  if (vals.some(Number.isNaN)) return null;
  const [maxMessages, maxReadings, dailyCap] = vals;
  return { maxMessages, maxReadings, dailyCap };
}

/** UTC day key for the token counter. */
export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Tokens a request used. Input usage comes from message_start, output from the final
 * message_delta. With prompt caching the system prompt is counted in the cache fields.
 */
export function usageTokens(start = {}, delta = {}) {
  const n = (v) => (Number.isFinite(v) ? v : 0);
  return (
    n(start.input_tokens) +
    n(start.cache_creation_input_tokens) +
    n(start.cache_read_input_tokens) +
    n(delta.output_tokens ?? start.output_tokens)
  );
}

/**
 * In-memory store, for local dev and tests only. Same contract as supabaseStore().
 */
export function memoryStore() {
  const readings = new Map(); // readingId -> { unlockId, messages }
  const tokens = new Map(); // day -> n
  return {
    async countMessage({ readingId, unlockId, maxMessages, maxReadings }) {
      let r = readings.get(readingId);
      if (!r) {
        const used = [...readings.values()].filter((x) => x.unlockId === unlockId).length;
        if (used >= maxReadings) return 'limit';
        r = { unlockId, messages: 0 };
        readings.set(readingId, r);
      }
      if (r.messages >= maxMessages) return 'limit';
      r.messages += 1;
      return 'ok';
    },
    async tokensToday(day) {
      return tokens.get(day) ?? 0;
    },
    async addTokens(day, n) {
      tokens.set(day, (tokens.get(day) ?? 0) + n);
    },
  };
}

/**
 * Supabase store over PostgREST, the way the monorepo's other functions talk to Supabase
 * (service-role key, plain fetch). The counting is one SQL function, so it's atomic; the
 * tables and functions are in supabase/ching.sql.
 */
export function supabaseStore(url, key, fetchImpl = fetch) {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  const rpc = async (fn, args) => {
    const res = await fetchImpl(`${url}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) });
    if (!res.ok) throw new Error(`supabase ${fn} ${res.status}`);
    return res.json();
  };
  return {
    async countMessage({ readingId, unlockId, maxMessages, maxReadings }) {
      const out = await rpc('ching_count_message', {
        p_reading_id: readingId,
        p_unlock_id: unlockId,
        p_max_messages: maxMessages,
        p_max_readings: maxReadings,
      });
      return out === 'ok' ? 'ok' : 'limit';
    },
    async tokensToday(day) {
      return Number(await rpc('ching_tokens_today', { p_day: day })) || 0;
    },
    async addTokens(day, n) {
      await rpc('ching_add_tokens', { p_day: day, p_tokens: n });
    },
  };
}

/**
 * The store for this environment, or null (= fail closed).
 * The memory store is allowed only off Vercel and only when asked for explicitly.
 */
export function storeFromEnv(env) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseStore(env.SUPABASE_URL.replace(/\/+$/, ''), env.SUPABASE_SERVICE_ROLE_KEY);
  }
  if (!env.VERCEL && env.CHING_DEV_MEMORY_STORE === '1') {
    globalThis.__chingMemoryStore ??= memoryStore();
    return globalThis.__chingMemoryStore;
  }
  return null;
}
