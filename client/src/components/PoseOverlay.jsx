import { useEffect, useRef, useState } from 'react';
import { getPoseLandmarker } from '../utils/pose';
import './PoseOverlay.css';

export default function PoseOverlay({ videoElement, onPositionChange }) {
  const [isReady, setIsReady] = useState(false);
  const [isInPosition, setIsInPosition] = useState(false);
  const requestRef = useRef();
  const lastVideoTimeRef = useRef(-1);

  useEffect(() => {
    let active = true;

    const startDetection = async () => {
      const poseLandmarker = await getPoseLandmarker();
      if (!poseLandmarker || !active) return;
      
      setIsReady(true);

      const detectPose = () => {
        if (!videoElement || videoElement.readyState < 2) {
          requestRef.current = requestAnimationFrame(detectPose);
          return;
        }

        const currentTime = videoElement.currentTime;
        if (currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = currentTime;
          
          try {
            const result = poseLandmarker.detectForVideo(videoElement, performance.now());
            if (result.landmarks && result.landmarks.length > 0) {
              const landmarks = result.landmarks[0];
              const nose = landmarks[0];
              const leftShoulder = landmarks[11];
              const rightShoulder = landmarks[12];

              // Validation logic
              // x, y are normalized [0.0, 1.0]
              const noseCentered = nose.x > 0.35 && nose.x < 0.65;
              const noseHeight = nose.y > 0.15 && nose.y < 0.55;
              
              // Shoulder distance (width)
              const shoulderDist = Math.abs(leftShoulder.x - rightShoulder.x);
              const goodDistance = shoulderDist > 0.25 && shoulderDist < 0.7;

              const positioned = noseCentered && noseHeight && goodDistance;
              
              setIsInPosition(positioned);
              if (onPositionChange) {
                onPositionChange(positioned);
              }
            } else {
              setIsInPosition(false);
              if (onPositionChange) onPositionChange(false);
            }
          } catch (e) {
            console.error('Detection error:', e);
          }
        }
        
        if (active) {
          requestRef.current = requestAnimationFrame(detectPose);
        }
      };
      
      detectPose();
    };

    startDetection();

    return () => {
      active = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [videoElement, onPositionChange]);

  return (
    <div className={`pose-overlay ${isReady ? 'active' : ''} ${isInPosition ? 'positioned' : ''}`}>
      {/* A generic head and shoulders silhouette SVG */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="silhouette">
        <path 
          d="M 50 15 C 38 15, 38 40, 50 40 C 62 40, 62 15, 50 15 Z M 25 90 C 25 60, 75 60, 75 90 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="4 4"
        />
      </svg>
      {isReady && !isInPosition && (
        <div className="pose-hint fade-in">Align your face and shoulders</div>
      )}
      {isReady && isInPosition && (
        <div className="pose-hint success fade-in">Perfect position!</div>
      )}
    </div>
  );
}
