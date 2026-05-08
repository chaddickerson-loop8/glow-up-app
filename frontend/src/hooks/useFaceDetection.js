import { useState, useRef, useCallback, useEffect } from "react";
import { initFaceDetector, detectFaceLandmarks } from "../utils/faceDetection";

/**
 * Custom hook that manages the lifecycle of a MediaPipe FaceMesh detector,
 * runs a requestAnimationFrame detection loop on a video element, and
 * exposes the resulting landmarks, loading/detecting state, FPS, and controls.
 *
 * @returns {{
 *   landmarks: import("@tensorflow-models/face-landmarks-detection").Face[],
 *   isModelLoaded: boolean,
 *   isDetecting: boolean,
 *   error: string|null,
 *   fps: number,
 *   initModel: () => Promise<void>,
 *   startDetection: (video: HTMLVideoElement) => void,
 *   stopDetection: () => void
 * }}
 */
export function useFaceDetection() {
  const [landmarks, setLandmarks] = useState([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);

  const detectorRef = useRef(null);
  const rafIdRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(0);

  /**
   * Downloads and initializes the MediaPipe FaceMesh model. Stores the
   * detector instance in a ref for use by the detection loop.
   */
  const initModel = useCallback(async () => {
    try {
      setError(null);
      const detector = await initFaceDetector();
      detectorRef.current = detector;
      setIsModelLoaded(true);
    } catch (err) {
      setError(`Model initialization failed: ${err.message}`);
    }
  }, []);

  /**
   * Cancels the running requestAnimationFrame detection loop, if any.
   */
  const stopDetection = useCallback(() => {
    try {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setIsDetecting(false);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = 0;
      setFps(0);
    } catch (err) {
      setError(`Failed to stop detection: ${err.message}`);
    }
  }, []);

  /**
   * Begins a requestAnimationFrame loop that runs face landmark detection
   * on each frame of the provided video element. Updates landmarks state
   * and calculates FPS once per second.
   *
   * @param {HTMLVideoElement} video - A playing video element to detect faces in.
   */
  const startDetection = useCallback(
    (video) => {
      try {
        if (!detectorRef.current) {
          setError("Cannot start detection: model not loaded.");
          return;
        }
        if (!video) {
          setError("Cannot start detection: no video element provided.");
          return;
        }

        stopDetection();
        setIsDetecting(true);
        lastFpsTimeRef.current = performance.now();
        frameCountRef.current = 0;

        const loop = async () => {
          try {
            if (video.readyState >= 2) {
              const faces = await detectFaceLandmarks(
                detectorRef.current,
                video
              );
              setLandmarks(faces);

              frameCountRef.current += 1;
              const now = performance.now();
              const elapsed = now - lastFpsTimeRef.current;
              if (elapsed >= 1000) {
                setFps(
                  Math.round((frameCountRef.current / elapsed) * 1000)
                );
                frameCountRef.current = 0;
                lastFpsTimeRef.current = now;
              }
            }
          } catch {
            // Single bad frame — keep the loop running
          }

          rafIdRef.current = requestAnimationFrame(loop);
        };

        rafIdRef.current = requestAnimationFrame(loop);
      } catch (err) {
        setError(`Failed to start detection: ${err.message}`);
      }
    },
    [stopDetection]
  );

  useEffect(() => {
    return () => {
      stopDetection();
      if (detectorRef.current) {
        try {
          detectorRef.current.dispose();
        } catch {
          // Best-effort cleanup
        }
        detectorRef.current = null;
      }
    };
  }, [stopDetection]);

  return {
    landmarks,
    isModelLoaded,
    isDetecting,
    error,
    fps,
    initModel,
    startDetection,
    stopDetection,
  };
}
