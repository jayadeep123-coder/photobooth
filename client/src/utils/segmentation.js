import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

let segmenterInstance = null;
let isInitializing = false;

export const getImageSegmenter = async () => {
  if (segmenterInstance) return segmenterInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return segmenterInstance;
  }

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    
    segmenterInstance = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
        delegate: 'GPU'
      },
      runningMode: 'IMAGE',
      outputCategoryMask: true,
      outputConfidenceMasks: false
    });
  } catch (error) {
    console.error('Failed to initialize ImageSegmenter:', error);
  } finally {
    isInitializing = false;
  }
  
  return segmenterInstance;
};

export const removeBackground = async (imageElement) => {
  const segmenter = await getImageSegmenter();
  if (!segmenter) throw new Error('Segmenter not initialized');

  // Segment the image
  const result = await segmenter.segment(imageElement);
  
  // The outputCategoryMask is a Uint8Array where 0 is background, 255 is person (or similar depending on model, usually 0 is bg).
  // Wait, selfie_segmenter returns 0 for background, >0 for person features (like hair, face, clothes).
  // Actually, for selfie_segmenter, category mask has values corresponding to categories. 
  // Let's use it to manipulate the canvas pixels.

  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width || imageElement.naturalWidth;
  canvas.height = imageElement.height || imageElement.naturalHeight;
  const ctx = canvas.getContext('2d');
  
  // Draw original image
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const mask = result.categoryMask.getAsUint8Array();
  
  // Apply mask: in this model, 0 represents the person and non-zero values represent background.
  // Set alpha to 0 for background pixels (non-zero mask values).
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 0) {
      data[i * 4 + 3] = 0; // Set alpha channel to 0 (transparent)
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Return the processed canvas as a Data URL
  return canvas.toDataURL('image/png');
};
