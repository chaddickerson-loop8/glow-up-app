import { useEffect } from "react";
import {
  drawEyeshadow,
  drawEyeliner,
  drawLashes,
  drawEyebrows,
} from "../utils/makeupRenderer";

/**
 * Renderless component that draws makeup effects (eyeshadow, eyeliner,
 * lashes, eyebrows) onto a shared overlay canvas. Redraws whenever
 * landmarks or makeup settings change. Only calls drawing functions
 * for effects that are enabled in makeupSettings.
 *
 * @param {object} props
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} props.landmarks
 *   Array of detected face data from the face detection hook.
 * @param {React.RefObject<HTMLCanvasElement>} props.canvasRef
 *   Ref to the overlay canvas element shared with other drawing layers.
 * @param {object} props.makeupSettings
 * @param {object} props.makeupSettings.eyeshadow
 * @param {boolean} props.makeupSettings.eyeshadow.enabled
 * @param {string} props.makeupSettings.eyeshadow.color
 * @param {number} props.makeupSettings.eyeshadow.opacity
 * @param {object} props.makeupSettings.eyeliner
 * @param {boolean} props.makeupSettings.eyeliner.enabled
 * @param {string} props.makeupSettings.eyeliner.color
 * @param {number} props.makeupSettings.eyeliner.thickness
 * @param {number} props.makeupSettings.eyeliner.wingLength
 * @param {number} props.makeupSettings.eyeliner.wingAngle
 * @param {object} props.makeupSettings.lashes
 * @param {boolean} props.makeupSettings.lashes.enabled
 * @param {string} props.makeupSettings.lashes.color
 * @param {number} props.makeupSettings.lashes.length
 * @param {number} props.makeupSettings.lashes.density
 * @param {number} props.makeupSettings.lashes.curl
 * @param {object} props.makeupSettings.eyebrows
 * @param {boolean} props.makeupSettings.eyebrows.enabled
 * @param {string} props.makeupSettings.eyebrows.color
 * @param {number} props.makeupSettings.eyebrows.opacity
 * @param {number} props.makeupSettings.eyebrows.thickness
 */
export default function MakeupOverlay({ landmarks, canvasRef, makeupSettings }) {
  useEffect(() => {
    try {
      const canvas = canvasRef?.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!landmarks || landmarks.length === 0 || !makeupSettings) return;

      if (makeupSettings.eyeshadow?.enabled) {
        drawEyeshadow(ctx, landmarks, makeupSettings.eyeshadow);
      }
      if (makeupSettings.eyeliner?.enabled) {
        drawEyeliner(ctx, landmarks, makeupSettings.eyeliner);
      }
      if (makeupSettings.lashes?.enabled) {
        drawLashes(ctx, landmarks, makeupSettings.lashes);
      }
      if (makeupSettings.eyebrows?.enabled) {
        drawEyebrows(ctx, landmarks, makeupSettings.eyebrows);
      }
    } catch {
      // Non-fatal drawing error — next frame will retry
    }
  }, [landmarks, canvasRef, makeupSettings]);

  return null;
}
