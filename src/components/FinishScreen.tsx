interface Props {
  totalPairs: number;
  onPlayAgain: () => void;
  onBack: () => void;
}

export default function FinishScreen({ totalPairs, onPlayAgain, onBack }: Props) {
  return (
    <div className="finish">
      <div className="finish-icon">🎉</div>
      <h2>All matched!</h2>
      <p>{totalPairs} word pairs completed.</p>
      <div className="finish-actions">
        <button className="start-btn" onClick={onPlayAgain}>Play Again</button>
        <button className="back-btn" onClick={onBack}>Choose Sections</button>
      </div>
    </div>
  );
}
