import { useEffect, useRef, useState } from 'react';
import { socket } from '../utils/socket';
import { captureFrame } from '../utils/capture';
import { removeBackground } from '../utils/segmentation';
import { createPhotostrip } from '../utils/composite';
import PoseOverlay from './PoseOverlay';
import ReactionOverlay from './ReactionOverlay';
import { playTick, playShutter } from '../utils/audio';
import './Room.css';

export default function Room({ roomId, isSolo, onCaptureComplete }) {
  const [status, setStatus] = useState('Joining room...');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [activeShot, setActiveShot] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isLocalInPosition, setIsLocalInPosition] = useState(false);
  const [isRemoteInPosition, setIsRemoteInPosition] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [template, setTemplate] = useState('strip');
  const [theme, setTheme] = useState('cafe');
  const [filter, setFilter] = useState('none');
  const [caption, setCaption] = useState('Virtual Photobooth');
  const [frameColor, setFrameColor] = useState('white');
  const [removeBg, setRemoveBg] = useState(true);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteReactionRef = useRef(null);
  const localPoseRef = useRef(null);

  const iceServersRef = useRef([
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMounted) return;
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setIsCameraReady(true);

        if (isSolo) {
          setStatus('Ready to snap!');
          return;
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error accessing media devices:', err);
        setStatus('Error: Camera/Microphone access denied.');
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId, isSolo]);

  useEffect(() => {
    if (isSolo) return;
    socket.emit('pose-status', { roomId, isInPosition: isLocalInPosition });
  }, [isLocalInPosition, roomId, isSolo]);

  useEffect(() => {
    if (isSolo || !isCameraReady) return;

    const createPeerConnection = () => {
      const pc = new RTCPeerConnection({
        iceServers: iceServersRef.current
      });
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const cand = event.candidate.candidate;
          if (cand.includes('relay')) {
            console.log('[WebRTC] Gathered local relay candidate (TURN):', cand);
          } else if (cand.includes('srflx')) {
            console.log('[WebRTC] Gathered local srflx candidate (STUN):', cand);
          } else {
            console.log('[WebRTC] Gathered local host candidate:', cand);
          }
          socket.emit('ice-candidate', { roomId, candidate: event.candidate });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[WebRTC] ICE connection state changed to:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          try {
            pc.getStats().then(stats => {
              stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                  const localCand = stats.get(report.localCandidateId);
                  const remoteCand = stats.get(report.remoteCandidateId);
                  console.log(`[WebRTC] Active connection path: local=${localCand?.candidateType} (protocol=${localCand?.protocol}), remote=${remoteCand?.candidateType} (protocol=${remoteCand?.protocol})`);
                }
              });
            });
          } catch (e) {
            console.error('[WebRTC] Error retrieving connection statistics:', e);
          }
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteStreamReady(true);
          setStatus('Connected!');
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    };

    const joinRoom = () => {
      setStatus('Joining room...');
      socket.emit('join-room', roomId, (response) => {
        if (response.iceServers) {
          iceServersRef.current = response.iceServers;
          console.log('[WebRTC] Received ICE/TURN server config from signaling server:', response.iceServers);
        }
        if (response.status === 'full') {
          setStatus('Room is full');
        } else if (response.status === 'created') {
          setStatus('Waiting for friend to join...');
        } else if (response.status === 'joined') {
          setStatus('Connected! Waiting for video...');
        }
      });
    };

    const handleConnect = () => {
      console.log('[Socket] Connected to signaling server.');
      joinRoom();
    };

    const handleConnectError = (err) => {
      console.error('[Socket] Connection error:', err);
      setStatus('Server connection failed. Retrying...');
    };

    const handleDisconnect = (reason) => {
      console.warn('[Socket] Disconnected from server:', reason);
      setStatus('Disconnected from server. Reconnecting...');
      setRemoteStreamReady(false);
      setIsRemoteInPosition(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);

    socket.on('user-joined', async () => {
      const pc = createPeerConnection();
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { roomId, offer });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    });

    socket.on('webrtc-offer', async (data) => {
      const pc = createPeerConnection();
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { roomId, answer });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on('webrtc-answer', async (data) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    });

    socket.on('ice-candidate', async (data) => {
      if (peerConnectionRef.current) {
        try {
          const candidate = new RTCIceCandidate(data.candidate);
          const cand = candidate.candidate;
          if (cand.includes('relay')) {
            console.log('[WebRTC] Adding remote relay candidate (TURN):', cand);
          } else if (cand.includes('srflx')) {
            console.log('[WebRTC] Adding remote srflx candidate (STUN):', cand);
          } else {
            console.log('[WebRTC] Adding remote host candidate:', cand);
          }
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error('[WebRTC] Error adding remote ice candidate', err);
        }
      }
    });

    socket.on('user-disconnected', () => {
      setStatus('Other user disconnected. Waiting...');
      setRemoteStreamReady(false);
      setIsRemoteInPosition(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    });

    socket.on('remote-pose-status', ({ isInPosition }) => {
      setIsRemoteInPosition(isInPosition);
    });

    socket.on('remote-config-change', (data) => {
      if (data.template) setTemplate(data.template);
      if (data.theme) setTheme(data.theme);
      if (data.filter) setFilter(data.filter);
      if (data.caption !== undefined) setCaption(data.caption);
      if (data.frameColor) setFrameColor(data.frameColor);
      if (data.removeBg !== undefined) setRemoveBg(data.removeBg);
    });

    socket.on('countdown-started', ({ targetTimestamp }) => {
      const startDelay = targetTimestamp - Date.now();
      setTimeout(() => {
        run4ShotSequence();
      }, Math.max(0, startDelay));
    });

    socket.on('remote-reaction', (data) => {
      if (remoteReactionRef.current) {
        remoteReactionRef.current.triggerReaction(data.type, data.x, data.y);
      }
    });

    if (socket.connected) {
      joinRoom();
    } else {
      setStatus('Connecting to signaling server...');
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('user-joined');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
      socket.off('countdown-started');
      socket.off('remote-pose-status');
      socket.off('remote-config-change');
      socket.off('remote-reaction');
    };
  }, [roomId, isSolo, isCameraReady]);

  const startCountdown = () => {
    if (isSolo) {
      run4ShotSequence();
    } else {
      socket.emit('start-countdown', { roomId });
    }
  };

  const handleTemplateChange = (val) => {
    setTemplate(val);
    if (!isSolo) {
      socket.emit('config-change', { roomId, template: val, theme, filter, caption, frameColor, removeBg });
    }
  };

  const handleThemeChange = (val) => {
    setTheme(val);
    if (!isSolo) {
      socket.emit('config-change', { roomId, template, theme: val, filter, caption, frameColor, removeBg });
    }
  };

  const handleFilterChange = (val) => {
    setFilter(val);
    if (!isSolo) {
      socket.emit('config-change', { roomId, template, theme, filter: val, caption, frameColor, removeBg });
    }
  };

  const handleCaptionChange = (val) => {
    setCaption(val);
    if (!isSolo) {
      socket.emit('config-change', { roomId, template, theme, filter, caption: val, frameColor, removeBg });
    }
  };

  const handleFrameColorChange = (val) => {
    setFrameColor(val);
    if (!isSolo) {
      socket.emit('config-change', { roomId, template, theme, filter, caption, frameColor: val, removeBg });
    }
  };

  const handleRemoveBgChange = (val) => {
    setRemoveBg(val);
    if (!isSolo) {
      socket.emit('config-change', { roomId, template, theme, filter, caption, frameColor, removeBg: val });
    }
  };

  const run4ShotSequence = async () => {
    setIsProcessing(true);
    const localFrames = [];
    const remoteFrames = [];

    for (let shot = 1; shot <= 4; shot++) {
      setActiveShot(shot);
      
      // Run a 3-second countdown for this shot
      for (let s = 3; s >= 1; s--) {
        setCountdown(s);
        playTick();
        await new Promise(r => setTimeout(r, 1000));
      }
      
      // Capture moment!
      setCountdown(null);
      playShutter();
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 300);
      
      // Grab local frame with current filter
      const localSrc = captureFrame(localVideoRef.current, filter);
      localFrames.push(localSrc);
      
      // Grab remote frame (if duo) with current filter
      if (!isSolo && remoteVideoRef.current) {
        const remoteSrc = captureFrame(remoteVideoRef.current, filter);
        remoteFrames.push(remoteSrc);
      }
      
      // Wait 1.5 seconds between shots for user to change poses
      if (shot < 4) {
        setStatus(`Prepare for Shot ${shot + 1}...`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Finished capturing all 4 shots! Now process and composite
    setActiveShot(0);
    setStatus('Processing captured shots...');

    try {
      const loadImg = (src) => {
        return new Promise((res) => {
          if (!src) return res(null);
          const img = new Image();
          img.onload = () => res(img);
          img.src = src;
        });
      };

      const localCutouts = [];
      const remoteCutouts = [];

      for (let i = 0; i < 4; i++) {
        if (removeBg) {
          setStatus(`Removing background from Shot ${i + 1}/4...`);
          const localImg = await loadImg(localFrames[i]);
          const localCut = localImg ? await removeBackground(localImg) : null;
          localCutouts.push(localCut);

          if (!isSolo) {
            const remoteImg = await loadImg(remoteFrames[i]);
            const remoteCut = remoteImg ? await removeBackground(remoteImg) : null;
            remoteCutouts.push(remoteCut);
          }
        } else {
          setStatus(`Processing Shot ${i + 1}/4...`);
          localCutouts.push(localFrames[i]);
          if (!isSolo) {
            remoteCutouts.push(remoteFrames[i]);
          }
        }
      }

      setStatus('Preparing final screen...');
      if (onCaptureComplete) {
        onCaptureComplete({ localCutouts, remoteCutouts });
      }
    } catch (err) {
      console.error('Error processing sequence:', err);
      setStatus('Error processing photos.');
      setIsProcessing(false);
    }
  };

  const getFilterStyle = (filterName) => {
    switch (filterName) {
      case 'vintage':
        return 'sepia(0.4) contrast(1.1) saturate(0.9) brightness(0.95)';
      case 'mono':
        return 'grayscale(1) contrast(1.2) brightness(0.95)';
      case 'cool':
        return 'saturate(1.1) hue-rotate(-15deg) contrast(1.05)';
      default:
        return 'none';
    }
  };

  return (
    <div className="room-container fade-in">
      <header className="room-header">
        <h2>{isSolo ? 'Solo Photobooth' : <>Room: <span className="highlight">{roomId}</span></>}</h2>
        <div className="status-badge">{status}</div>
      </header>

      <div className="video-grid">
        <div className={`video-wrapper local-video ${isLocalInPosition ? 'glow-green' : ''} ${isSolo ? 'solo-layout' : ''}`}>
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ filter: getFilterStyle(filter) }} 
          />
          <PoseOverlay 
            videoElement={localVideoRef.current} 
            onPositionChange={setIsLocalInPosition} 
            onPoseUpdate={(pose) => {
              localPoseRef.current = pose;
            }}
          />
          <ReactionOverlay 
            videoElement={localVideoRef.current} 
            isLocal={true}
            localPoseRef={localPoseRef}
            onTrigger={(data) => {
              if (!isSolo) {
                socket.emit('trigger-reaction', { roomId, ...data });
              }
            }}
          />
          <div className="video-label">You {isLocalInPosition ? '(Ready)' : '(Aligning...)'}</div>
        </div>
        
        {!isSolo && (
          <div className={`video-wrapper remote-video ${!remoteStreamReady ? 'placeholder' : ''} ${isRemoteInPosition ? 'glow-green' : ''}`}>
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              style={{ 
                display: remoteStreamReady ? 'block' : 'none',
                filter: getFilterStyle(filter)
              }}
            />
            {remoteStreamReady && (
              <ReactionOverlay 
                ref={remoteReactionRef}
                videoElement={remoteVideoRef.current} 
                isLocal={false}
              />
            )}
            {remoteStreamReady ? (
              <div className="video-label">Friend {isRemoteInPosition ? '(Ready)' : '(Aligning...)'}</div>
            ) : (
              <>
                <div className="loader"></div>
                <p>Waiting for connection...</p>
              </>
            )}
          </div>
        )}
      </div>

      {(remoteStreamReady || isSolo) && (
        <div className="controls-container fade-in">
          <div className="config-panel">
            <div className="config-group">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                <span>Layout template</span>
              </label>
              <div className="config-options">
                <button 
                  className={`config-btn ${template === 'strip' ? 'active' : ''}`}
                  onClick={() => handleTemplateChange('strip')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Classic strip
                </button>
                <button 
                  className={`config-btn ${template === 'polaroid' ? 'active' : ''}`}
                  onClick={() => handleTemplateChange('polaroid')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Cozy polaroid
                </button>
              </div>
            </div>

            {template === 'strip' && (
              <div className="config-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                  <span>Frame border</span>
                </label>
                <div className="config-options">
                  <button 
                    className={`config-btn ${frameColor === 'white' ? 'active' : ''}`}
                    onClick={() => handleFrameColorChange('white')}
                    disabled={activeShot > 0 || isProcessing}
                  >
                    White frame
                  </button>
                  <button 
                    className={`config-btn ${frameColor === 'black' ? 'active' : ''}`}
                    onClick={() => handleFrameColorChange('black')}
                    disabled={activeShot > 0 || isProcessing}
                  >
                    Black frame
                  </button>
                </div>
              </div>
            )}

            <div className="config-group theme-group">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Background theme</span>
              </label>
              <div className="config-options">
                <button 
                  className={`config-btn ${theme === 'cafe' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('cafe')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Cozy cafe
                </button>
                <button 
                  className={`config-btn ${theme === 'beach' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('beach')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Retro beach
                </button>
                <button 
                  className={`config-btn ${theme === 'sunset' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('sunset')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Cyber sunset
                </button>
              </div>
            </div>

            <div className="config-group toggle-group">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon"><path d="M15 4V2M15 16v-2M8 9h2M20 9h-2M17.8 5.2l-1.4 1.4M6.2 16.8l-1.4 1.4M6.2 5.2l1.4 1.4M17.8 16.8l-1.4-1.4M2 15h10V5H2v10z"></path></svg>
                <span>Remove background</span>
              </label>
              <div className="toggle-container">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={removeBg} 
                    onChange={(e) => handleRemoveBgChange(e.target.checked)}
                    disabled={activeShot > 0 || isProcessing}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label">{removeBg ? 'AI removal on' : 'AI removal off'}</span>
              </div>
            </div>

            <div className="config-group filter-group">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                <span>Photo filter</span>
              </label>
              <div className="config-options">
                <button 
                  className={`config-btn ${filter === 'none' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('none')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Normal
                </button>
                <button 
                  className={`config-btn ${filter === 'vintage' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('vintage')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Vintage
                </button>
                <button 
                  className={`config-btn ${filter === 'mono' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('mono')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Noir
                </button>
                <button 
                  className={`config-btn ${filter === 'cool' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('cool')}
                  disabled={activeShot > 0 || isProcessing}
                >
                  Cool
                </button>
              </div>
            </div>

            <hr className="config-divider" />

            <div className="config-group caption-group">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Custom caption</span>
              </label>
              <input 
                type="text" 
                className="caption-input"
                placeholder="Virtual photobooth" 
                value={caption} 
                onChange={(e) => handleCaptionChange(e.target.value)}
                disabled={activeShot > 0 || isProcessing}
                maxLength={40}
              />
            </div>
          </div>

          <button 
            className="btn btn-primary capture-btn" 
            onClick={startCountdown} 
            disabled={activeShot > 0 || isProcessing || !isLocalInPosition || (!isSolo && !isRemoteInPosition)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="camera-icon">
              <path d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7.17157C7.70201 6 8.21071 5.78929 8.58579 5.41421L10 4H14L15.4142 5.41421C15.7893 5.78929 16.298 6 16.8284 6H21C22.1046 6 23 6.89543 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isProcessing 
              ? 'Processing...' 
              : (!isLocalInPosition || (!isSolo && !isRemoteInPosition)) 
                ? 'Align Both to Capture' 
                : 'Start Countdown'}
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="countdown-overlay">
          {activeShot > 0 && <div className="shot-indicator">Shot {activeShot} / 4</div>}
          <div className="countdown-number" key={countdown}>
            {countdown}
          </div>
        </div>
      )}

      <div className={`flash-overlay ${isFlashing ? 'flashing' : ''}`}></div>
    </div>
  );
}
