import { useEffect } from "react";
import { applyHairColor, applyHairTexture } from "../utils/hairRenderer";

/**
 * Renderless component that applies hair color and texture effects onto the
 * shared overlay canvas. Color is applied before texture. Redraws whenever
 * landmarks or settings change.
 *
 * @param {object} props
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} props.landmarks
 *   Array of detected face data from the face detection hook.
 * @param {React.RefObject<HTMLCanvasElement>} props.canvasRef
 *   Ref to the overlay canvas element.
 * @param {object} props.hairSettings
 * @param {object} props.hairSettings.color
 * @param {boolean} props.hairSettings.color.enabled
 * @param {string} props.hairSettings.color.color
 * @param {number} props.hairSettings.color.opacity
 * @param {string} props.hairSettings.color.blendMode
 * @param {object} props.hairSettings.texture
 * @param {boolean} props.hairSettings.texture.enabled
 * @param {string} props.hairSettings.texture.pattern
 * @param {number} props.hairSettings.texture.intensity
 */
export default function HairOverlay({ landmarks, canvasRef, hairSettings }) {
  useEffect(() => {
    try {
      const canvas = canvasRef?.current;
      if (!canvas || !landmarks || landmarks.length === 0 || !hairSettings) return;

      const ctx = canvas.getContext("2d");

      if (hairSettings.color?.enabled) {
        applyHairColor(ctx, canvas, landmarks, hairSettings.color);
      }
      if (hairSettings.texture?.enabled) {
        applyHairTexture(ctx, canvas, landmarks, hairSettings.texture);
      }
    } catch {
      // Non-fatal drawing error — next frame will retry
    }
  }, [landmarks, canvasRef, hairSettings]);

  return null;
}
