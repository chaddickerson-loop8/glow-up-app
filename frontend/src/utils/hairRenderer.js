import { FACE_OVAL } from "./landmarkIndices";

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
 * Estimates the hair region by constructing a path above the forehead
 * portion of the face oval, extending to the top of the canvas and
 * slightly beyond the face sides to capture hair around the temples.
 *
 * The returned path traces: left side of canvas top -> right side of canvas
 * top -> down the right temple -> along the forehead (top of face oval from
 * right to left) -> up the left temple -> back to start.
 *
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {number} canvasWidth - Width of the canvas in pixels.
 * @returns {{ x: number, y: number }[] | null} Array of points defining the
 *   hair region boundary, or null if landmarks are missing.
 */
export function estimateHairRegion(landmarks, canvasWidth) {
  const faceOval = getPoints(landmarks, FACE_OVAL);
  if (!faceOval) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let topY = Infinity;

  for (const p of faceOval) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < topY) topY = p.y;
  }

  const faceWidth = maxX - minX;
  const templeSpread = faceWidth * 0.3;

  const foreheadPoints = faceOval.filter((p) => p.y < topY + faceWidth * 0.25);
  foreheadPoints.sort((a, b) => a.x - b.x);

  if (foreheadPoints.length < 2) return null;

  const leftEdge = Math.max(0, minX - templeSpread);
  const rightEdge = Math.min(canvasWidth, maxX + templeSpread);

  const path = [];

  path.push({ x: leftEdge, y: 0 });
  path.push({ x: rightEdge, y: 0 });

  path.push({ x: rightEdge, y: foreheadPoints[foreheadPoints.length - 1].y });

  for (let i = foreheadPoints.length - 1; i >= 0; i--) {
    path.push({ x: foreheadPoints[i].x, y: foreheadPoints[i].y });
  }

  path.push({ x: leftEdge, y: foreheadPoints[0].y });

  return path;
}

/**
 * Saves canvas state and creates a clipping region from the provided hair
 * region path. All subsequent drawing will be constrained to this region.
 * Call ctx.restore() after drawing to remove the clip.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {{ x: number, y: number }[]} hairRegionPath - Array of points
 *   from estimateHairRegion defining the clip boundary.
 */
export function createHairMask(ctx, hairRegionPath) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(hairRegionPath[0].x, hairRegionPath[0].y);
  for (let i = 1; i < hairRegionPath.length; i++) {
    ctx.lineTo(hairRegionPath[i].x, hairRegionPath[i].y);
  }
  ctx.closePath();
  ctx.clip();
}

/**
 * Applies a color overlay to the hair region using a compositing blend mode.
 *
 * Blend mode options:
 * - 'multiply': Darkens the hair — good for going to darker colors.
 * - 'screen': Lightens the hair — good for going to lighter/blonde shades.
 * - 'hue': Changes hue only, preserves original luminosity — most natural look.
 * - 'color': Changes hue and saturation, preserves luminosity — vivid colors.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {HTMLCanvasElement} canvas - The source canvas element.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {object} settings
 * @param {string} settings.color - Hair color in hex format (e.g. '#8B4513').
 * @param {number} settings.opacity - Color intensity from 0 (none) to 1 (full).
 * @param {string} [settings.blendMode='multiply'] - Canvas composite operation.
 */
export function applyHairColor(ctx, canvas, landmarks, settings) {
  if (!landmarks || landmarks.length === 0) return;
  if (settings.opacity <= 0) return;

  const hairPath = estimateHairRegion(landmarks, canvas.width);
  if (!hairPath) return;

  ctx.save();
  try {
    createHairMask(ctx, hairPath);

    const blendMode = settings.blendMode || "multiply";
    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = settings.opacity;
    ctx.fillStyle = settings.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } catch {
    // Non-fatal drawing error
  }
  ctx.restore();
}

/**
 * Applies a simulated texture effect to the hair region by displacing
 * pixels in a pattern.
 *
 * Pattern options:
 * - 'smooth': Applies a subtle blur to reduce texture and create a sleek look.
 * - 'wavy': Displaces pixels in a gentle sine-wave pattern for flowing waves.
 * - 'curly': Displaces pixels in a tighter, higher-frequency pattern for curls.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {HTMLCanvasElement} canvas - The source canvas element.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {object} settings
 * @param {string} settings.pattern - Texture pattern: 'smooth', 'wavy', or 'curly'.
 * @param {number} settings.intensity - Effect strength from 0 (none) to 1 (maximum).
 */
export function applyHairTexture(ctx, canvas, landmarks, settings) {
  if (!landmarks || landmarks.length === 0) return;
  if (settings.intensity <= 0) return;

  const hairPath = estimateHairRegion(landmarks, canvas.width);
  if (!hairPath) return;

  ctx.save();
  try {
    if (settings.pattern === "smooth") {
      createHairMask(ctx, hairPath);
      const blurPx = Math.round(settings.intensity * 4);
      ctx.filter = `blur(${blurPx}px)`;
      ctx.globalAlpha = settings.intensity * 0.6;
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
      return;
    }

    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    for (const p of hairPath) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
    }

    const regionX = Math.max(0, Math.floor(minX));
    const regionY = Math.max(0, Math.floor(minY));
    const regionW = Math.min(canvas.width - regionX, Math.ceil(maxX - minX));
    const regionH = Math.min(canvas.height - regionY, Math.ceil(maxY - minY));

    if (regionW <= 0 || regionH <= 0) {
      ctx.restore();
      return;
    }

    const srcData = ctx.getImageData(regionX, regionY, regionW, regionH);
    const dstData = ctx.createImageData(regionW, regionH);
    dstData.data.set(srcData.data);

    const freq = settings.pattern === "curly" ? 0.4 : 0.15;
    const amp = settings.intensity * (settings.pattern === "curly" ? 3 : 5);

    for (let py = 0; py < regionH; py++) {
      for (let px = 0; px < regionW; px++) {
        const dx = Math.round(
          Math.sin((py + regionY) * freq) * amp
        );
        const dy = Math.round(
          Math.cos((px + regionX) * freq * 0.8) * amp * 0.5
        );

        const sx = Math.min(Math.max(px + dx, 0), regionW - 1);
        const sy = Math.min(Math.max(py + dy, 0), regionH - 1);

        const dstIdx = (py * regionW + px) * 4;
        const srcIdx = (sy * regionW + sx) * 4;

        dstData.data[dstIdx] = srcData.data[srcIdx];
        dstData.data[dstIdx + 1] = srcData.data[srcIdx + 1];
        dstData.data[dstIdx + 2] = srcData.data[srcIdx + 2];
        dstData.data[dstIdx + 3] = srcData.data[srcIdx + 3];
      }
    }

    createHairMask(ctx, hairPath);
    ctx.putImageData(dstData, regionX, regionY);
  } catch {
    // Non-fatal drawing error
  }
  ctx.restore();
}
