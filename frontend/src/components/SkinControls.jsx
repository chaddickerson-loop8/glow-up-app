import { useCallback } from "react";

const sectionStyle = {
  marginBottom: "1.25rem",
  paddingBottom: "1rem",
  borderBottom: "1px solid #333",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.5rem",
};

const sectionTitle = {
  fontSize: "0.95rem",
  fontWeight: 600,
  margin: 0,
};

const toggleBtn = {
  padding: "2px 10px",
  fontSize: "0.75rem",
  border: "1px solid #555",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#fff",
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "0.4rem",
};

const labelStyle = {
  flex: "0 0 auto",
  marginRight: "0.5rem",
};

const sliderStyle = {
  flex: 1,
  margin: "0 0.5rem",
  accentColor: "#646cff",
};

const valueStyle = {
  flex: "0 0 36px",
  textAlign: "right",
  fontFamily: "monospace",
  fontSize: "0.8rem",
};

/**
 * Renders a labeled slider row with current value display.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {number} props.value
 * @param {number} props.min
 * @param {number} props.max
 * @param {number} props.step
 * @param {(v: number) => void} props.onChange
 */
function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={sliderStyle}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span style={valueStyle}>{value}</span>
    </div>
  );
}

/**
 * Control panel for skin retouching settings. Renders toggle buttons and
 * sliders for smoothing, brightness, warmth, and glow effects. Styled to
 * match MakeupControls and sit below it in the sidebar.
 *
 * @param {object} props
 * @param {object} props.skinSettings - Current skin settings object.
 * @param {object} props.skinSettings.smoothing
 * @param {boolean} props.skinSettings.smoothing.enabled
 * @param {number} props.skinSettings.smoothing.intensity
 * @param {object} props.skinSettings.brightness
 * @param {boolean} props.skinSettings.brightness.enabled
 * @param {number} props.skinSettings.brightness.level
 * @param {object} props.skinSettings.warmth
 * @param {boolean} props.skinSettings.warmth.enabled
 * @param {number} props.skinSettings.warmth.level
 * @param {object} props.skinSettings.glow
 * @param {boolean} props.skinSettings.glow.enabled
 * @param {number} props.skinSettings.glow.intensity
 * @param {(settings: object) => void} props.onSettingsChange
 *   Callback invoked with the full updated skinSettings object.
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
      <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 700 }}>
        Skin Controls
      </h3>

      {/* Smoothing */}
      <div style={sectionStyle}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Smoothing</p>
          <button
            style={{
              ...toggleBtn,
              background: skinSettings.smoothing.enabled ? "#646cff" : "#333",
            }}
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

      {/* Brightness */}
      <div style={sectionStyle}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Brightness</p>
          <button
            style={{
              ...toggleBtn,
              background: skinSettings.brightness.enabled ? "#646cff" : "#333",
            }}
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

      {/* Warmth */}
      <div style={sectionStyle}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Warmth</p>
          <button
            style={{
              ...toggleBtn,
              background: skinSettings.warmth.enabled ? "#646cff" : "#333",
            }}
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

      {/* Glow */}
      <div style={{ ...sectionStyle, borderBottom: "none", marginBottom: 0 }}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Glow</p>
          <button
            style={{
              ...toggleBtn,
              background: skinSettings.glow.enabled ? "#646cff" : "#333",
            }}
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
