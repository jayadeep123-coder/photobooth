export const captureFrame = (videoElement, filterType = 'none') => {
  if (!videoElement) return null;

  const canvas = document.createElement('canvas');
  // Match the actual video resolution
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  
  // Apply filter to canvas if set
  if (filterType && filterType !== 'none') {
    let filterString = 'none';
    if (filterType === 'vintage') {
      filterString = 'sepia(0.4) contrast(1.1) saturate(0.9) brightness(0.95)';
    } else if (filterType === 'mono') {
      filterString = 'grayscale(1) contrast(1.2) brightness(0.95)';
    } else if (filterType === 'cool') {
      filterString = 'saturate(1.1) hue-rotate(-15deg) contrast(1.05)';
    }
    ctx.filter = filterString;
  }
  
  // To match the mirrored display of the local video, we flip it horizontally on the canvas
  // Wait, if it's the remote video, we shouldn't mirror it. 
  // Let's make it configurable or just mirror it if it's the local video.
  // We can handle mirroring outside, or check a flag. For simplicity, we just draw the raw frame.
  // The compositing step in Milestone 4 will handle mirroring/layout.
  
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/png');
};
