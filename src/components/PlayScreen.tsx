import { useState, useCallback, useMemo } from "react";
import { pickRandomWord } from "../words";
import type { Player } from "../types";

interface Props {
  players: Player[];
  numImpostors: number;
  onFinish: (secretWord: string, impostorIndices: number[]) => void;
}

export function PlayScreen({ players, numImpostors, onFinish }: Props) {
  const [impostorIndices] = useState<number[]>(() => {
    const indices = Array.from({ length: players.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j]!, indices[i]!];
    }
    return indices.slice(0, numImpostors);
  });
  const [secretWord] = useState(() => pickRandomWord());
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [seenPlayers, setSeenPlayers] = useState<Set<number>>(new Set());

  const firstPlayer = useMemo(() => {
    const crewmateIndices = players
      .map((_, i) => i)
      .filter((i) => !impostorIndices.includes(i));
    return crewmateIndices[Math.floor(Math.random() * crewmateIndices.length)]!;
  }, [players, impostorIndices]);

  const isImpostor =
    selectedPlayer !== null && impostorIndices.includes(selectedPlayer);

  const handlePlayerTap = useCallback((index: number) => {
    setSelectedPlayer(index);
    setRevealed(false);
  }, []);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleHide = useCallback(() => {
    if (selectedPlayer !== null) {
      setSeenPlayers((prev) => new Set(prev).add(selectedPlayer));
    }
    setSelectedPlayer(null);
    setRevealed(false);
  }, [selectedPlayer]);

  return (
    <div className="play-screen">
      <h1>Impostor</h1>
      <p className="subtitle">Pass the device to each player</p>

      {selectedPlayer === null ? (
        <>
          <div className="player-list play-list">
            {players.map((player, i) => (
              <button
                key={player.id}
                className={`player-btn${seenPlayers.has(i) ? " seen" : ""}`}
                onClick={() => handlePlayerTap(i)}
                disabled={seenPlayers.has(i)}
              >
                {player.name}
              </button>
            ))}
          </div>
          <p className="start-indicator">
            {players[firstPlayer]!.name} starts
          </p>
          <div className="footer-actions">
            <button
              className="end-btn"
              onClick={() => onFinish(secretWord, impostorIndices)}
            >
              Game Over
            </button>
          </div>
        </>
      ) : (
        <div className="reveal-card">
          {!revealed ? (
            <>
              <h2 className="reveal-name">{players[selectedPlayer]!.name}</h2>
              <p className="reveal-prompt">Ready?</p>
              <button className="reveal-btn" onClick={handleReveal}>
                Tap to Reveal
              </button>
            </>
          ) : (
            <>
              <h2 className="reveal-name">{players[selectedPlayer]!.name}</h2>
              {isImpostor ? (
                <div className="reveal-role impostor-role">
                  <span className="role-label">You are an</span>
                  <span className="role-word">Impostor</span>
                  {impostorIndices.length > 1 && (
                    <span className="role-team">
                      Teammates:{" "}
                      {impostorIndices
                        .filter((idx) => idx !== selectedPlayer)
                        .map((idx) => players[idx]!.name)
                        .join(", ")}
                    </span>
                  )}
                  <span className="role-hint">Bluff your way through!</span>
                </div>
              ) : (
                <div className="reveal-role word-role">
                  <span className="role-label">The word is</span>
                  <span className="role-word">{secretWord}</span>
                  <span className="role-hint">
                    Describe it without saying it!
                  </span>
                </div>
              )}
              <button className="hide-btn" onClick={handleHide}>
                Hide
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
