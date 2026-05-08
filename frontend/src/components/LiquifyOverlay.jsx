import { useEffect } from "react";
import { applyLipLiquify } from "../utils/liquifyRenderer";

/**
 * Renderless component that applies lip liquify/inflation effects onto the
 * shared overlay canvas. Redraws whenever landmarks or settings change.
 *
 * @param {object} props
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} props.landmarks
 *   Array of detected face data from the face detection hook.
 * @param {React.RefObject<HTMLCanvasElement>} props.canvasRef
 *   Ref to the overlay canvas element.
 * @param {object} props.liquifySettings
 * @param {object} props.liquifySettings.lips
 * @param {boolean} props.liquifySettings.lips.enabled
 * @param {number} props.liquifySettings.lips.intensity
 * @param {number} props.liquifySettings.lips.radius
 */
export default function LiquifyOverlay({ landmarks, canvasRef, liquifySettings }) {
  useEffect(() => {
    try {
      const canvas = canvasRef?.current;
      if (!canvas || !landmarks || landmarks.length === 0 || !liquifySettings) return;

      const ctx = canvas.getContext("2d");

      if (liquifySettings.lips?.enabled) {
        applyLipLiquify(ctx, canvas, landmarks, liquifySettings.lips);
      }
    } catch {
      // Non-fatal drawing error — next frame will retry
    }
  }, [landmarks, canvasRef, liquifySettings]);

  return null;
}
