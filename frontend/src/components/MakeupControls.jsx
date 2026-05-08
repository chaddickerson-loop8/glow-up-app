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
 * Control panel component for adjusting makeup effect settings. Renders
 * toggle buttons, color pickers, and sliders for eyeshadow, eyeliner,
 * lashes, and eyebrows. Designed as a vertical sidebar panel.
 *
 * @param {object} props
 * @param {object} props.makeupSettings - Current makeup settings object.
 * @param {(settings: object) => void} props.onSettingsChange
 */
export default function MakeupControls({ makeupSettings, onSettingsChange }) {
  const update = useCallback(
    (section, key, value) => {
      onSettingsChange({
        ...makeupSettings,
        [section]: { ...makeupSettings[section], [key]: value },
      });
    },
    [makeupSettings, onSettingsChange]
  );

  const toggle = useCallback(
    (section) => {
      update(section, "enabled", !makeupSettings[section].enabled);
    },
    [makeupSettings, update]
  );

  return (
    <div>
      <h3 className="control-panel-title">Makeup</h3>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Eyeshadow</p>
          <button
            className={`toggle-btn${makeupSettings.eyeshadow.enabled ? " active" : ""}`}
            onClick={() => toggle("eyeshadow")}
          >
            {makeupSettings.eyeshadow.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="control-row">
          <span className="control-label">Color</span>
          <input
            type="color"
            value={makeupSettings.eyeshadow.color}
            onChange={(e) => update("eyeshadow", "color", e.target.value)}
          />
        </div>
        <SliderRow
          label="Opacity"
          value={makeupSettings.eyeshadow.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("eyeshadow", "opacity", v)}
        />
      </div>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Eyeliner</p>
          <button
            className={`toggle-btn${makeupSettings.eyeliner.enabled ? " active" : ""}`}
            onClick={() => toggle("eyeliner")}
          >
            {makeupSettings.eyeliner.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="control-row">
          <span className="control-label">Color</span>
          <input
            type="color"
            value={makeupSettings.eyeliner.color}
            onChange={(e) => update("eyeliner", "color", e.target.value)}
          />
        </div>
        <SliderRow
          label="Thickness"
          value={makeupSettings.eyeliner.thickness}
          min={1}
          max={5}
          step={0.5}
          onChange={(v) => update("eyeliner", "thickness", v)}
        />
        <SliderRow
          label="Wing"
          value={makeupSettings.eyeliner.wingLength}
          min={0}
          max={20}
          step={1}
          onChange={(v) => update("eyeliner", "wingLength", v)}
        />
        <SliderRow
          label="Angle"
          value={makeupSettings.eyeliner.wingAngle}
          min={0}
          max={45}
          step={1}
          onChange={(v) => update("eyeliner", "wingAngle", v)}
        />
      </div>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Lashes</p>
          <button
            className={`toggle-btn${makeupSettings.lashes.enabled ? " active" : ""}`}
            onClick={() => toggle("lashes")}
          >
            {makeupSettings.lashes.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="control-row">
          <span className="control-label">Color</span>
          <input
            type="color"
            value={makeupSettings.lashes.color}
            onChange={(e) => update("lashes", "color", e.target.value)}
          />
        </div>
        <SliderRow
          label="Length"
          value={makeupSettings.lashes.length}
          min={3}
          max={15}
          step={1}
          onChange={(v) => update("lashes", "length", v)}
        />
        <SliderRow
          label="Density"
          value={makeupSettings.lashes.density}
          min={5}
          max={20}
          step={1}
          onChange={(v) => update("lashes", "density", v)}
        />
        <SliderRow
          label="Curl"
          value={makeupSettings.lashes.curl}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("lashes", "curl", v)}
        />
      </div>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Eyebrows</p>
          <button
            className={`toggle-btn${makeupSettings.eyebrows.enabled ? " active" : ""}`}
            onClick={() => toggle("eyebrows")}
          >
            {makeupSettings.eyebrows.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="control-row">
          <span className="control-label">Color</span>
          <input
            type="color"
            value={makeupSettings.eyebrows.color}
            onChange={(e) => update("eyebrows", "color", e.target.value)}
          />
        </div>
        <SliderRow
          label="Opacity"
          value={makeupSettings.eyebrows.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("eyebrows", "opacity", v)}
        />
        <SliderRow
          label="Thickness"
          value={makeupSettings.eyebrows.thickness}
          min={0.5}
          max={2}
          step={0.1}
          onChange={(v) => update("eyebrows", "thickness", v)}
        />
      </div>
    </div>
  );
}
