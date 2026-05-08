import { useEffect } from "react";
import {
  LEFT_EYE,
  RIGHT_EYE,
  LEFT_EYEBROW,
  RIGHT_EYEBROW,
  LIPS_OUTER,
  LIPS_INNER,
  NOSE_BRIDGE,
  NOSE_TIP,
  LEFT_IRIS,
  RIGHT_IRIS,
  FACE_OVAL,
} from "../utils/landmarkIndices";

const REGION_COLORS = {
  eye: "#00ffff",
  eyebrow: "#ff00ff",
  lipsOuter: "#ff4444",
  lipsInner: "#ff8888",
  nose: "#44ff44",
  iris: "#ffff00",
  faceOval: "#888888",
  default: "#ffffff",
};

const DOT_RADIUS = 1.5;

/**
 * Builds a Set of landmark indices mapped to a specific color for fast lookup
 * during rendering.
 *
 * @param {number[]} indices - Array of landmark indices.
 * @param {string} color - CSS color string.
 * @param {Map<number, string>} map - Map to populate.
 */
function addToColorMap(indices, color, map) {
  for (const idx of indices) {
    map.set(idx, color);
  }
}

/**
 * Returns a Map<number, string> that associates each landmark index with
 * a region color. Indices not in any named group get the default color.
 *
 * @returns {Map<number, string>}
 */
function buildColorMap() {
  const map = new Map();
  addToColorMap(LEFT_EYE, REGION_COLORS.eye, map);
  addToColorMap(RIGHT_EYE, REGION_COLORS.eye, map);
  addToColorMap(LEFT_EYEBROW, REGION_COLORS.eyebrow, map);
  addToColorMap(RIGHT_EYEBROW, REGION_COLORS.eyebrow, map);
  addToColorMap(LIPS_OUTER, REGION_COLORS.lipsOuter, map);
  addToColorMap(LIPS_INNER, REGION_COLORS.lipsInner, map);
  addToColorMap(NOSE_BRIDGE, REGION_COLORS.nose, map);
  addToColorMap(NOSE_TIP, REGION_COLORS.nose, map);
  addToColorMap(LEFT_IRIS, REGION_COLORS.iris, map);
  addToColorMap(RIGHT_IRIS, REGION_COLORS.iris, map);
  addToColorMap(FACE_OVAL, REGION_COLORS.faceOval, map);
  return map;
}

const COLOR_MAP = buildColorMap();

/**
 * Draws color-coded landmark dots onto a canvas. Clears the canvas first,
 * then renders a small circle at each keypoint position.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D drawing context.
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} faces - Detected faces with keypoints.
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 */
function drawLandmarks(ctx, faces, width, height) {
  ctx.clearRect(0, 0, width, height);

  for (const face of faces) {
    const keypoints = face.keypoints;
    for (let i = 0; i < keypoints.length; i++) {
      const { x, y } = keypoints[i];
      const color = COLOR_MAP.get(i) || REGION_COLORS.default;

      ctx.beginPath();
      ctx.arc(x, y, DOT_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}

/**
 * Overlay component that draws detected face landmarks on a canvas as
 * color-coded dots. Each facial region (eyes, brows, lips, nose, iris,
 * face oval) is rendered in a distinct color for easy visual debugging.
 *
 * @param {object} props
 * @param {import("@tensorflow-models/face-landmarks-detection").Face[]} props.landmarks - Array of detected face data.
 * @param {React.RefObject<HTMLCanvasElement>} props.canvasRef - Ref to the overlay canvas element.
 * @param {boolean} [props.visible=true] - Whether to render the landmarks. Set to false to hide.
 */
export default function LandmarkOverlay({ landmarks, canvasRef, visible = true }) {
  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas || !visible || landmarks.length === 0) {
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      const video = canvas.previousElementSibling;
      if (video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
    } catch {
      // Drawing failure on a single frame is non-fatal
    }
  }, [landmarks, canvasRef, visible]);

  return null;
}
