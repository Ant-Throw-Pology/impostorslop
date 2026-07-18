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
import {
  otherSettingsDefaults,
  type OtherSettings,
} from "./OtherSettingsModal";

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

function loadOtherSettings(): OtherSettings {
  try {
    const raw = localStorage.getItem("impostor_otherSettings");
    if (raw) return { ...otherSettingsDefaults, ...JSON.parse(raw) };
  } catch {}
  return otherSettingsDefaults;
}

function sampleBinomial(n: number, p: number) {
  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < p) successes++;
  }
  return successes;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("init");
  const [players, setPlayers] = useState<Player[]>(loadPlayers);
  const [numImpostors, setNumImpostors] = useState<number>(loadNumImpostors);
  const [randomImpostors, setRandomImpostors] =
    useState<boolean>(loadRandomImpostors);
  const [otherSettings, setOtherSettings] =
    useState<OtherSettings>(loadOtherSettings);
  const [secretWord, setSecretWord] = useState("");
  const [chosenImpostors, setChosenImpostors] = useState<Set<string>>(
    new Set(),
  );
  const [firstPlayer, setFirstPlayer] = useState<Player>();
  const [showRules, setShowRules] = useState(false);

  const gameSetup = useCallback(
    (
      newPlayers: Player[],
      userNumImpostors: number,
      isRandom: boolean,
      otherSettings: OtherSettings,
    ) => {
      const numImpostors = isRandom
        ? otherSettings.chaosModeEnabled &&
          Math.random() < otherSettings.chaosModeChance
          ? newPlayers.length - 1
          : sampleBinomial(newPlayers.length - 2, 1 / 3) + 1
        : userNumImpostors;
      const ids = new Set<string>(),
        players2 = [...newPlayers];
      for (let i = 0; i < numImpostors; i++) {
        ids.add(
          players2.splice(Math.floor(Math.random() * players2.length), 1)[0]!
            .id,
        );
      }
      setChosenImpostors(ids);
      const nonImpostors = newPlayers.filter((player) => !ids.has(player.id));
      setFirstPlayer(
        nonImpostors[Math.floor(Math.random() * nonImpostors.length)],
      );
      setSecretWord(pickRandomWord());
    },
    [],
  );

  const handleStart = useCallback(
    (
      newPlayers: Player[],
      newNumImpostors: number,
      isRandom: boolean,
      otherSettings: OtherSettings,
    ) => {
      localStorage.setItem("impostor_players", JSON.stringify(newPlayers));
      localStorage.setItem(
        "impostor_numImpostors",
        JSON.stringify(newNumImpostors),
      );
      localStorage.setItem(
        "impostor_randomImpostors",
        JSON.stringify(isRandom),
      );
      localStorage.setItem(
        "impostor_otherSettings",
        JSON.stringify(otherSettings),
      );
      setPlayers(newPlayers);
      setNumImpostors(newNumImpostors);
      setRandomImpostors(isRandom);
      setOtherSettings(otherSettings);
      gameSetup(newPlayers, newNumImpostors, isRandom, otherSettings);
      setScreen("play");
    },
    [gameSetup],
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
    gameSetup(players, numImpostors, randomImpostors, otherSettings);
    setScreen("play");
  }, [players, numImpostors, randomImpostors, otherSettings, gameSetup]);

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
          initialOtherSettings={otherSettings}
          onStart={handleStart}
        />
      )}
      {screen === "play" && firstPlayer && (
        <PlayScreen
          players={players}
          impostorsShowTeammates={
            otherSettings.impostorsShowTeammates == "always"
              ? true
              : otherSettings.impostorsShowTeammates == "only-static"
                ? !randomImpostors
                : false
          }
          chosenImpostors={chosenImpostors}
          secretWord={secretWord}
          firstPlayer={firstPlayer}
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
