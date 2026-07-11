import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { getHandLandmarker } from '../utils/hand';
import { REACTION_CONFIGS } from '../utils/reactionsConfig';
import './ReactionOverlay.css';

// Pre-load all sprite images to prevent lag when spawning particles
const spriteImages = {};
Object.entries(REACTION_CONFIGS).forEach(([type, config]) => {
  const img = new Image();
  img.src = config.spriteUrl;
  spriteImages[type] = img;
});

class Particle {
  constructor(x, y, vx, vy, size, life, config, type) {
    this.x = x; // Current screen X in pixels
    this.y = y; // Current screen Y in pixels
    this.baseX = x; // Base X coordinate (before wobble)
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.life = life; // Current life in seconds
    this.maxLife = life;
    this.config = config;
    this.type = type;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 3; // rotation rate (rad/s)
    this.wobbleOffset = Math.random() * Math.PI * 2;
    this.isShard = false;
  }

  update(dt, canvasHeight, spawnShards) {
    this.life -= dt;
    if (this.life <= 0) {
      if (this.config.popOnExpire && !this.isShard && spawnShards) {
        spawnShards(this.x, this.y);
      }
      return false;
    }

    // Apply physics: damp velocity and apply gravity
    this.vx *= this.config.drag;
    this.vy *= this.config.drag;
    this.vy += this.config.gravity * 60 * dt; // Scale gravity relative to standard 60fps tick

    // Apply horizontal wander if configured
    if (this.config.wander) {
      if (this.wanderAngle === undefined) {
        this.wanderAngle = Math.random() * Math.PI * 2;
      }
      this.wanderAngle += (Math.random() - 0.5) * this.config.wander.changeRate * 60 * dt;
      this.vx += Math.cos(this.wanderAngle) * this.config.wander.amplitude * 60 * dt;
    }

    this.x += this.vx;
    this.baseX += this.vx;
    this.y += this.vy;

    // Apply horizontal wobble if configured
    if (this.config.wobble) {
      const w = this.config.wobble;
      const progress = this.maxLife - this.life;
      const wobbleVal = Math.sin(progress * w.frequency + this.wobbleOffset) * w.amplitude;
      this.x = this.baseX + wobbleVal;
    }

    // Special bubble popping near the top of the canvas
    if (this.config.popNearTop && !this.isShard) {
      const normalizedY = this.y / canvasHeight;
      if (normalizedY < 0.20) { // Top 20% height boundary
        if (spawnShards) {
          spawnShards(this.x, this.y);
        }
        return false; // Kill parent bubble immediately on pop
      }
    }

    return true; // Keep particle active
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Disable rotation for shards so they look like simple droplets, rotate other assets
    if (!this.isShard) {
      ctx.rotate(this.rotation + (this.rotationSpeed * (this.maxLife - this.life)));
    }
    
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);

