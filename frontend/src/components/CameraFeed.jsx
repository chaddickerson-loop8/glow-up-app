import { useCamera } from "../hooks/useCamera";

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
};

/**
 * Camera feed component that displays a live webcam stream with an overlay
 * canvas for rendering effects. Provides start/stop controls and handles
 * loading and error states with user-friendly messages.
 */
export default function CameraFeed() {
  const { videoRef, canvasRef, isLoading, error, stream, startCamera, stopCamera } =
    useCamera();

  const isActive = stream !== null;

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
            onClick={stopCamera}
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
