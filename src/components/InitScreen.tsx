import { useRef, useState } from "react";
import { GripVertical, X, Plus, Minus, Eye, EyeOff } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Player } from "../types";
import { makeId } from "../types";

interface Props {
  initialPlayers: Player[];
  initialNumImpostors: number;
  initialRandomImpostors: boolean;
  onStart: (players: Player[], numImpostors: number, random: boolean) => void;
}

function SortablePlayer({
  player,
  index,
  inputRef,
  onChange,
  onKeyDown,
  onRemove,
  canRemove,
}: {
  player: Player;
  index: number;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (name: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`player-row ${isDragging ? "dragging" : ""}`}
    >
      <span className="drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </span>
      <input
        ref={inputRef}
        id={`player-name-${player.id}`}
        name={`player-name-${index}`}
        type="text"
        value={player.name}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={`Player ${index + 1}`}
      />
      <button
        className="icon-btn remove-btn"
        onClick={onRemove}
        disabled={canRemove}
        aria-label="Remove player"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function InitScreen({
  initialPlayers,
  initialNumImpostors,
  initialRandomImpostors,
  onStart,
}: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [players, setPlayers] = useState(initialPlayers);
  const [numImpostors, setNumImpostors] = useState(initialNumImpostors);
  const [randomImpostors, setRandomImpostors] = useState(
    initialRandomImpostors,
  );

  const namedPlayers = players.filter((p) => p.name.trim() !== "");

  function addPlayer() {
    setPlayers([...players, { id: makeId(), name: "" }]);
    setTimeout(() => {
      const last = inputRefs.current[players.length];
      last?.focus();
    }, 0);
  }

  function removePlayer(index: number) {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== index));
  }

  function updatePlayer(index: number, value: string) {
    const next = [...players];
    next[index] = { ...next[index]!, name: value };
    setPlayers(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over === null || active.id === over.id) return;
    const oldIndex = players.findIndex((p) => p.id === active.id);
    const newIndex = players.findIndex((p) => p.id === over.id);
    setPlayers(arrayMove(players, oldIndex, newIndex));
  }

  function handleStart() {
    const named = players.filter((p) => p.name.trim() !== "");
    if (named.length < 3) return;
    if (!randomImpostors && (numImpostors < 1 || numImpostors >= named.length))
      return;
    onStart(named, numImpostors, randomImpostors);
  }

  const canStart =
    namedPlayers.length >= 3 &&
    (randomImpostors ||
      (numImpostors >= 1 && numImpostors < namedPlayers.length));

  return (
    <div className="init-screen">
      <h1>Impostor</h1>
      <p className="subtitle">Set up your game</p>

      <div className="section">
        <h2>Players</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={players.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="player-list">
              {players.map((player, i) => (
                <SortablePlayer
                  key={player.id}
                  player={player}
                  index={i}
                  inputRef={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  onChange={(v) => updatePlayer(i, v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (i === players.length - 1) addPlayer();
                      else inputRefs.current[i + 1]?.focus();
                    }
                    if (
                      e.key === "Backspace" &&
                      player.name === "" &&
                      players.length > 2
                    ) {
                      e.preventDefault();
                      removePlayer(i);
                      inputRefs.current[i - 1]?.focus();
                    }
                  }}
                  onRemove={() => removePlayer(i)}
                  canRemove={players.length <= 2}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button className="add-btn" onClick={addPlayer}>
          <Plus size={14} /> Add Player
        </button>
      </div>

      <div className="section">
        <h2>Impostors</h2>
        <div className="impostor-picker-row">
          <div
            className={`impostor-picker ${randomImpostors ? "disabled" : ""}`}
          >
            <button
              className="icon-btn large"
              onClick={() => setNumImpostors(Math.max(1, numImpostors - 1))}
              disabled={randomImpostors || numImpostors <= 1}
            >
              <Minus size={20} />
            </button>
            <input
              id="num-impostors"
              name="numImpostors"
              className={`impostor-input ${randomImpostors ? "blurred" : ""}`}
              type="text"
              inputMode="numeric"
              min={1}
              max={Math.max(1, namedPlayers.length - 1)}
              value={String(numImpostors)}
              readOnly={randomImpostors}
              disabled={randomImpostors}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1)
                  setNumImpostors(
                    Math.min(v, Math.max(1, namedPlayers.length - 1)),
                  );
              }}
            />
            <button
              className="icon-btn large"
              onClick={() => setNumImpostors(numImpostors + 1)}
              disabled={
                randomImpostors || numImpostors >= namedPlayers.length - 1
              }
            >
              <Plus size={20} />
            </button>
          </div>
          <button
            className="random-btn"
            onClick={() => setRandomImpostors(!randomImpostors)}
            aria-checked={randomImpostors}
            title={`Randomize impostor count: ${randomImpostors ? "yes" : "no"}`}
            aria-label={`Randomize impostor count: ${randomImpostors ? "yes" : "no"}`}
          >
            {randomImpostors ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="hint">
          {namedPlayers.length} players,{" "}
          {randomImpostors
            ? "random"
            : `${numImpostors} impostor${numImpostors !== 1 ? "s" : ""}`}
        </p>
      </div>

      <button className="start-btn" onClick={handleStart} disabled={!canStart}>
        Start Game
      </button>
    </div>
  );
}