    if (this.isShard) {
      // Draw simple circular water/bubble droplets
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const img = spriteImages[this.type];
      if (img && img.complete) {
        ctx.drawImage(img, -this.size / 2, -this.size / 2, this.size, this.size);
      } else {
        // Fallback drawing if image fails to load
        ctx.fillStyle = this.type === 'heart' ? '#ff4d6d' : (this.type === 'bubble' ? 'rgba(173, 216, 230, 0.6)' : '#ffd166');
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

const ReactionOverlay = forwardRef(({ videoElement, isLocal = false, localPoseRef, onTrigger }, ref) => {
  const [isModelReady, setIsModelReady] = useState(false);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const requestRef = useRef();
  const lastVideoTimeRef = useRef(-1);
  const lastTimeRef = useRef(performance.now());

  // Track state for gesture triggers
  const handTrackers = useRef({
    Left: { lastX: null, lastY: null, lastTime: 0, cooldownUntil: 0 },
    Right: { lastX: null, lastY: null, lastTime: 0, cooldownUntil: 0 }
  });

  // Spawn a particle burst for a given reaction type
  const triggerReaction = (type, normalizedX, normalizedY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = REACTION_CONFIGS[type];
    if (!config) return;

    // Convert normalized coords to canvas pixel coords
    // If local, the video is mirrored on screen via scaleX(-1) in CSS, but our drawing uses standard canvas pixels.
    // However, to align with the mirrored camera feed, we draw at `canvas.width - x` if the video is mirrored.
    // To keep drawing coordinates simple, we do the coordinate mirroring right here when creating the particle!
    const displayX = isLocal ? (1 - normalizedX) * canvas.width : normalizedX * canvas.width;
    const displayY = normalizedY * canvas.height;

    const newParticles = [];
    for (let i = 0; i < config.count; i++) {
      // Calculate randomized velocities inside spread angle
      const spreadRad = (config.spreadAngle * Math.PI) / 180;
      let angle;

      if (config.spreadAngle >= 360) {
        angle = Math.random() * Math.PI * 2;
      } else {
        // Center the spread angle upwards (pointing to -PI/2)
        angle = -Math.PI / 2 + (Math.random() * spreadRad - spreadRad / 2);
      }

      const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
      const vx = speed * Math.cos(angle);
      const vy = speed * Math.sin(angle);
      
      const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
      
      newParticles.push(new Particle(
        displayX,
        displayY,
        vx,
        vy,
        size,
        config.lifeTime,
        config,
        type
      ));
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  // Helper to spawn popped bubble shards
  const spawnShards = (x, y) => {
    const shardConfig = { gravity: 0.12, drag: 0.94 };
    const shardParticles = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;
      const vx = speed * Math.cos(angle);
      const vy = speed * Math.sin(angle);
      const size = 3 + Math.random() * 5;
      const life = 0.25 + Math.random() * 0.25;

      const p = new Particle(x, y, vx, vy, size, life, shardConfig, 'shard');
      p.isShard = true;
      shardParticles.push(p);
    }
    particlesRef.current = [...particlesRef.current, ...shardParticles];
  };

  // Expose triggerReaction imperatively to the parent component
  useImperativeHandle(ref, () => ({
    triggerReaction(type, x, y) {
      triggerReaction(type, x, y);
    }
  }));

  // Canvas update/render loop
  useEffect(() => {
    let active = true;

    const loop = () => {
      if (!active) return;

      const canvas = canvasRef.current;
      const video = videoElement;
      
      if (canvas && video && video.readyState >= 2) {
        // Sync canvas resolution to the styled bounds of the video element
        if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
          canvas.width = video.clientWidth;
          canvas.height = video.clientHeight;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        const now = performance.now();
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        // Cap dt to prevent huge jumps in background tabs
        const safeDt = Math.min(dt, 0.1);

        particlesRef.current = particlesRef.current.filter(p => {
          const keep = p.update(safeDt, canvas.height, spawnShards);
          if (keep) {
            p.draw(ctx);
          }
          return keep;
        });
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      active = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [videoElement]);

  // Hand tracking and detection loop (Local camera feed only)
  useEffect(() => {
    if (!isLocal || !videoElement) return;

    let active = true;
    let handLandmarker = null;
    let localRequestRef;

    const startDetection = async () => {
      handLandmarker = await getHandLandmarker();
      if (!handLandmarker || !active) return;

      setIsModelReady(true);

      const detectHands = () => {
        if (!active) return;

        if (videoElement.readyState >= 2) {
          const currentTime = videoElement.currentTime;
          if (currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = currentTime;

            try {
              // Run inference on the video frame
              const result = handLandmarker.detectForVideo(videoElement, performance.now());
              
              if (result.landmarks && result.landmarks.length > 0) {
                const now = performance.now();
                let triggeredHand = null;
                let handCoords = null;

                for (let i = 0; i < result.landmarks.length; i++) {
                  const landmarks = result.landmarks[i];
                  const handedness = result.handedness[i];
                  // categoryName can be "Left" or "Right"
                  const label = handedness[0]?.categoryName || 'Left';

                  // Calculate average position (center of mass) of the hand
                  let sumX = 0;
                  let sumY = 0;
                  landmarks.forEach(pt => {
                    sumX += pt.x;
                    sumY += pt.y;
                  });
                  const cx = sumX / 21;
                  const cy = sumY / 21;

                  const tracker = handTrackers.current[label];

                  // Height threshold relative to face position
                  let thresholdY = 0.45; // Fallback threshold
                  if (localPoseRef && localPoseRef.current) {
                    const pose = localPoseRef.current;
                    const leftShoulderY = pose.leftShoulder?.y;
                    const rightShoulderY = pose.rightShoulder?.y;
                    if (leftShoulderY !== undefined && rightShoulderY !== undefined) {
                      thresholdY = Math.min(leftShoulderY, rightShoulderY) + 0.05; // shoulder level + buffer
                    } else if (pose.nose?.y !== undefined) {
                      thresholdY = pose.nose.y + 0.15; // nose level + buffer
                    }
                  }

                  const isHandRaised = cy < thresholdY;

                  if (isHandRaised && now > tracker.cooldownUntil) {
                    triggeredHand = label;
                    handCoords = { x: cx, y: cy };
                    // Apply cooldown to this hand
                    const cooldownTime = REACTION_CONFIGS.bubble.cooldown;
                    tracker.cooldownUntil = now + cooldownTime;
                    break; // Trigger once per frame
                  }

                  // Update hand tracker history
                  tracker.lastX = cx;
                  tracker.lastY = cy;
                  tracker.lastTime = now;
                }

                if (triggeredHand && handCoords) {
                  triggerReaction('bubble', handCoords.x, handCoords.y);
                  if (onTrigger) {
                    onTrigger({ type: 'bubble', x: handCoords.x, y: handCoords.y });
                  }
                }

              } else {
                // If hand is not detected, clear tracker history to avoid velocity spikes on re-detection
                handTrackers.current.Left.lastX = null;
                handTrackers.current.Left.lastY = null;
                handTrackers.current.Right.lastX = null;
                handTrackers.current.Right.lastY = null;
              }
            } catch (err) {
              console.error('Hand Landmarker inference error:', err);
            }
          }
        }

        if (active) {
          localRequestRef = requestAnimationFrame(detectHands);
        }
      };

      detectHands();
    };

    startDetection();

    return () => {
      active = false;
      if (localRequestRef) {
        cancelAnimationFrame(localRequestRef);
      }
    };
  }, [isLocal, videoElement, localPoseRef, onTrigger]);

  return (
    <div className={`reaction-overlay ${isModelReady ? 'model-ready' : ''}`}>
      <canvas ref={canvasRef} className="reaction-canvas" />
      {isLocal && isModelReady && (
        <div className="hand-status-indicator">
          🫧 Hand reactions ready (Raise hand near face/shoulders to float bubbles!)
        </div>
      )}
    </div>
  );
});

ReactionOverlay.displayName = 'ReactionOverlay';

export default ReactionOverlay;
