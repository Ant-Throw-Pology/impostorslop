import { useState } from "react";
import type { Player } from "../types";

interface Props {
  players: Player[];
  secretWord: string;
  impostorIndices: number[];
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

export function EndScreen({
  players,
  secretWord,
  impostorIndices,
  onMainMenu,
  onPlayAgain,
}: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="end-screen">
      <h1>Game Over</h1>

      {!revealed ? (
        <>
          <p className="subtitle">Ready to reveal the truth?</p>
          <button
            className="reveal-btn large"
            onClick={() => setRevealed(true)}
          >
            Reveal Word & Impostors
          </button>
        </>
      ) : (
        <div className="reveal-results">
          <div className="result-card word-result">
            <span className="result-label">The secret word was</span>
            <span className="result-value">{secretWord}</span>
          </div>

          <div className="result-card impostor-result">
            <span className="result-label">
              The impostor{impostorIndices.length !== 1 ? "s were" : " was"}
            </span>
            <div className="impostor-list">
              {impostorIndices.map((idx) => (
                <span key={idx} className="impostor-name">
                  {players[idx]!.name}
                </span>
              ))}
            </div>
          </div>

          <div className="end-actions">
            <button className="play-again-btn" onClick={onPlayAgain}>
              Play Again
            </button>
            <button className="main-menu-btn" onClick={onMainMenu}>
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
