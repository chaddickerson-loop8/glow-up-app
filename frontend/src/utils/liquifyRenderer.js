import { LIPS_OUTER } from "./landmarkIndices";

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
 * Calculates the center position of the lips by averaging all outer lip
 * landmark coordinates.
 *
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @returns {{ x: number, y: number } | null} The lip center, or null if
 *   landmarks are missing.
 */
export function calculateLipCenter(landmarks) {
  const pts = getPoints(landmarks, LIPS_OUTER);
  if (!pts) return null;

  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / pts.length, y: cy / pts.length };
}

/**
 * Calculates the axis-aligned bounding box of the outer lip contour.
 *
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number, width: number, height: number } | null}
 *   The bounding rectangle, or null if landmarks are missing.
 */
export function calculateLipBounds(landmarks) {
  const pts = getPoints(landmarks, LIPS_OUTER);
  if (!pts) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Samples a pixel at fractional coordinates using bilinear interpolation,
 * blending the four nearest integer-coordinate pixels for smooth results.
 * This prevents jagged/pixelated output when the warp samples between
 * pixel boundaries.
 *
 * @param {ImageData} imageData - Source image pixel data.
 * @param {number} x - Fractional x coordinate.
 * @param {number} y - Fractional y coordinate.
 * @returns {{ r: number, g: number, b: number, a: number }}
 *   Interpolated RGBA values (0–255).
 */
export function bilinearInterpolate(imageData, x, y) {
  const { data, width, height } = imageData;

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);

  const fx = x - x0;
  const fy = y - y0;

  const cx0 = Math.max(0, Math.min(x0, width - 1));
  const cy0 = Math.max(0, Math.min(y0, height - 1));

  const i00 = (cy0 * width + cx0) * 4;
  const i10 = (cy0 * width + x1) * 4;
  const i01 = (y1 * width + cx0) * 4;
  const i11 = (y1 * width + x1) * 4;

  const w00 = (1 - fx) * (1 - fy);
  const w10 = fx * (1 - fy);
  const w01 = (1 - fx) * fy;
  const w11 = fx * fy;

  return {
    r: Math.round(data[i00] * w00 + data[i10] * w10 + data[i01] * w01 + data[i11] * w11),
    g: Math.round(data[i00 + 1] * w00 + data[i10 + 1] * w10 + data[i01 + 1] * w01 + data[i11 + 1] * w11),
    b: Math.round(data[i00 + 2] * w00 + data[i10 + 2] * w10 + data[i01 + 2] * w01 + data[i11 + 2] * w11),
    a: Math.round(data[i00 + 3] * w00 + data[i10 + 3] * w10 + data[i01 + 3] * w01 + data[i11 + 3] * w11),
  };
}

/**
 * Applies a radial inflation (liquify) warp to the lip region, making lips
 * appear fuller.
 *
 * Algorithm — inverse mapping with smooth falloff:
 * 1. Calculate the lip center and bounding box.
 * 2. Expand the bounds by the radius setting to define the processing region.
 * 3. For each output pixel within the region, compute its distance from the
 *    lip center as a ratio of the maximum effect radius.
 * 4. If the pixel is within the effect radius, compute a displacement that
 *    pulls the sample point toward the center. This is inverse mapping: we
 *    ask "where in the source should I read to fill this output pixel?"
 *    rather than pushing source pixels outward (which would leave gaps).
 * 5. The displacement uses a cosine falloff — full effect at the center,
 *    smoothly tapering to zero at the edge — so the warp blends seamlessly
 *    with surrounding pixels.
 * 6. The source position is sampled with bilinear interpolation to avoid
 *    jagged artifacts at fractional coordinates.
 * 7. The processed region is written back with putImageData.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {HTMLCanvasElement} canvas - The source canvas element.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks
 *   Detected face landmarks array.
 * @param {object} settings
 * @param {number} settings.intensity - Inflation amount from 0 (none) to 1 (maximum).
 * @param {number} settings.radius - How far the effect extends beyond the lip boundary,
 *   from 0 (tight to lips) to 1 (wide spread).
 */
export function applyLipLiquify(ctx, canvas, landmarks, settings) {
  if (!landmarks || landmarks.length === 0) return;
  if (settings.intensity <= 0) return;

  const center = calculateLipCenter(landmarks);
  const bounds = calculateLipBounds(landmarks);
  if (!center || !bounds) return;

  ctx.save();
  try {
    const spread = 0.5 + settings.radius * 1.0;
    const padX = bounds.width * spread;
    const padY = bounds.height * spread;

    const regionX = Math.max(0, Math.floor(bounds.minX - padX));
    const regionY = Math.max(0, Math.floor(bounds.minY - padY));
    const regionR = Math.min(canvas.width, Math.ceil(bounds.maxX + padX));
    const regionB = Math.min(canvas.height, Math.ceil(bounds.maxY + padY));
    const regionW = regionR - regionX;
    const regionH = regionB - regionY;

    if (regionW <= 0 || regionH <= 0) return;

    const srcData = ctx.getImageData(regionX, regionY, regionW, regionH);
    const dstData = ctx.createImageData(regionW, regionH);

    const effectRadiusX = (bounds.width / 2) * (1 + settings.radius);
    const effectRadiusY = (bounds.height / 2) * (1 + settings.radius);

    const localCx = center.x - regionX;
    const localCy = center.y - regionY;

    const strength = settings.intensity * 0.4;

    for (let py = 0; py < regionH; py++) {
      for (let px = 0; px < regionW; px++) {
        const dx = px - localCx;
        const dy = py - localCy;

        const normDist = Math.sqrt(
          (dx * dx) / (effectRadiusX * effectRadiusX) +
          (dy * dy) / (effectRadiusY * effectRadiusY)
        );

        let srcX = px;
        let srcY = py;

        if (normDist < 1) {
          const falloff = 0.5 * (1 + Math.cos(Math.PI * normDist));
          const scale = 1 - strength * falloff;
          srcX = localCx + dx * scale;
          srcY = localCy + dy * scale;
        }

        const pixel = bilinearInterpolate(srcData, srcX, srcY);
        const dstIdx = (py * regionW + px) * 4;
        dstData.data[dstIdx] = pixel.r;
        dstData.data[dstIdx + 1] = pixel.g;
        dstData.data[dstIdx + 2] = pixel.b;
        dstData.data[dstIdx + 3] = pixel.a;
      }
    }

    ctx.putImageData(dstData, regionX, regionY);
  } catch {
    // Non-fatal drawing error
  }
  ctx.restore();
}
