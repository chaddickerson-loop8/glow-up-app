import {
  FACE_OVAL,
  LEFT_EYE,
  RIGHT_EYE,
  LIPS_OUTER,
} from "./landmarkIndices";

/**
 * Extracts { x, y } positions for a set of landmark indices from the first
 * detected face. Returns null if landmarks are missing.
 *
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 * @param {number[]} indices
 * @returns {{ x: number, y: number }[] | null}
 */
function getPoints(landmarks, indices) {
  if (!landmarks || landmarks.length === 0) return null;
  const kp = landmarks[0].keypoints;
  if (!kp) return null;
  const points = [];
  for (const idx of indices) {
    if (idx >= kp.length) return null;
    points.push({ x: kp[idx].x, y: kp[idx].y });
  }
  return points;
}

/**
 * Traces a closed path through an array of points on the canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }[]} points
 */
function tracePath(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
}

/**
 * Saves canvas state and creates a clipping region from the FACE_OVAL
 * landmarks so that all subsequent drawing is constrained to the face area.
 * Call ctx.restore() after drawing to remove the clip.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @returns {boolean} True if the clip was applied, false if landmarks were missing.
 */
export function createFaceMask(ctx, landmarks) {
  const faceOval = getPoints(landmarks, FACE_OVAL);
  if (!faceOval) return false;

  ctx.save();
  tracePath(ctx, faceOval);
  ctx.clip();
  return true;
}

/**
 * Smooths skin texture by drawing a blurred copy of the face region back
 * at reduced opacity, then restores eye and lip areas at full sharpness
 * so they remain crisp.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {HTMLCanvasElement} canvas - The source canvas element.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {object} settings
 * @param {number} settings.intensity - Smoothing strength from 0 (none) to 1 (maximum).
 */
export function applySkinSmoothing(ctx, canvas, landmarks, settings) {
  if (!landmarks || landmarks.length === 0) return;
  if (settings.intensity <= 0) return;

  const faceOval = getPoints(landmarks, FACE_OVAL);
  const leftEye = getPoints(landmarks, LEFT_EYE);
  const rightEye = getPoints(landmarks, RIGHT_EYE);
  const lips = getPoints(landmarks, LIPS_OUTER);
  if (!faceOval) return;

  ctx.save();
  try {
    const blurPx = Math.round(settings.intensity * 6);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(canvas, 0, 0);

    tracePath(ctx, faceOval);
    ctx.clip();

    ctx.filter = `blur(${blurPx}px)`;
    ctx.globalAlpha = settings.intensity * 0.7;
    ctx.drawImage(tempCanvas, 0, 0);

    ctx.filter = "none";
    ctx.globalAlpha = 1;

    const sharpRegions = [leftEye, rightEye, lips].filter(Boolean);
    for (const region of sharpRegions) {
      tracePath(ctx, region);
      ctx.save();
      ctx.clip();
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();
    }
  } catch {
    // Non-fatal drawing error
  }
  ctx.restore();
}

/**
 * Adjusts the perceived brightness of the face by overlaying a
 * semi-transparent white (brighter) or black (darker) layer on the
 * face oval region.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {object} settings
 * @param {number} settings.level - Brightness adjustment from -1 (darkest)
 *   to 1 (brightest). 0 = no change.
 */
export function applySkinBrightness(ctx, landmarks, settings) {
  if (!landmarks || landmarks.length === 0) return;
  if (settings.level === 0) return;

  const faceOval = getPoints(landmarks, FACE_OVAL);
  if (!faceOval) return;

  ctx.save();
  try {
    tracePath(ctx, faceOval);
    ctx.clip();

    const color = settings.level > 0 ? "255, 255, 255" : "0, 0, 0";
    const alpha = Math.abs(settings.level) * 0.3;

    ctx.fillStyle = `rgba(${color}, ${alpha})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } catch {
    // Non-fatal drawing error
  }
  ctx.restore();
}

/**
 * Applies a warm (orange) or cool (blue) color cast to the face by drawing
 * a tinted semi-transparent overlay on the face oval region.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {object} settings
 * @param {number} settings.level - Warmth from -1 (cool blue) to 1 (warm orange).
 *   0 = no change.
 */
export function applySkinWarmth(ctx, landmarks, settings) {
  if (!landmarks || landmarks.length === 0) return;
  if (settings.level === 0) return;

  const faceOval = getPoints(landmarks, FACE_OVAL);
  if (!faceOval) return;

  ctx.save();
  try {
    tracePath(ctx, faceOval);
    ctx.clip();

    const r = settings.level > 0 ? 255 : 100;
    const g = settings.level > 0 ? 165 : 150;
    const b = settings.level > 0 ? 50 : 255;
    const alpha = Math.abs(settings.level) * 0.15;

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } catch {
    // Non-fatal drawing error
  }
  ctx.restore();
}

/**
 * Creates a soft light bloom effect by drawing a blurred, brightened copy
 * of the face region at low opacity, giving the skin a radiant glow.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {HTMLCanvasElement} canvas - The source canvas element.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {object} settings
 * @param {number} settings.intensity - Glow strength from 0 (none) to 1 (maximum).
 */
export function applySkinGlow(ctx, canvas, landmarks, settings) {
  if (!landmarks || landmarks.length === 0) return;
  if (settings.intensity <= 0) return;

  const faceOval = getPoints(landmarks, FACE_OVAL);
  if (!faceOval) return;

  ctx.save();
  try {
    const blurPx = Math.round(settings.intensity * 10);

    tracePath(ctx, faceOval);
    ctx.clip();

    ctx.filter = `blur(${blurPx}px) brightness(1.3)`;
    ctx.globalAlpha = settings.intensity * 0.35;
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(canvas, 0, 0);
  } catch {
    // Non-fatal drawing error
  }
  ctx.restore();
}
