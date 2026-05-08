import { useEffect, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceDetection } from "../hooks/useFaceDetection";
import LandmarkOverlay from "./LandmarkOverlay";

const styles = {
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
};

/**
 * Returns a human-readable model status string based on the current state
 * of the camera, model loading, and detection loop.
 *
 * @param {boolean} isActive - Whether the camera stream is running.
 * @param {boolean} isModelLoaded - Whether the face detection model is ready.
 * @param {boolean} isDetecting - Whether the detection loop is running.
 * @returns {string}
 */
function getModelStatus(isActive, isModelLoaded, isDetecting) {
  if (!isActive) return "";
  if (!isModelLoaded) return "Loading model...";
  if (!isDetecting) return "Model ready";
  return "Detecting...";
}

/**
 * Camera feed component that displays a live webcam stream, runs real-time
 * face landmark detection via MediaPipe FaceMesh, and renders an overlay of
 * color-coded landmark dots. Shows FPS and model status indicators.
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
    <div>
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

        <LandmarkOverlay landmarks={landmarks} canvasRef={canvasRef} />

        {isActive && isDetecting && (
          <div style={styles.fps}>{fps} FPS</div>
        )}

        {isActive && modelStatus && (
          <div style={styles.status}>{modelStatus}</div>
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
  );
}
