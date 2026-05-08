import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_CONSTRAINTS = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

/**
 * Custom hook that manages webcam access, providing refs for a video element
 * and an overlay canvas, along with loading/error state and start/stop controls.
 *
 * @param {object} [options] - Video constraint overrides.
 * @param {number} [options.width=1280] - Requested video width.
 * @param {number} [options.height=720] - Requested video height.
 * @param {string} [options.facingMode='user'] - Camera facing mode.
 * @returns {{
 *   videoRef: React.RefObject<HTMLVideoElement>,
 *   canvasRef: React.RefObject<HTMLCanvasElement>,
 *   isLoading: boolean,
 *   error: string|null,
 *   stream: MediaStream|null,
 *   startCamera: () => Promise<void>,
 *   stopCamera: () => void
 * }}
 */
export function useCamera(options = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  /**
   * Stops all tracks on the active media stream and detaches it from the
   * video element. Safe to call when no stream is active.
   */
  const stopCamera = useCallback(() => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      setError(`Failed to stop camera: ${err.message}`);
    }
  }, []);

  /**
   * Requests camera permission, acquires a media stream, and attaches it to
   * the video element. Sets loading and error state accordingly.
   *
   * @throws {Error} If the browser does not support getUserMedia, the user
   *   denies permission, no camera is found, or the camera is in use.
   */
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser does not support camera access. Please use a modern browser such as Chrome, Firefox, or Safari."
        );
      }

      stopCamera();

      const constraints = {
        video: { ...DEFAULT_CONSTRAINTS, ...options },
        audio: false,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const message = mapCameraError(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [options, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { videoRef, canvasRef, isLoading, error, stream, startCamera, stopCamera };
}

/**
 * Maps common getUserMedia errors to user-friendly messages.
 *
 * @param {Error} err - The error thrown by getUserMedia.
 * @returns {string} A descriptive error message.
 */
function mapCameraError(err) {
  if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
    return "Camera permission was denied. Please allow camera access in your browser settings and reload the page.";
  }
  if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
    return "No camera was found. Please connect a camera and try again.";
  }
  if (err.name === "NotReadableError" || err.name === "TrackStartError") {
    return "Your camera is in use by another application. Please close other apps using the camera and try again.";
  }
  if (err.name === "OverconstrainedError") {
    return "Your camera does not support the requested resolution. Try a lower resolution.";
  }
  return err.message || "An unknown camera error occurred.";
}
