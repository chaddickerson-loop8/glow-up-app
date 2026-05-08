import { useState, useEffect, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceDetection } from "../hooks/useFaceDetection";
import SkinOverlay from "./SkinOverlay";
import MakeupOverlay from "./MakeupOverlay";
import LandmarkOverlay from "./LandmarkOverlay";
import LiquifyOverlay from "./LiquifyOverlay";
import HairOverlay from "./HairOverlay";
import MakeupControls from "./MakeupControls";
import SkinControls from "./SkinControls";
import LiquifyControls from "./LiquifyControls";
import HairControls from "./HairControls";

const DEFAULT_SKIN = {
  smoothing: { enabled: false, intensity: 0.5 },
  brightness: { enabled: false, level: 0 },
  warmth: { enabled: false, level: 0 },
  glow: { enabled: false, intensity: 0.3 },
};

const DEFAULT_LIQUIFY = {
  lips: { enabled: false, intensity: 0.5, radius: 0.5 },
};

const DEFAULT_HAIR = {
  color: { enabled: false, color: "#FF4500", opacity: 0.4, blendMode: "hue" },
  texture: { enabled: false, pattern: "smooth", intensity: 0.5 },
};

const DEFAULT_MAKEUP = {
  eyeshadow: { enabled: false, color: "#8B5CF6", opacity: 0.3 },
  eyeliner: { enabled: false, color: "#000000", thickness: 2, wingLength: 10, wingAngle: 15 },
  lashes: { enabled: false, color: "#000000", length: 8, density: 12, curl: 0.3 },
  eyebrows: { enabled: false, color: "#4A3728", opacity: 0.5, thickness: 1.0 },
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
  if (!isModelLoaded) return "Loading model…";
  if (!isDetecting) return "Model ready";
  return "Detecting…";
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
  const [hairSettings, setHairSettings] = useState(DEFAULT_HAIR);
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
    <>
      <div className="camera-container">
        <div className="camera-wrapper">
          <video
            ref={videoRef}
            style={{ display: isActive ? "block" : "none" }}
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            style={{ display: isActive ? "block" : "none" }}
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
          <HairOverlay
            landmarks={landmarks}
            canvasRef={canvasRef}
            hairSettings={hairSettings}
          />
          <LandmarkOverlay
            landmarks={landmarks}
            canvasRef={canvasRef}
            visible={showLandmarks}
          />

          {isActive && isDetecting && (
            <div className="camera-badge camera-badge--fps">{fps} FPS</div>
          )}

          {isActive && modelStatus && (
            <div className="camera-badge camera-badge--status">{modelStatus}</div>
          )}

          {isActive && (
            <button
              className="btn-landmark"
              onClick={() => setShowLandmarks((v) => !v)}
            >
              {showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
            </button>
          )}

          {isLoading && (
            <div className="camera-overlay">Initializing camera&hellip;</div>
          )}
        </div>

        {!isActive && !isLoading && !error && (
          <div className="camera-idle">
            <span>Press &ldquo;Start Camera&rdquo; to begin</span>
          </div>
        )}

        {error && (
          <div className="camera-error">
            <div className="camera-error__box">
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="camera-actions">
          {!isActive ? (
            <button
              className="btn-camera btn-camera--start"
              onClick={startCamera}
              disabled={isLoading}
            >
              {isLoading ? "Starting…" : "Start Camera"}
            </button>
          ) : (
            <button
              className="btn-camera btn-camera--stop"
              onClick={handleStop}
            >
              Stop Camera
            </button>
          )}
        </div>
      </div>

      <aside className="sidebar">
        <MakeupControls
          makeupSettings={makeupSettings}
          onSettingsChange={setMakeupSettings}
        />
        <hr className="divider" />
        <SkinControls
          skinSettings={skinSettings}
          onSettingsChange={setSkinSettings}
        />
        <hr className="divider" />
        <LiquifyControls
          liquifySettings={liquifySettings}
          onSettingsChange={setLiquifySettings}
        />
        <hr className="divider" />
        <HairControls
          hairSettings={hairSettings}
          onSettingsChange={setHairSettings}
        />
      </aside>
    </>
  );
}
