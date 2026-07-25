import { useState } from "react";
import type { Player } from "../types";

interface Props {
  players: Player[];
  secretWord: string;
  chosenImpostors: Set<string>;
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

export function EndScreen({
  players,
  secretWord,
  chosenImpostors,
  onMainMenu,
  onPlayAgain,
}: Props) {
  const [revealedWord, setRevealedWord] = useState(false);
  const [revealedImpostors, setRevealedImpostors] = useState(false);

  return (
    <div className="end-screen">
      <h1>Game Over</h1>

      <div className="reveal-results">
        <div className="result-wrapper">
          <div
            className={`result-card word-result${revealedWord ? " revealed" : ""}`}
          >
            <span className="result-label">The secret word was</span>
            <span className="result-value">{secretWord}</span>
          </div>
          {!revealedWord && (
            <button
              className="reveal-btn overlay"
              onClick={() => setRevealedWord(true)}
            >
              Reveal Word
            </button>
          )}
        </div>

        <div className="result-wrapper">
          <div
            className={`result-card impostor-result${revealedImpostors ? " revealed" : ""}`}
          >
            <span className="result-label">
              The impostor{chosenImpostors.size !== 1 ? "s were" : " was"}
            </span>
            <div className="impostor-list">
              {players
                .filter((player) => chosenImpostors.has(player.id))
                .map((player) => (
                  <span key={player.id} className="impostor-name">
                    {player.name}
                  </span>
                ))}
            </div>
          </div>
          {!revealedImpostors && (
            <button
              className="reveal-btn overlay"
              onClick={() => setRevealedImpostors(true)}
            >
              Reveal Impostors
            </button>
          )}
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
  );
}
