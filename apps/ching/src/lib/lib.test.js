// Run with: node --test src/lib/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { castLine, castHexagram, lineFromTotal, lineFromCoins, indexByBinary, resolve, LINE_TYPES } from './cast.js';
import { buildReading, templateParts } from './reading.js';
import { isYesNo, isRecast } from './question.js';

const load = (p) => JSON.parse(readFileSync(new URL(`../../data/${p}`, import.meta.url)));
const hexagrams = load('hexagrams.json');
const trigrams = load('trigrams.json');
const copy = load('copy.json');
const samples = load('sample-casts.json').casts;
const data = { hexagrams, trigrams, copy };
const byBinary = indexByBinary(hexagrams);
const fromTotals = (totals) => totals.map(lineFromTotal);

test('coin totals follow the 1/8, 3/8, 3/8, 1/8 distribution', () => {
  const N = 200_000;
  const counts = { 6: 0, 7: 0, 8: 0, 9: 0 };
  for (let i = 0; i < N; i++) counts[castLine().total]++;
  const expected = { 6: 1 / 8, 7: 3 / 8, 8: 3 / 8, 9: 1 / 8 };
  for (const t of [6, 7, 8, 9]) {
    assert.ok(Math.abs(counts[t] / N - expected[t]) < 0.006, `total ${t}: ${counts[t] / N}`);
  }
});

test('coins always match their total and line type', () => {
  for (let i = 0; i < 1000; i++) {
    const l = castLine();
    assert.equal(l.coins.reduce((a, b) => a + b, 0), l.total);
    assert.deepEqual({ key: l.key, yang: l.yang, changing: l.changing }, {
      key: LINE_TYPES[l.total].key, yang: LINE_TYPES[l.total].yang, changing: LINE_TYPES[l.total].changing,
    });
  }
});

test('a cast has six lines and always resolves to a valid hexagram', () => {
  for (let i = 0; i < 2000; i++) {
    const lines = castHexagram();
    assert.equal(lines.length, 6);
    const r = resolve(lines, byBinary);
    assert.ok(r.primary >= 1 && r.primary <= 64);
    assert.equal(r.second === null, r.changingLines.length === 0);
    if (r.second) assert.ok(r.second >= 1 && r.second <= 64);
  }
});

test('every one of the 64 patterns resolves to its own number', () => {
  for (const h of hexagrams) {
    const lines = h.lines.map((b) => lineFromTotal(b ? 7 : 8));
    assert.equal(resolve(lines, byBinary).primary, h.number);
  }
});

test('changing lines flip into the second hexagram', () => {
  // 3 Beginning with line 5 changing becomes 24 Turning Back
  assert.deepEqual(resolve(fromTotals([7, 8, 8, 8, 9, 8]), byBinary), { primary: 3, second: 24, changingLines: [5] });
  // 1 Initiating with all six changing becomes 2 Responding
  assert.deepEqual(resolve(fromTotals([9, 9, 9, 9, 9, 9]), byBinary), { primary: 1, second: 2, changingLines: [1, 2, 3, 4, 5, 6] });
  // 2 Responding with all six changing becomes 1 Initiating
  assert.equal(resolve(fromTotals([6, 6, 6, 6, 6, 6]), byBinary).second, 1);
});

test('injected coins make casts reproducible', () => {
  const seq = [3, 3, 3, 2, 2, 2, 3, 2, 2, 3, 3, 2, 3, 3, 3, 2, 2, 2];
  let i = 0;
  const lines = castHexagram(() => seq[i++]);
  assert.deepEqual(lines.map((l) => l.total), [9, 6, 7, 8, 9, 6]);
});

