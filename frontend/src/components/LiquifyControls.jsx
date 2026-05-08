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
 * Control panel for the liquify/deformation tool. Renders a toggle and
 * sliders for lip fullness intensity and effect radius.
 *
 * @param {object} props
 * @param {object} props.liquifySettings - Current liquify settings object.
 * @param {(settings: object) => void} props.onSettingsChange
 */
export default function LiquifyControls({ liquifySettings, onSettingsChange }) {
  const update = useCallback(
    (key, value) => {
      onSettingsChange({
        ...liquifySettings,
        lips: { ...liquifySettings.lips, [key]: value },
      });
    },
    [liquifySettings, onSettingsChange]
  );

  const toggle = useCallback(() => {
    update("enabled", !liquifySettings.lips.enabled);
  }, [liquifySettings.lips.enabled, update]);

  return (
    <div>
      <h3 className="control-panel-title">Liquify</h3>

      <div className="control-section">
        <div className="control-header">
          <p className="control-header__title">Lip Fullness</p>
          <button
            className={`toggle-btn${liquifySettings.lips.enabled ? " active" : ""}`}
            onClick={toggle}
          >
            {liquifySettings.lips.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <SliderRow
          label="Intensity"
          value={liquifySettings.lips.intensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update("intensity", v)}
        />
        <SliderRow
          label="Radius"
          value={liquifySettings.lips.radius}
          min={0.2}
          max={1}
          step={0.05}
          onChange={(v) => update("radius", v)}
        />
      </div>
    </div>
  );
}
