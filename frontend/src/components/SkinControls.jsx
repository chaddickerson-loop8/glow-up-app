import { useCallback } from "react";

function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <div className="slider-row">
      <span className="control-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="slider-value">{value}</span>
    </div>
  );
}

/**
 * Control panel for skin retouching settings. Renders toggle buttons and
 * sliders for smoothing, brightness, warmth, and glow effects.
 *
 * @param {object} props
 * @param {object} props.skinSettings - Current skin settings object.
 * @param {(settings: object) => void} props.onSettingsChange
 */
export default function SkinControls({ skinSettings, onSettingsChange }) {
  const update = useCallback(
    (section, key, value) => {
      onSettingsChange({
        ...skinSettings,
        [section]: { ...skinSettings[section], [key]: value },
      });
    },
    [skinSettings, onSettingsChange]
  );

  const toggle = useCallback(
    (section) => {
      update(section, "enabled", !skinSettings[section].enabled);
    },
    [skinSettings, update]
  );

  return (
    <div>
      <h3 className="control-panel-title">Skin</h3>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Smoothing</p>
          <button
            className={`toggle-btn${skinSettings.smoothing.enabled ? " active" : ""}`}
            onClick={() => toggle("smoothing")}
          >
            {skinSettings.smoothing.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <SliderRow
          label="Intensity"
          value={skinSettings.smoothing.intensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("smoothing", "intensity", v)}
        />
      </div>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Brightness</p>
          <button
            className={`toggle-btn${skinSettings.brightness.enabled ? " active" : ""}`}
            onClick={() => toggle("brightness")}
          >
            {skinSettings.brightness.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <SliderRow
          label="Level"
          value={skinSettings.brightness.level}
          min={-1}
          max={1}
          step={0.05}
          onChange={(v) => update("brightness", "level", v)}
        />
      </div>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Warmth</p>
          <button
            className={`toggle-btn${skinSettings.warmth.enabled ? " active" : ""}`}
            onClick={() => toggle("warmth")}
          >
            {skinSettings.warmth.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <SliderRow
          label="Level"
          value={skinSettings.warmth.level}
          min={-1}
          max={1}
          step={0.05}
          onChange={(v) => update("warmth", "level", v)}
        />
      </div>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Glow</p>
          <button
            className={`toggle-btn${skinSettings.glow.enabled ? " active" : ""}`}
            onClick={() => toggle("glow")}
          >
            {skinSettings.glow.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <SliderRow
          label="Intensity"
          value={skinSettings.glow.intensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("glow", "intensity", v)}
        />
      </div>
    </div>
  );
}
