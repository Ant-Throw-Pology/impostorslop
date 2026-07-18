import { X } from "lucide-react";
import { useId } from "react";

export interface OtherSettings {
  /**
   * Chaos mode: Everyone but one person is the impostor
   *
   * This setting sets whether it can be intentionally applied with the random
   * impostor count setting. Note that if this is false, it's still possible to
   * get that high of a count, just extremely unlikely depending on how many
   * players you have.
   */
  chaosModeEnabled: boolean;
  /**
   * This sets the chance of intentional chaos mode.
   */
  chaosModeChance: number;
  /**
   * Sets whether the Impostors can see their teammates.
   *
   * - `always`: Always show teammates, regardless of randomization
   * - `only-static`: Only show teammates when the impostor count is not randomized (default)
   * - `never`: Never show teammates
   */
  impostorsShowTeammates: "always" | "never" | "only-static";
}

export const otherSettingsDefaults: OtherSettings = {
  chaosModeEnabled: true,
  chaosModeChance: 0.1,
  impostorsShowTeammates: "only-static",
};

export function OtherSettingsModal({
  otherSettings,
  setOtherSettings,
  onClose,
}: {
  otherSettings: OtherSettings;
  setOtherSettings: React.Dispatch<React.SetStateAction<OtherSettings>>;
  onClose: () => void;
}) {
  const id = useId();

  return (
    <div className="modal-overlay other-settings-modal" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2>Other Settings</h2>
        <label htmlFor={`${id}-chaosModeEnabled`}>
          <h3>
            Chaos Mode:{" "}
            <input
              type="checkbox"
              id={`${id}-chaosModeEnabled`}
              checked={otherSettings.chaosModeEnabled}
              onChange={(event) => {
                setOtherSettings((prev) => ({
                  ...prev,
                  chaosModeEnabled: event.target.checked,
                }));
              }}
            />
          </h3>
          <p>
            Enable an extra chance of "everyone but one person is the impostor"
            when the impostor count is randomized.
          </p>
        </label>
        <label htmlFor={`${id}-chaosModeChance`}>
          <h4>Chaos Mode chance:</h4>
          <input
            type="number"
            id={`${id}-chaosModeChance`}
            value={otherSettings.chaosModeChance}
            min={0}
            max={1}
            step="0.01"
            onChange={(event) => {
              setOtherSettings((prev) => ({
                ...prev,
                chaosModeChance: isFinite(event.target.valueAsNumber)
                  ? event.target.valueAsNumber > 1
                    ? 1
                    : event.target.valueAsNumber < 0
                      ? 0
                      : event.target.valueAsNumber
                  : otherSettingsDefaults.chaosModeChance,
              }));
            }}
          />{" "}
          <input
            type="range"
            id={`${id}-chaosModeChance-range`}
            value={otherSettings.chaosModeChance}
            min={0}
            max={1}
            step="0.01"
            onChange={(event) => {
              setOtherSettings((prev) => ({
                ...prev,
                chaosModeChance:
                  isFinite(event.target.valueAsNumber) &&
                  event.target.valueAsNumber >= 0 &&
                  event.target.valueAsNumber <= 1
                    ? event.target.valueAsNumber
                    : otherSettingsDefaults.chaosModeChance,
              }));
            }}
          />
        </label>
        <label htmlFor={`${id}-impostorsShowTeammates`}>
          <h3>Impostors know their teammates:</h3>
          <select
            id={`${id}-impostorsShowTeammates`}
            value={otherSettings.impostorsShowTeammates}
            onChange={(event) => {
              setOtherSettings((prev) => ({
                ...prev,
                impostorsShowTeammates:
                  event.target.value == "always" ||
                  event.target.value == "only-static" ||
                  event.target.value == "never"
                    ? event.target.value
                    : "only-static",
              }));
            }}
          >
            <option value="always">Always</option>
            <option value="only-static">Only when count not randomized</option>
            <option value="never">Never</option>
          </select>
        </label>
      </div>
    </div>
  );
}
