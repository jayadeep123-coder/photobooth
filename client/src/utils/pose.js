import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance = null;
let isInitializing = false;

export const getPoseLandmarker = async () => {
  if (poseLandmarkerInstance) return poseLandmarkerInstance;
  if (isInitializing) {
    // Basic spin wait if already initializing
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return poseLandmarkerInstance;
  }

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    
    poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numPoses: 1
    });
  } catch (error) {
    console.error('Failed to initialize PoseLandmarker:', error);
  } finally {
    isInitializing = false;
  }
  
  return poseLandmarkerInstance;
};
