import { useState } from 'react';
import SectionPicker from './components/SectionPicker';
import GameBoard from './components/GameBoard';
import FinishScreen from './components/FinishScreen';
import type { WordPair } from './types';
import { dedupe } from './utils/game';

type Screen = 'picker' | 'game' | 'finish';

export default function App() {
  const [screen, setScreen] = useState<Screen>('picker');
  const [activePairs, setActivePairs] = useState<WordPair[]>([]);

  function handleStart(pairs: WordPair[]) {
    setActivePairs(dedupe(pairs));
    setScreen('game');
  }

  function handleFinish() {
    setScreen('finish');
  }

  function handlePlayAgain() {
    setScreen('game');
  }

  function handleBack() {
    setScreen('picker');
  }

  return (
    <div className="app">
      {screen === 'picker' && <SectionPicker onStart={handleStart} />}
      {screen === 'game' && (
        <GameBoard
          key={activePairs.map(p => p.dutch).join(',')}
          allPairs={activePairs}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      )}
      {screen === 'finish' && (
        <FinishScreen
          totalPairs={activePairs.length}
          onPlayAgain={handlePlayAgain}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
