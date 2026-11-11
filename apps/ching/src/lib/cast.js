// cast.js: the coin cast and hexagram lookup.
//
// Three fair coins per line. Heads (the yang side) counts 3, tails (the yin side) counts 2.
// The total is 6, 7, 8 or 9 with odds 1/8, 3/8, 3/8, 1/8. These uneven odds are correct:
// never replace this with a uniform pick of a line type.
// Lines are always ordered bottom to top: index 0 is line 1.

export const LINE_TYPES = {
  6: { key: 'oldYin', name: 'old yin', yang: false, changing: true },
  7: { key: 'youngYang', name: 'young yang', yang: true, changing: false },
  8: { key: 'youngYin', name: 'young yin', yang: false, changing: false },
  9: { key: 'oldYang', name: 'old yang', yang: true, changing: true },
};

// Fair coin from the platform's cryptographic random source.
export function cryptoCoin() {
  const b = new Uint8Array(1);
  globalThis.crypto.getRandomValues(b);
  return (b[0] & 1) === 0 ? 2 : 3;
}

// One toss of three coins. `coin` is injectable for tests and replays.
export function castLine(coin = cryptoCoin) {
  const coins = [coin(), coin(), coin()];
  const total = coins[0] + coins[1] + coins[2];
  return { coins, total, ...LINE_TYPES[total] };
}

// Six tosses, bottom to top.
export function castHexagram(coin = cryptoCoin) {
  return Array.from({ length: 6 }, () => castLine(coin));
}

// Rebuild a line from a known total (for replays, saved readings and tests).
export function lineFromTotal(total) {
  if (!LINE_TYPES[total]) throw new Error(`Invalid line total: ${total}`);
  return { total, ...LINE_TYPES[total] };
}

// Rebuild a line from its three coin values (preferred for saved casts: keeps the faces).
export function lineFromCoins(coins) {
  if (!Array.isArray(coins) || coins.length !== 3 || !coins.every((c) => c === 2 || c === 3)) {
    throw new Error('A toss is three coins, each 2 or 3.');
  }
  return { coins: [...coins], ...lineFromTotal(coins[0] + coins[1] + coins[2]) };
}

// Map "101010"-style binary strings (bottom to top) to King Wen numbers.
export function indexByBinary(hexagrams) {
  return new Map(hexagrams.map((h) => [h.binary, h.number]));
}

// Primary and second hexagram for a cast, plus changing line positions (1 to 6).
export function resolve(lines, byBinary) {
  if (lines.length !== 6) throw new Error('A cast has exactly six lines.');
  const bit = (l) => (l.yang ? 1 : 0);
  const primaryBits = lines.map(bit).join('');
  const secondBits = lines.map((l) => (l.changing ? 1 - bit(l) : bit(l))).join('');
  const changingLines = lines.flatMap((l, i) => (l.changing ? [i + 1] : []));
  return {
    primary: byBinary.get(primaryBits),
    second: changingLines.length ? byBinary.get(secondBits) : null,
    changingLines,
  };
}
