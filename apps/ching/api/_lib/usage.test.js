import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readLimits, usageTokens, memoryStore, storeFromEnv } from './usage.js';

const full = { CHING_MAX_MESSAGES_PER_READING: '3', CHING_MAX_READINGS_PER_UNLOCK: '2', CHING_DAILY_TOKEN_CAP: '1000' };

test('limits fail closed when any value is missing or invalid', () => {
  assert.deepEqual(readLimits(full), { maxMessages: 3, maxReadings: 2, dailyCap: 1000 });
  for (const k of Object.keys(full)) {
    assert.equal(readLimits({ ...full, [k]: undefined }), null, `${k} missing`);
    assert.equal(readLimits({ ...full, [k]: '' }), null, `${k} empty`);
    assert.equal(readLimits({ ...full, [k]: '0' }), null, `${k} zero`);
    assert.equal(readLimits({ ...full, [k]: 'lots' }), null, `${k} not a number`);
  }
});

test('token usage adds input, both cache fields and output', () => {
  const start = { input_tokens: 10, cache_creation_input_tokens: 2000, cache_read_input_tokens: 0, output_tokens: 1 };
  assert.equal(usageTokens(start, { output_tokens: 120 }), 2130);
  assert.equal(usageTokens(start, {}), 2011);
  assert.equal(usageTokens(), 0);
});

test('message and reading limits per unlock', async () => {
  const s = memoryStore();
  const lim = { maxMessages: 2, maxReadings: 2 };
  assert.equal(await s.countMessage({ readingId: 'r1', unlockId: 'u', ...lim }), 'ok');
  assert.equal(await s.countMessage({ readingId: 'r1', unlockId: 'u', ...lim }), 'ok');
  assert.equal(await s.countMessage({ readingId: 'r1', unlockId: 'u', ...lim }), 'limit');
  assert.equal(await s.countMessage({ readingId: 'r2', unlockId: 'u', ...lim }), 'ok');
  assert.equal(await s.countMessage({ readingId: 'r3', unlockId: 'u', ...lim }), 'limit');
  assert.equal(await s.countMessage({ readingId: 'r3', unlockId: 'other', ...lim }), 'ok');
});

test('daily tokens accumulate per day', async () => {
  const s = memoryStore();
  await s.addTokens('2026-11-09', 500);
  await s.addTokens('2026-11-09', 250);
  assert.equal(await s.tokensToday('2026-11-09'), 750);
  assert.equal(await s.tokensToday('2026-11-10'), 0);
});

test('no store without Supabase, and never the memory store on Vercel', () => {
  assert.equal(storeFromEnv({}), null);
  assert.equal(storeFromEnv({ VERCEL: '1', CHING_DEV_MEMORY_STORE: '1' }), null);
  assert.ok(storeFromEnv({ CHING_DEV_MEMORY_STORE: '1' }));
});
