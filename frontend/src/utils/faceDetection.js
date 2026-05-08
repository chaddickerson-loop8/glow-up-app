import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

/**
 * Initializes the TensorFlow.js WebGL backend and creates a MediaPipe FaceMesh
 * face landmark detector.
 *
 * @returns {Promise<import("@tensorflow-models/face-landmarks-detection").FaceLandmarksDetector>}
 *   A ready-to-use face landmark detector instance.
 * @throws {Error} If the WebGL backend fails to initialize or the model fails to load.
 */
export async function initFaceDetector() {
  try {
    await tf.setBackend("webgl");
    await tf.ready();

    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detector = await faceLandmarksDetection.createDetector(model, {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
      refineLandmarks: true,
      maxFaces: 1,
    });

    return detector;
  } catch (error) {
    throw new Error(`Failed to initialize face detector: ${error.message}`, {
      cause: error,
    });
  }
}

/**
 * Runs face landmark detection on the current frame of a video element.
 *
 * @param {HTMLVideoElement} video - A playing video element to detect faces in.
 * @returns {Promise<import("@tensorflow-models/face-landmarks-detection").Face[]>}
 *   An array of detected faces, each containing keypoints with x, y, z coordinates
 *   and an optional name. Returns an empty array if no faces are detected.
 * @throws {Error} If the detector has not been initialized or detection fails.
 */
export async function detectFaceLandmarks(detector, video) {
  try {
    const faces = await detector.estimateFaces(video, {
      flipHorizontal: false,
    });

    return faces;
  } catch (error) {
    throw new Error(`Face detection failed: ${error.message}`, {
      cause: error,
    });
  }
}
