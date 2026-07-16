import { useState, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { InitScreen } from "./InitScreen";
import { PlayScreen } from "./PlayScreen";
import { EndScreen } from "./EndScreen";
import { RulesModal } from "./RulesModal";
import "../index.css";
import type { Player, Screen } from "../types";
import { makeId } from "../types";

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
  const [impostorIndices, setImpostorIndices] = useState<number[]>([]);
  const [showRules, setShowRules] = useState(false);

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
      setRandomImpostors(isRandom);
      if (isRandom) {
        const count = newPlayers.length;
        const random = Math.floor(Math.random() * (count - 1)) + 1;
        setNumImpostors(random);
      } else {
        setNumImpostors(newNumImpostors);
      }
      setScreen("play");
    },
    [],
  );

  const handleFinish = useCallback((word: string, indices: number[]) => {
    setSecretWord(word);
    setImpostorIndices(indices);
    setScreen("end");
  }, []);

  const handleMainMenu = useCallback(() => {
    setScreen("init");
    setSecretWord("");
    setImpostorIndices([]);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setScreen("play");
    setSecretWord("");
    setImpostorIndices([]);
  }, []);

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
          players={players}
          setPlayers={setPlayers}
          numImpostors={numImpostors}
          setNumImpostors={setNumImpostors}
          randomImpostors={randomImpostors}
          setRandomImpostors={setRandomImpostors}
          onStart={handleStart}
        />
      )}
      {screen === "play" && (
        <PlayScreen
          players={players}
          numImpostors={numImpostors}
          onFinish={handleFinish}
        />
      )}
      {screen === "end" && (
        <EndScreen
          players={players}
          secretWord={secretWord}
          impostorIndices={impostorIndices}
          onMainMenu={handleMainMenu}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;
