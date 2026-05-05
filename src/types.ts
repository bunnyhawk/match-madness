export interface WordPair {
  dutch: string;
  english: string;
}

export type Vocabulary = Record<string, Record<string, WordPair[]>>;

export type CardSide = 'dutch' | 'english';

export interface Card {
  id: string;
  pairId: string;
  text: string;
  side: CardSide;
}
