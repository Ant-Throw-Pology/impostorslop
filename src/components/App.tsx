import { useState, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { InitScreen } from "./InitScreen";
import { PlayScreen } from "./PlayScreen";
import { EndScreen } from "./EndScreen";
import { RulesModal } from "./RulesModal";
import "../index.css";
import type { Player, Screen } from "../types";
import { makeId } from "../types";
import { pickRandomWord } from "@/words";

function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem("impostor_players");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: makeId(), name: "" },
    { id: makeId(), name: "" },
    { id: makeId(), name: "" },
  ];
}

function loadNumImpostors(): number {
  try {
    const raw = localStorage.getItem("impostor_numImpostors");
    if (raw) return JSON.parse(raw);
  } catch {}
  return 1;
}

function loadRandomImpostors(): boolean {
  try {
    const raw = localStorage.getItem("impostor_randomImpostors");
    if (raw) return JSON.parse(raw);
  } catch {}
  return false;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("init");
  const [players, setPlayers] = useState<Player[]>(loadPlayers);
  const [numImpostors, setNumImpostors] = useState<number>(loadNumImpostors);
  const [randomImpostors, setRandomImpostors] =
    useState<boolean>(loadRandomImpostors);
  const [secretWord, setSecretWord] = useState("");
  const [chosenImpostors, setChosenImpostors] = useState<Set<string>>(
    new Set(),
  );
  const [showRules, setShowRules] = useState(false);

  const gameSetup = useCallback(
    (newPlayers: Player[], userNumImpostors: number, isRandom: boolean) => {
      const numImpostors = isRandom
        ? Math.floor(Math.random() * (newPlayers.length - 1)) + 1
        : userNumImpostors;

      setChosenImpostors(() => {
        const ids = new Set<string>(),
          players2 = [...newPlayers];
        for (let i = 0; i < numImpostors; i++) {
          ids.add(
            players2.splice(Math.floor(Math.random() * players2.length), 1)[0]!
              .id,
          );
        }
        return ids;
      });
      setSecretWord(pickRandomWord());
    },
    [],
  );

  const handleStart = useCallback(
    (newPlayers: Player[], newNumImpostors: number, isRandom: boolean) => {
      localStorage.setItem("impostor_players", JSON.stringify(newPlayers));
      localStorage.setItem(
        "impostor_numImpostors",
        JSON.stringify(newNumImpostors),
      );
      localStorage.setItem(
        "impostor_randomImpostors",
        JSON.stringify(isRandom),
      );
      setPlayers(newPlayers);
      setNumImpostors(newNumImpostors);
      setRandomImpostors(isRandom);
      gameSetup(newPlayers, newNumImpostors, isRandom);
      setScreen("play");
    },
    [],
  );

  const handleFinish = useCallback(() => {
    setScreen("end");
  }, []);

  const handleMainMenu = useCallback(() => {
    setScreen("init");
    setSecretWord("");
    setChosenImpostors(new Set());
  }, []);

  const handlePlayAgain = useCallback(() => {
    gameSetup(players, numImpostors, randomImpostors);
    setScreen("play");
  }, [players, numImpostors, randomImpostors]);

  return (
    <div className="app">
      <button
        className="help-btn"
        onClick={() => setShowRules(true)}
        aria-label="Rules"
      >
        <HelpCircle size={20} />
      </button>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {screen === "init" && (
        <InitScreen
          initialPlayers={players}
          initialNumImpostors={numImpostors}
          initialRandomImpostors={randomImpostors}
          onStart={handleStart}
        />
      )}
      {screen === "play" && (
        <PlayScreen
          players={players}
          randomImpostors={randomImpostors}
          chosenImpostors={chosenImpostors}
          secretWord={secretWord}
          onFinish={handleFinish}
        />
      )}
      {screen === "end" && (
        <EndScreen
          players={players}
          secretWord={secretWord}
          chosenImpostors={chosenImpostors}
          onMainMenu={handleMainMenu}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;
