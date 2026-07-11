import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let handLandmarkerInstance = null;
let isInitializing = false;

export const getHandLandmarker = async () => {
  if (handLandmarkerInstance) return handLandmarkerInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return handLandmarkerInstance;
  }

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    
    handLandmarkerInstance = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 2
    });
  } catch (error) {
    console.error('Failed to initialize HandLandmarker:', error);
  } finally {
    isInitializing = false;
  }
  
  return handLandmarkerInstance;
};
