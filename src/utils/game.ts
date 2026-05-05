import type { WordPair, Card } from '../types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dedupe(pairs: WordPair[]): WordPair[] {
  const seen = new Set<string>();
  return pairs.filter(p => {
    const key = `${p.dutch}|${p.english}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function makeDeck(pairs: WordPair[], pairCount: number): Card[] {
  const selected = shuffle(pairs).slice(0, pairCount);
  const cards: Card[] = [];
  selected.forEach((pair, i) => {
    const pairId = `pair-${i}`;
    cards.push({ id: `${pairId}-dutch`, pairId, text: pair.dutch, side: 'dutch' });
    cards.push({ id: `${pairId}-english`, pairId, text: pair.english, side: 'english' });
  });
  return shuffle(cards);
}
