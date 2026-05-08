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
 * Control panel component for adjusting makeup effect settings. Renders
 * toggle buttons, color pickers, and sliders for eyeshadow, eyeliner,
 * lashes, and eyebrows. Designed as a vertical sidebar panel.
 *
 * @param {object} props
 * @param {object} props.makeupSettings - Current makeup settings object.
 * @param {object} props.makeupSettings.eyeshadow
 * @param {boolean} props.makeupSettings.eyeshadow.enabled
 * @param {string} props.makeupSettings.eyeshadow.color
 * @param {number} props.makeupSettings.eyeshadow.opacity
 * @param {object} props.makeupSettings.eyeliner
 * @param {boolean} props.makeupSettings.eyeliner.enabled
 * @param {string} props.makeupSettings.eyeliner.color
 * @param {number} props.makeupSettings.eyeliner.thickness
 * @param {number} props.makeupSettings.eyeliner.wingLength
 * @param {number} props.makeupSettings.eyeliner.wingAngle
 * @param {object} props.makeupSettings.lashes
 * @param {boolean} props.makeupSettings.lashes.enabled
 * @param {string} props.makeupSettings.lashes.color
 * @param {number} props.makeupSettings.lashes.length
 * @param {number} props.makeupSettings.lashes.density
 * @param {number} props.makeupSettings.lashes.curl
 * @param {object} props.makeupSettings.eyebrows
 * @param {boolean} props.makeupSettings.eyebrows.enabled
 * @param {string} props.makeupSettings.eyebrows.color
 * @param {number} props.makeupSettings.eyebrows.opacity
 * @param {number} props.makeupSettings.eyebrows.thickness
 * @param {(settings: object) => void} props.onSettingsChange
 *   Callback invoked with the full updated makeupSettings object.
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
      <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 700 }}>
        Makeup Controls
      </h3>

      {/* Eyeshadow */}
      <div style={sectionStyle}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Eyeshadow</p>
          <button
            style={{
              ...toggleBtn,
              background: makeupSettings.eyeshadow.enabled ? "#646cff" : "#333",
            }}
            onClick={() => toggle("eyeshadow")}
          >
            {makeupSettings.eyeshadow.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Color</span>
          <input
            type="color"
            value={makeupSettings.eyeshadow.color}
            style={colorInput}
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

      {/* Eyeliner */}
      <div style={sectionStyle}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Eyeliner</p>
          <button
            style={{
              ...toggleBtn,
              background: makeupSettings.eyeliner.enabled ? "#646cff" : "#333",
            }}
            onClick={() => toggle("eyeliner")}
          >
            {makeupSettings.eyeliner.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Color</span>
          <input
            type="color"
            value={makeupSettings.eyeliner.color}
            style={colorInput}
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

      {/* Lashes */}
      <div style={sectionStyle}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Lashes</p>
          <button
            style={{
              ...toggleBtn,
              background: makeupSettings.lashes.enabled ? "#646cff" : "#333",
            }}
            onClick={() => toggle("lashes")}
          >
            {makeupSettings.lashes.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Color</span>
          <input
            type="color"
            value={makeupSettings.lashes.color}
            style={colorInput}
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

      {/* Eyebrows */}
      <div style={{ ...sectionStyle, borderBottom: "none", marginBottom: 0 }}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Eyebrows</p>
          <button
            style={{
              ...toggleBtn,
              background: makeupSettings.eyebrows.enabled ? "#646cff" : "#333",
            }}
            onClick={() => toggle("eyebrows")}
          >
            {makeupSettings.eyebrows.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Color</span>
          <input
            type="color"
            value={makeupSettings.eyebrows.color}
            style={colorInput}
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
