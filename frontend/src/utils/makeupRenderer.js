import {
  LEFT_EYE,
  RIGHT_EYE,
  LEFT_EYEBROW,
  RIGHT_EYEBROW,
} from "./landmarkIndices";

/**
 * Extracts keypoint positions for a given set of landmark indices from the
 * first detected face. Returns null if landmarks are missing or empty.
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
 * Parses a hex color string into its RGB components.
 *
 * @param {string} hex - A color in "#RRGGBB" or "#RGB" format.
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
      : clean;
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  };
}

/**
 * Draws a smooth path through a series of points using quadratic bezier
 * curves with midpoints as control points.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }[]} points
 */
function smoothPath(ctx, points) {
  if (points.length < 2) return;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

/**
 * Draws eyeshadow on both eyes by filling the region between the upper
 * eyelid and the eyebrow with a vertical gradient that fades from the
 * chosen color near the lash line to transparent near the brow.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks - Detected face landmarks array.
 * @param {object} settings - Eyeshadow settings.
 * @param {string} settings.color - Fill color in hex format (e.g. '#8B5CF6').
 * @param {number} settings.opacity - Overall opacity from 0 to 1.
 */
export function drawEyeshadow(ctx, landmarks, settings) {
  const pairs = [
    { eye: LEFT_EYE, brow: LEFT_EYEBROW },
    { eye: RIGHT_EYE, brow: RIGHT_EYEBROW },
  ];

  for (const { eye, brow } of pairs) {
    const eyePts = getPoints(landmarks, eye);
    const browPts = getPoints(landmarks, brow);
    if (!eyePts || !browPts) return;

    ctx.save();
    try {
      const upperLid = eyePts.slice(8);

      let minY = Infinity;
      let maxY = -Infinity;
      for (const p of browPts) {
        if (p.y < minY) minY = p.y;
      }
      for (const p of upperLid) {
        if (p.y > maxY) maxY = p.y;
      }

      const { r, g, b } = hexToRgb(settings.color);
      const grad = ctx.createLinearGradient(0, minY, 0, maxY);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${settings.opacity})`);

      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;

      ctx.beginPath();
      smoothPath(ctx, upperLid);
      const reversedBrow = [...browPts].reverse();
      for (const p of reversedBrow) {
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
    } catch {
      // Non-fatal drawing error
    }
    ctx.restore();
  }
}

/**
 * Draws eyeliner along the upper eyelid of both eyes using smooth bezier
 * curves. The line tapers from thick at the outer corner to thin at the
 * inner corner, with an optional wing extension.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks - Detected face landmarks array.
 * @param {object} settings - Eyeliner settings.
 * @param {string} settings.color - Stroke color in hex format.
 * @param {number} settings.thickness - Base line thickness in pixels.
 * @param {number} settings.wingLength - Length of the wing extension in pixels.
 * @param {number} settings.wingAngle - Wing angle in degrees (upward from horizontal).
 */
export function drawEyeliner(ctx, landmarks, settings) {
  const eyes = [
    { indices: LEFT_EYE, wingDir: -1 },
    { indices: RIGHT_EYE, wingDir: 1 },
  ];

  for (const { indices, wingDir } of eyes) {
    const pts = getPoints(landmarks, indices);
    if (!pts) return;

    ctx.save();
    try {
      const upperLid = pts.slice(8);

      ctx.strokeStyle = settings.color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const segCount = upperLid.length - 1;
      for (let i = 0; i < segCount; i++) {
        const t = i / segCount;
        const lineWidth =
          settings.thickness * (0.4 + 0.6 * (1 - t));
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(upperLid[i].x, upperLid[i].y);
        if (i + 1 < upperLid.length) {
          const mx = (upperLid[i].x + upperLid[i + 1].x) / 2;
          const my = (upperLid[i].y + upperLid[i + 1].y) / 2;
          ctx.quadraticCurveTo(upperLid[i].x, upperLid[i].y, mx, my);
        }
        ctx.stroke();
      }

      if (settings.wingLength > 0) {
        const outerPt = upperLid[0];
        const angleRad = (settings.wingAngle * Math.PI) / 180;
        const wingEnd = {
          x: outerPt.x + wingDir * settings.wingLength * Math.cos(angleRad),
          y: outerPt.y - settings.wingLength * Math.sin(angleRad),
        };

        ctx.lineWidth = settings.thickness * 0.8;
        ctx.beginPath();
        ctx.moveTo(outerPt.x, outerPt.y);
        ctx.lineTo(wingEnd.x, wingEnd.y);
        ctx.stroke();
      }
    } catch {
      // Non-fatal drawing error
    }
    ctx.restore();
  }
}

/**
 * Draws individual lash strokes extending from the upper eyelid landmarks
 * of both eyes. Each lash is a short bezier curve angled outward from the
 * eye center. Outer lashes are longer than inner lashes.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks - Detected face landmarks array.
 * @param {object} settings - Lash settings.
 * @param {string} settings.color - Stroke color.
 * @param {number} settings.length - Maximum lash length in pixels.
 * @param {number} settings.density - Number of lashes per eye.
 * @param {number} settings.curl - Curl amount from 0 (straight) to 1 (maximum curl).
 */
export function drawLashes(ctx, landmarks, settings) {
  const eyes = [LEFT_EYE, RIGHT_EYE];

  for (const eyeIndices of eyes) {
    const pts = getPoints(landmarks, eyeIndices);
    if (!pts) return;

    ctx.save();
    try {
      const upperLid = pts.slice(8);

      let cx = 0;
      let cy = 0;
      for (const p of pts) {
        cx += p.x;
        cy += p.y;
      }
      cx /= pts.length;
      cy /= pts.length;

      const density = Math.max(1, Math.min(settings.density, upperLid.length));
      const step = Math.max(1, Math.floor(upperLid.length / density));

      ctx.strokeStyle = settings.color;
      ctx.lineCap = "round";
      ctx.lineWidth = 1;

      for (let i = 0; i < upperLid.length; i += step) {
        const p = upperLid[i];
        const t = i / (upperLid.length - 1);
        const lengthFactor = 0.5 + 0.5 * (1 - Math.abs(2 * t - 1));
        const lashLen = settings.length * lengthFactor;

        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;

        const upBias = -0.8;
        const dirX = nx * 0.5;
        const dirY = ny * 0.5 + upBias;
        const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;

        const endX = p.x + (dirX / dirLen) * lashLen;
        const endY = p.y + (dirY / dirLen) * lashLen;

        const cpX = (p.x + endX) / 2 + settings.curl * lashLen * 0.3 * nx;
        const cpY = (p.y + endY) / 2 - settings.curl * lashLen * 0.4;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      }
    } catch {
      // Non-fatal drawing error
    }
    ctx.restore();
  }
}

/**
 * Fills the eyebrow regions using the brow landmarks with a soft-edged
 * shadow for a natural appearance. Thickness is adjustable by scaling
 * the path vertically around the brow center.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} landmarks - Detected face landmarks array.
 * @param {object} settings - Eyebrow settings.
 * @param {string} settings.color - Fill color in hex format.
 * @param {number} settings.opacity - Opacity from 0 to 1.
 * @param {number} settings.thickness - Thickness multiplier (1.0 = natural width).
 */
export function drawEyebrows(ctx, landmarks, settings) {
  const brows = [LEFT_EYEBROW, RIGHT_EYEBROW];

  for (const browIndices of brows) {
    const pts = getPoints(landmarks, browIndices);
    if (!pts) return;

    ctx.save();
    try {
      let centerY = 0;
      for (const p of pts) {
        centerY += p.y;
      }
      centerY /= pts.length;

      const scaled = pts.map((p) => ({
        x: p.x,
        y: centerY + (p.y - centerY) * settings.thickness,
      }));

      ctx.globalAlpha = settings.opacity;
      ctx.fillStyle = settings.color;
      ctx.shadowColor = settings.color;
      ctx.shadowBlur = 4;

      ctx.beginPath();
      smoothPath(ctx, scaled);
      ctx.closePath();
      ctx.fill();
    } catch {
      // Non-fatal drawing error
    }
    ctx.restore();
  }
}
