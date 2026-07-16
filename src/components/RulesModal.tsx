import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function RulesModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2>How to Play</h2>
        <ol className="rules-list">
          <li>Each player is randomly assigned a role: <strong>Impostor</strong> or <strong>Crewmate</strong>.</li>
          <li>A secret word is shown to all crewmates. Impostors do <em>not</em> see it.</li>
          <li>Players take turns saying a word related to the secret word. No word may be repeated, and you cannot say the secret word itself.</li>
          <li>Impostors must bluff and figure out the topic from what others say.</li>
          <li>After 2 rounds, players vote on who they think the impostors are.</li>
          <li>Impostors are revealed, then they get one chance to guess the secret word.</li>
        </ol>
      </div>
    </div>
  );
}
