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
 * Control panel for the liquify/deformation tool. Renders a toggle and
 * sliders for lip fullness intensity and effect radius. Styled to match
 * MakeupControls and SkinControls.
 *
 * @param {object} props
 * @param {object} props.liquifySettings - Current liquify settings object.
 * @param {object} props.liquifySettings.lips
 * @param {boolean} props.liquifySettings.lips.enabled
 * @param {number} props.liquifySettings.lips.intensity
 * @param {number} props.liquifySettings.lips.radius
 * @param {(settings: object) => void} props.onSettingsChange
 *   Callback invoked with the full updated liquifySettings object.
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
      <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: 700 }}>
        Liquify Controls
      </h3>

      <div style={{ ...sectionStyle, borderBottom: "none", marginBottom: 0 }}>
        <div style={sectionHeader}>
          <p style={sectionTitle}>Lip Fullness</p>
          <button
            style={{
              ...toggleBtn,
              background: liquifySettings.lips.enabled ? "#646cff" : "#333",
            }}
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
