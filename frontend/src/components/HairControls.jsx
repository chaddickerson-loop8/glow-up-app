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

function OptionRow({ label, options, value, onChange }) {
  return (
    <div className="control-row" style={{ flexWrap: "wrap" }}>
      <span className="control-label">{label}</span>
      <div className="option-group">
        {options.map((opt) => (
          <button
            key={opt}
            className={`option-btn${value === opt ? " active" : ""}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const BLEND_MODES = ["multiply", "screen", "hue", "color"];
const TEXTURE_PATTERNS = ["smooth", "wavy", "curly"];

/**
 * Control panel for hair color and texture settings. Renders toggles, color
 * picker, sliders, and option selectors for hair effects.
 *
 * @param {object} props
 * @param {object} props.hairSettings - Current hair settings object.
 * @param {(settings: object) => void} props.onSettingsChange
 */
export default function HairControls({ hairSettings, onSettingsChange }) {
  const update = useCallback(
    (section, key, value) => {
      onSettingsChange({
        ...hairSettings,
        [section]: { ...hairSettings[section], [key]: value },
      });
    },
    [hairSettings, onSettingsChange]
  );

  const toggle = useCallback(
    (section) => {
      update(section, "enabled", !hairSettings[section].enabled);
    },
    [hairSettings, update]
  );

  return (
    <div>
      <h3 className="control-panel-title">Hair</h3>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Hair Color</p>
          <button
            className={`toggle-btn${hairSettings.color.enabled ? " active" : ""}`}
            onClick={() => toggle("color")}
          >
            {hairSettings.color.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="control-row">
          <span className="control-label">Color</span>
          <input
            type="color"
            value={hairSettings.color.color}
            onChange={(e) => update("color", "color", e.target.value)}
          />
        </div>
        <SliderRow
          label="Opacity"
          value={hairSettings.color.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("color", "opacity", v)}
        />
        <OptionRow
          label="Blend"
          options={BLEND_MODES}
          value={hairSettings.color.blendMode}
          onChange={(v) => update("color", "blendMode", v)}
        />
      </div>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Hair Texture</p>
          <button
            className={`toggle-btn${hairSettings.texture.enabled ? " active" : ""}`}
            onClick={() => toggle("texture")}
          >
            {hairSettings.texture.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <OptionRow
          label="Pattern"
          options={TEXTURE_PATTERNS}
          value={hairSettings.texture.pattern}
          onChange={(v) => update("texture", "pattern", v)}
        />
        <SliderRow
          label="Intensity"
          value={hairSettings.texture.intensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("texture", "intensity", v)}
        />
      </div>
    </div>
  );
}
