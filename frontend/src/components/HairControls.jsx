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

const colorInput = {
  width: "32px",
  height: "24px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  padding: 0,
  background: "transparent",
};

const optionBtn = {
  padding: "2px 8px",
  fontSize: "0.7rem",
  border: "1px solid #555",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#fff",
  marginRight: "4px",
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
 * Renders a row of toggle-style option buttons where one is selected.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string[]} props.options
 * @param {string} props.value
 * @param {(v: string) => void} props.onChange
 */
function OptionRow({ label, options, value, onChange }) {
  return (
    <div style={{ ...rowStyle, flexWrap: "wrap" }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
        {options.map((opt) => (
          <button
            key={opt}
            style={{
              ...optionBtn,
              background: value === opt ? "#646cff" : "#333",
            }}
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
 * picker, sliders, and option selectors for hair effects. Styled to match
 * the other control panels.
 *
 * @param {object} props
 * @param {object} props.hairSettings - Current hair settings object.
 * @param {object} props.hairSettings.color
 * @param {boolean} props.hairSettings.color.enabled
 * @param {string} props.hairSettings.color.color
 * @param {number} props.hairSettings.color.opacity
 * @param {string} props.hairSettings.color.blendMode
 * @param {object} props.hairSettings.texture
 * @param {boolean} props.hairSettings.texture.enabled
 * @param {string} props.hairSettings.texture.pattern
 * @param {number} props.hairSettings.texture.intensity
 * @param {(settings: object) => void} props.onSettingsChange
 *   Callback invoked with the full updated hairSettings object.
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
      <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 700 }}>
        Hair Controls
      </h3>

      {/* Hair Color */}
      <div style={sectionStyle}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Hair Color</p>
          <button
            style={{
              ...toggleBtn,
              background: hairSettings.color.enabled ? "#646cff" : "#333",
            }}
            onClick={() => toggle("color")}
          >
            {hairSettings.color.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Color</span>
          <input
            type="color"
            value={hairSettings.color.color}
            style={colorInput}
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

      {/* Hair Texture */}
      <div style={{ ...sectionStyle, borderBottom: "none", marginBottom: 0 }}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Hair Texture</p>
          <button
            style={{
              ...toggleBtn,
              background: hairSettings.texture.enabled ? "#646cff" : "#333",
            }}
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
