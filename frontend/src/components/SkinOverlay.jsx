import { useEffect } from "react";
import {
  applySkinSmoothing,
  applySkinBrightness,
  applySkinWarmth,
  applySkinGlow,
} from "../utils/skinRenderer";

/**
 * Renderless component that applies skin retouching effects (smoothing,
 * brightness, warmth, glow) onto the shared overlay canvas. Effects are
 * applied in order: smoothing, brightness, warmth, glow. Only enabled
 * effects are drawn. Redraws whenever landmarks or settings change.
 *
 * @param {object} props
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} props.landmarks
 *   Array of detected face data from the face detection hook.
 * @param {React.RefObject<HTMLCanvasElement>} props.canvasRef
 *   Ref to the overlay canvas element.
 * @param {React.RefObject<HTMLVideoElement>} props.videoRef
 *   Ref to the video element (used as source for blur-based effects).
 * @param {object} props.skinSettings
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
 */
export default function SkinOverlay({ landmarks, canvasRef, videoRef, skinSettings }) {
  useEffect(() => {
    try {
      const canvas = canvasRef?.current;
      const video = videoRef?.current;
      if (!canvas || !landmarks || landmarks.length === 0 || !skinSettings) return;

      const ctx = canvas.getContext("2d");

      if (skinSettings.smoothing?.enabled) {
        applySkinSmoothing(ctx, canvas, landmarks, skinSettings.smoothing);
      }
      if (skinSettings.brightness?.enabled) {
        applySkinBrightness(ctx, landmarks, skinSettings.brightness);
      }
      if (skinSettings.warmth?.enabled) {
        applySkinWarmth(ctx, landmarks, skinSettings.warmth);
      }
      if (skinSettings.glow?.enabled) {
        applySkinGlow(ctx, video || canvas, landmarks, skinSettings.glow);
      }
    } catch {
      // Non-fatal drawing error — next frame will retry
    }
  }, [landmarks, canvasRef, videoRef, skinSettings]);

  return null;
}
