import { useState, useEffect, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceDetection } from "../hooks/useFaceDetection";
import SkinOverlay from "./SkinOverlay";
import MakeupOverlay from "./MakeupOverlay";
import LandmarkOverlay from "./LandmarkOverlay";
import LiquifyOverlay from "./LiquifyOverlay";
import MakeupControls from "./MakeupControls";
import SkinControls from "./SkinControls";
import LiquifyControls from "./LiquifyControls";

const DEFAULT_SKIN = {
  smoothing: { enabled: false, intensity: 0.5 },
  brightness: { enabled: false, level: 0 },
  warmth: { enabled: false, level: 0 },
  glow: { enabled: false, intensity: 0.3 },
};

const DEFAULT_LIQUIFY = {
  lips: { enabled: false, intensity: 0.5, radius: 0.5 },
};

const DEFAULT_MAKEUP = {
  eyeshadow: { enabled: false, color: "#8B5CF6", opacity: 0.3 },
  eyeliner: { enabled: false, color: "#000000", thickness: 2, wingLength: 10, wingAngle: 15 },
  lashes: { enabled: false, color: "#000000", length: 8, density: 12, curl: 0.3 },
  eyebrows: { enabled: false, color: "#4A3728", opacity: 0.5, thickness: 1.0 },
};

const styles = {
  layout: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  feedArea: {
    flex: 1,
    minWidth: 0,
  },
  container: {
    position: "relative",
    display: "inline-block",
    background: "#1a1a1a",
    borderRadius: "8px",
    overflow: "hidden",
  },
  video: {
    display: "block",
    maxWidth: "100%",
    borderRadius: "8px",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "1.1rem",
    textAlign: "center",
    padding: "1rem",
  },
  button: {
    marginTop: "0.75rem",
    padding: "0.5rem 1.5rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#fff",
    background: "#646cff",
  },
  errorBox: {
    background: "rgba(200, 50, 50, 0.15)",
    border: "1px solid rgba(200, 50, 50, 0.4)",
    borderRadius: "8px",
    padding: "1.5rem",
    color: "#ff6b6b",
    textAlign: "center",
    maxWidth: "480px",
  },
  fps: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "rgba(0, 0, 0, 0.6)",
    color: "#0f0",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontFamily: "monospace",
    pointerEvents: "none",
  },
  status: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontFamily: "monospace",
    pointerEvents: "none",
  },
  landmarkToggle: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "0.7rem",
    cursor: "pointer",
    zIndex: 1,
  },
};

/**
 * Returns a human-readable model status string.
 *
 * @param {boolean} isActive
 * @param {boolean} isModelLoaded
 * @param {boolean} isDetecting
 * @returns {string}
 */
function getModelStatus(isActive, isModelLoaded, isDetecting) {
  if (!isActive) return "";
  if (!isModelLoaded) return "Loading model...";
  if (!isDetecting) return "Model ready";
  return "Detecting...";
}

/**
 * Camera feed component with real-time face landmark detection, makeup
 * overlay rendering, and a controls sidebar for adjusting makeup settings.
 */
export default function CameraFeed() {
  const { videoRef, canvasRef, isLoading, error: cameraError, stream, startCamera, stopCamera } =
    useCamera();

  const {
    landmarks,
    isModelLoaded,
    isDetecting,
    error: detectionError,
    fps,
    initModel,
    startDetection,
    stopDetection,
  } = useFaceDetection();

  const [makeupSettings, setMakeupSettings] = useState(DEFAULT_MAKEUP);
  const [skinSettings, setSkinSettings] = useState(DEFAULT_SKIN);
  const [liquifySettings, setLiquifySettings] = useState(DEFAULT_LIQUIFY);
  const [showLandmarks, setShowLandmarks] = useState(false);

  const isActive = stream !== null;
  const error = cameraError || detectionError;
  const modelStatus = getModelStatus(isActive, isModelLoaded, isDetecting);

  useEffect(() => {
    if (isActive && !isModelLoaded) {
      initModel();
    }
  }, [isActive, isModelLoaded, initModel]);

  useEffect(() => {
    if (isActive && isModelLoaded && !isDetecting && videoRef.current) {
      startDetection(videoRef.current);
    }
  }, [isActive, isModelLoaded, isDetecting, startDetection, videoRef]);

  const handleStop = useCallback(() => {
    stopDetection();
    stopCamera();
  }, [stopDetection, stopCamera]);

  return (
    <div style={styles.layout}>
      <div style={styles.feedArea}>
        <div style={styles.container}>
          <video
            ref={videoRef}
            style={{
              ...styles.video,
              display: isActive ? "block" : "none",
            }}
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            style={{
              ...styles.canvas,
              display: isActive ? "block" : "none",
            }}
          />

          <SkinOverlay
            landmarks={landmarks}
            canvasRef={canvasRef}
            videoRef={videoRef}
            skinSettings={skinSettings}
          />
          <MakeupOverlay
            landmarks={landmarks}
            canvasRef={canvasRef}
            makeupSettings={makeupSettings}
          />
          <LiquifyOverlay
            landmarks={landmarks}
            canvasRef={canvasRef}
            liquifySettings={liquifySettings}
          />
          <LandmarkOverlay
            landmarks={landmarks}
            canvasRef={canvasRef}
            visible={showLandmarks}
          />

          {isActive && isDetecting && (
            <div style={styles.fps}>{fps} FPS</div>
          )}

          {isActive && modelStatus && (
            <div style={styles.status}>{modelStatus}</div>
          )}

          {isActive && (
            <button
              style={styles.landmarkToggle}
              onClick={() => setShowLandmarks((v) => !v)}
            >
              {showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
            </button>
          )}

          {isLoading && (
            <div style={styles.overlay}>Initializing camera...</div>
          )}

          {!isActive && !isLoading && !error && (
            <div style={{ ...styles.overlay, position: "relative", minHeight: "360px" }}>
              <span>Press &ldquo;Start Camera&rdquo; to begin</span>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <div style={styles.errorBox}>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
          {!isActive ? (
            <button
              style={styles.button}
              onClick={startCamera}
              disabled={isLoading}
            >
              {isLoading ? "Starting..." : "Start Camera"}
            </button>
          ) : (
            <button
              style={{ ...styles.button, background: "#e53e3e" }}
              onClick={handleStop}
            >
              Stop Camera
            </button>
          )}
        </div>
      </div>

      <div style={{
        width: "280px",
        flexShrink: 0,
        background: "#1e1e2e",
        borderLeft: "1px solid #333",
        padding: "1rem",
        overflowY: "auto",
        color: "#e0e0e0",
        fontSize: "0.85rem",
        fontFamily: "system-ui, sans-serif",
      }}>
        <MakeupControls
          makeupSettings={makeupSettings}
          onSettingsChange={setMakeupSettings}
        />
        <div style={{ borderTop: "2px solid #444", marginTop: "1rem", paddingTop: "1rem" }}>
          <SkinControls
            skinSettings={skinSettings}
            onSettingsChange={setSkinSettings}
          />
        </div>
        <div style={{ borderTop: "2px solid #444", marginTop: "1rem", paddingTop: "1rem" }}>
          <LiquifyControls
            liquifySettings={liquifySettings}
            onSettingsChange={setLiquifySettings}
          />
        </div>
      </div>
    </div>
  );
}
