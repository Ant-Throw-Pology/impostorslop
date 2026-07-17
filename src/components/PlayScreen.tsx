import { useState, useCallback } from "react";
import type { Player } from "../types";

interface Props {
  players: Player[];
  randomImpostors: boolean;
  chosenImpostors: Set<string>;
  secretWord: string;
  firstPlayer: Player;
  onFinish: () => void;
}

export function PlayScreen({
  players,
  randomImpostors,
  chosenImpostors,
  secretWord,
  firstPlayer,
  onFinish,
}: Props) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [seenPlayers, setSeenPlayers] = useState<Set<number>>(new Set());

  const isImpostor =
    selectedPlayer !== null &&
    chosenImpostors.has(players[selectedPlayer]?.id ?? "");

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
          <p className="start-indicator">{firstPlayer.name} starts</p>
          <div className="footer-actions">
            <button className="end-btn" onClick={() => onFinish()}>
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
                  {!randomImpostors && chosenImpostors.size > 1 && (
                    <span className="role-team">
                      {chosenImpostors.size <= 2 ? "Teammate" : "Teammates"}:{" "}
                      {players
                        .filter(
                          (player, idx) =>
                            idx !== selectedPlayer &&
                            chosenImpostors.has(player.id),
                        )
                        .map((player) => player.name)
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