test('buildReading reproduces the design sample casts exactly', () => {
  for (const s of samples) {
    const cast = { question: s.question, lines: fromTotals(s.tosses.map((t) => t.total)) };
    const r = buildReading(cast, 'full', data);
    const d = buildReading(cast, 'deep', data);
    assert.equal(r.primary.number, s.primary.number, s.case);
    assert.equal(r.full.second?.number ?? null, s.second?.number ?? null, s.case);
    assert.deepEqual(r.changingLines, s.changingLines);
    assert.equal(r.quick.judgment, s.quickCast.judgment);
    assert.equal(r.quick.honestFrame, s.quickCast.honestFrame);
    assert.equal(d.deep.changingFraming, s.deepCast.changingFraming, s.case);
    assert.equal(r.full.changingFraming, s.fullCast.changingFraming, s.case);
    assert.deepEqual(d.deep.reflections, s.deepCast.reflections);
    assert.deepEqual(d.deep.changingLineTexts, s.deepCast.changingLineTexts);
    assert.equal(d.deep.allChangingText, s.deepCast.allChangingText);
    assert.equal(d.deep.secondTeaser?.text ?? null, s.deepCast.secondTeaser);
    assert.deepEqual(r.full.allLines, s.fullCast.allLines);
    assert.equal(r.full.second?.meaning ?? null, s.fullCast.second?.meaning ?? null);
  }
});

test('each level shows only its own content', () => {
  const cast = { question: 'q', lines: fromTotals([7, 8, 8, 8, 9, 8]) };
  const quick = buildReading(cast, 'quick', data);
  const deep = buildReading(cast, 'deep', data);
  assert.ok(quick.quick && !quick.deep && !quick.full);
  assert.ok(deep.deep && !deep.full);
  // Deep Cast shows the second hexagram's name, never its texts
  assert.deepEqual(Object.keys(deep.deep.secondTeaser).sort(), ['cta', 'glyph', 'name', 'number', 'parts', 'text']);
  assert.ok(!JSON.stringify(deep).includes(hexagrams[23].general), 'second hexagram Meaning must not leak below Full Cast');
  // Deep Cast shows only changing-line texts
  assert.deepEqual(deep.deep.changingLineTexts.map((l) => l.line), [5]);
  // Full Cast replaces Deep Cast's framing, line list and purchase teaser
  const full = buildReading(cast, 'full', data);
  assert.equal(full.deep.changingFraming, null);
  assert.deepEqual(full.deep.changingLineTexts, []);
  assert.equal(full.deep.secondTeaser, null);
  assert.ok(full.deep.meaning && full.full.second.meaning);
});

test('teaser parts keep the glyph as its own token', () => {
  const parts = templateParts('Toward {glyph} {name}. More in {level}.', { glyph: '䷗', name: 'Turning Back' });
  assert.deepEqual(parts.filter((p) => p.token).map((p) => p.token), ['glyph', 'name']);
  assert.ok(parts.some((p) => p.text?.includes('{level}')), 'unknown tokens stay as text');
});

test('lines rebuilt from coins keep their faces', () => {
  const l = lineFromCoins([3, 2, 3]);
  assert.deepEqual(l.coins, [3, 2, 3]);
  assert.equal(l.total, 8);
  assert.throws(() => lineFromCoins([3, 3]));
  assert.throws(() => lineFromCoins([3, 3, 4]));
});

test('no copy placeholders survive into a reading', () => {
  for (const s of samples) {
    const cast = { question: s.question, lines: fromTotals(s.tosses.map((t) => t.total)) };
    const text = JSON.stringify(buildReading(cast, 'full', data));
    assert.ok(!/\{(count|glyph|name)\}/.test(text), s.case);
  }
});

test('yes/no detection', () => {
  for (const q of ['Will I get the job?', 'Should I move?', 'is this right', 'Can we fix it?', "Shouldn't I go?", 'Won’t it work?', '“Will I win?”']) assert.ok(isYesNo(q), q);
  for (const q of ['What should I understand about the job?', 'How can I approach this?', 'Willow trees and me']) assert.ok(!isYesNo(q), q);
});

test('re-cast detection', () => {
  const prev = ['What should I understand about leaving my job?'];
  assert.ok(isRecast('What should I understand about leaving my job', prev));
  assert.ok(isRecast('what should i understand about leaving my job!!', prev));
  assert.ok(!isRecast('How can I approach my new studio?', prev));
  assert.ok(isRecast('Go on?', ['go on']), 'short exact repeats count');
  assert.ok(!isRecast('What should I understand about the talk with my mother this week?',
    ['What should I understand about the talk with my father this week?']), 'one key word differs');
});
