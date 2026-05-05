import { useState, useEffect, useCallback } from 'react';
import type { WordPair } from '../types';
import { shuffle, stripContext } from '../utils/game';

const PAIR_COUNT = 6;
const MATCH_DELAY = 1400;
const WRONG_DELAY = 600;

interface Slot {
  pair: WordPair | null;
  slotId: string;
  state: 'idle' | 'matched' | 'wrong';
}

interface Selected {
  slotIdx: number;
  side: 'dutch' | 'english';
}

interface Props {
  allPairs: WordPair[];
  onFinish: () => void;
  onBack: () => void;
}

let uidCounter = 0;
const uid = () => `s${++uidCounter}`;

export default function GameBoard({ allPairs, onFinish, onBack }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [dutchOrder, setDutchOrder] = useState<number[]>([]);
  const [englishOrder, setEnglishOrder] = useState<number[]>([]);
  const [queue, setQueue] = useState<WordPair[]>([]);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalPairs] = useState(allPairs.length);

  const initBoard = useCallback((pairs: WordPair[]) => {
    const shuffled = shuffle(pairs);
    const onBoard = shuffled.slice(0, Math.min(PAIR_COUNT, shuffled.length));
    const remaining = shuffled.slice(onBoard.length);
    const indices = onBoard.map((_, i) => i);
    setSlots(onBoard.map(pair => ({ pair, slotId: uid(), state: 'idle' })));
    setDutchOrder(shuffle([...indices]));
    setEnglishOrder(shuffle([...indices]));
    setQueue(remaining);
    setSelected(null);
    setMatchedCount(0);
  }, []);

  useEffect(() => { initBoard(allPairs); }, [allPairs, initBoard]);

  function handleCardClick(slotIdx: number, side: 'dutch' | 'english') {
    const slot = slots[slotIdx];
    if (!slot || !slot.pair || slot.state !== 'idle') return;

    if (!selected) {
      setSelected({ slotIdx, side });
      return;
    }

    // Deselect same card
    if (selected.slotIdx === slotIdx && selected.side === side) {
      setSelected(null);
      return;
    }

    // Match: same slot, opposite side
    if (selected.slotIdx === slotIdx) {
      const newCount = matchedCount + 1;
      setMatchedCount(newCount);
      setSelected(null);
      setSlots(prev => prev.map((s, i) =>
        i === slotIdx ? { ...s, state: 'matched' } : s
      ));

      const capturedQueue = queue;
      setTimeout(() => {
        if (newCount === totalPairs) { onFinish(); return; }

        if (capturedQueue.length > 0) {
          const [next, ...rest] = capturedQueue;
          setQueue(rest);
          setSlots(prev => prev.map((s, i) =>
            i === slotIdx ? { pair: next, slotId: uid(), state: 'idle' } : s
          ));
        } else {
          setSlots(prev => prev.map((s, i) =>
            i === slotIdx ? { ...s, pair: null } : s
          ));
        }
      }, MATCH_DELAY);
      return;
    }

    // Wrong: different slots
    const prevIdx = selected.slotIdx;
    setSelected(null);
    setSlots(prev => prev.map((s, i) =>
      (i === slotIdx || i === prevIdx) ? { ...s, state: 'wrong' } : s
    ));
    setTimeout(() => {
      setSlots(prev => prev.map((s, i) =>
        (i === slotIdx || i === prevIdx) && s.state === 'wrong' ? { ...s, state: 'idle' } : s
      ));
    }, WRONG_DELAY);
  }

  const progress = totalPairs > 0 ? Math.round((matchedCount / totalPairs) * 100) : 0;

  return (
    <div className="board">
      <div className="board-header">
        <button className="back-btn" onClick={onBack}>← Sections</button>
        <span className="progress-label">{matchedCount} / {totalPairs} matched</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="columns">
        <div className="column">
          {englishOrder.map(i => {
            const slot = slots[i];
            if (!slot) return null;
            const isSelected = selected?.slotIdx === i && selected?.side === 'english';
            const cardState = slot.state !== 'idle' ? slot.state : isSelected ? 'selected' : 'idle';
            return (
              <button
                key={slot.slotId + '-english'}
                className={`card card--english card--${cardState}`}
                onClick={() => handleCardClick(i, 'english')}
                disabled={!slot.pair || slot.state !== 'idle'}
                style={{ visibility: slot.pair ? 'visible' : 'hidden' }}
              >
                {slot.pair ? stripContext(slot.pair.english) : ''}
              </button>
            );
          })}
        </div>
        <div className="column">
          {dutchOrder.map(i => {
            const slot = slots[i];
            if (!slot) return null;
            const isSelected = selected?.slotIdx === i && selected?.side === 'dutch';
            const cardState = slot.state !== 'idle' ? slot.state : isSelected ? 'selected' : 'idle';
            return (
              <button
                key={slot.slotId + '-dutch'}
                className={`card card--dutch card--${cardState}`}
                onClick={() => handleCardClick(i, 'dutch')}
                disabled={!slot.pair || slot.state !== 'idle'}
                style={{ visibility: slot.pair ? 'visible' : 'hidden' }}
              >
                {slot.pair ? stripContext(slot.pair.dutch) : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="queue-label">{queue.length} words remaining in queue</div>
    </div>
  );
}
