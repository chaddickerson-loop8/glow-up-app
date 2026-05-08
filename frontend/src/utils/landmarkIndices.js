/**
 * MediaPipe FaceMesh landmark index groups.
 *
 * These arrays contain vertex indices from the 468-point (plus 10 iris)
 * FaceMesh topology. Each group defines a contour or region of the face
 * and is used to target specific areas for makeup overlay, liquify
 * deformation, and other effects.
 *
 * Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
 */

/** Jawline and face boundary contour. */
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
  162, 21, 54, 103, 67, 109,
];

/** Left eye contour (from the viewer's perspective, anatomical right eye). */
export const LEFT_EYE = [
  263, 249, 390, 373, 374, 380, 381, 382, 362, 466, 388, 387, 386, 385, 384,
  398,
];

/** Right eye contour (from the viewer's perspective, anatomical left eye). */
export const RIGHT_EYE = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157,
  173,
];

/** Left eyebrow. */
export const LEFT_EYEBROW = [
  276, 283, 282, 295, 285, 300, 293, 334, 296, 336,
];

/** Right eyebrow. */
export const RIGHT_EYEBROW = [
  46, 53, 52, 65, 55, 70, 63, 105, 66, 107,
];

/** Outer lip contour. */
export const LIPS_OUTER = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0,
  37, 39, 40, 185,
];

/** Inner lip contour. */
export const LIPS_INNER = [
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13,
  82, 81, 80, 191,
];

/** Nose bridge from forehead to tip. */
export const NOSE_BRIDGE = [6, 197, 195, 5, 4];

/** Nose tip area. */
export const NOSE_TIP = [1, 2, 98, 327, 4];

/** Left iris landmarks (indices 468–472, available when refineLandmarks is true). */
export const LEFT_IRIS = [468, 469, 470, 471, 472];

/** Right iris landmarks (indices 473–477, available when refineLandmarks is true). */
export const RIGHT_IRIS = [473, 474, 475, 476, 477];
