import type { WordPair, Card } from '../types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Remove parenthetical clarifications from display text, e.g.
// "you (singular informal stressed)" → "you"
// "(little) cup" → "cup"
export function stripContext(text: string): string {
  return text.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}

// Pick `count` pairs such that no two share the same stripped display text on either side.
// Returns the picked pairs and whatever was left over (to use as queue).
export function pickWithoutConflicts(
  candidates: WordPair[],
  count: number
): { picked: WordPair[]; rest: WordPair[] } {
  const picked: WordPair[] = [];
  const rest: WordPair[] = [];
  const seenDutch = new Set<string>();
  const seenEnglish = new Set<string>();
  for (const pair of candidates) {
    const d = stripContext(pair.dutch);
    const e = stripContext(pair.english);
    if (picked.length < count && !seenDutch.has(d) && !seenEnglish.has(e)) {
      picked.push(pair);
      seenDutch.add(d);
      seenEnglish.add(e);
    } else {
      rest.push(pair);
    }
  }
  return { picked, rest };
}

// Find the first queue item that doesn't conflict with currently visible pairs.
// Falls back to the first item if everything conflicts.
export function nextFromQueue(
  queue: WordPair[],
  visible: WordPair[]
): { next: WordPair; rest: WordPair[] } {
  const seenDutch = new Set(visible.map(p => stripContext(p.dutch)));
  const seenEnglish = new Set(visible.map(p => stripContext(p.english)));
  const idx = queue.findIndex(
    p => !seenDutch.has(stripContext(p.dutch)) && !seenEnglish.has(stripContext(p.english))
  );
  const useIdx = idx >= 0 ? idx : 0;
  return { next: queue[useIdx], rest: queue.filter((_, i) => i !== useIdx) };
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
