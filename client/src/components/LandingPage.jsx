import { useState } from 'react';
import './LandingPage.css';

export default function LandingPage({ onJoinRoom, onStartSolo }) {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [showDuoModal, setShowDuoModal] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    onJoinRoom(roomId.toUpperCase());
  };

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setRoomId(code);
  };

  return (
    <div className="landing-page-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="logo">
          smile film<span className="dot pink">.</span><span className="dot blue">.</span>
        </div>
        <nav className="header-nav">
          <button onClick={onStartSolo} className="nav-link">Solo Mode</button>
          <button onClick={() => setShowDuoModal(true)} className="nav-link">Duo Mode</button>
          <a href="#about" className="nav-link">About</a>
        </nav>
        <button onClick={onStartSolo} className="btn header-btn">Launch Booth</button>
      </header>

      {/* Hero Content Section */}
      <main className="landing-hero">
        <div className="hero-left">
          <div className="badge">
            MADE FOR MEMORIES • 인생네컷 & MORE
          </div>
          <h1 className="hero-title">
            Fun Dates & <span className="highlight-text pink">Cute Shots</span> for Everyone
          </h1>
          <p className="hero-description">
            Capture authentic Korean-style 4-cut photostrips directly from your browser. 
            Hop in by yourself, or create a shared room to snap synchronized photos with your partner miles away.
          </p>

          <div className="hero-actions">
            <button onClick={onStartSolo} className="btn btn-primary solo-btn">
              Solo Photobooth
            </button>
            <button onClick={() => setShowDuoModal(true)} className="btn btn-secondary duo-btn">
              Connect with Partner
            </button>
          </div>
          
          <div className="hero-footer-text">
            <span className="footer-dot pink">•</span> Solo mode runs instantly. 
            <span className="footer-dot blue">•</span> Duo mode relays synchronized snapshots peer-to-peer.
          </div>
        </div>

        {/* Floating Photostrips Graphic */}
        <div className="hero-right">
          <div className="graphic-container">
            {/* Photostrip 1 */}
            <div className="mock-strip strip-left">
              <div className="photo-slot bg-pink"></div>
              <div className="photo-slot bg-yellow"></div>
              <div className="photo-slot bg-blue"></div>
              <div className="photo-slot bg-pink-light"></div>
              <div className="strip-footer">smile film</div>
            </div>
            
            {/* Photostrip 2 */}
            <div className="mock-strip strip-right">
              <div className="photo-slot bg-sunset"></div>
              <div className="photo-slot bg-cool"></div>
              <div className="photo-slot bg-warm"></div>
              <div className="photo-slot bg-sunset-light"></div>
              <div className="strip-footer">인생네컷</div>
            </div>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <h2 className="section-title">About <span className="highlight-text blue">Smile Film</span></h2>
          <p className="section-subtitle">
            Your premium virtual Korean-style 4-cut photobooth. Capture spontaneous joy by yourself or live-synced with a partner miles away.
          </p>

          {/* Film Strip Roll Layout */}
          <div className="film-strip-container">
            {/* Frame 1 */}
            <div className="film-frame">
              <div className="film-frame-content">
                <div className="film-frame-media bg-pink-light">
                  <span className="film-frame-emoji">📸</span>
                </div>
                <div className="film-frame-text">
                  <div className="film-frame-number">FRAME 01</div>
                  <h3>Authentic 4-Cut Strip</h3>
                  <p>Experience the iconic sequential countdown photobooth. Snap four frames and watch them composite automatically into a classic strip or a cozy Polaroid style layout.</p>
                </div>
              </div>
            </div>

            {/* Frame 2 */}
            <div className="film-frame alternate">
              <div className="film-frame-content">
                <div className="film-frame-media bg-blue-light">
                  <span className="film-frame-emoji">⚡</span>
                </div>
                <div className="film-frame-text">
                  <div className="film-frame-number">FRAME 02</div>
                  <h3>Real-Time Duo Mode</h3>
                  <p>Connect instantly with a partner via simple room codes. Experience live face-position alignment indicators and synchronized countdowns for high-quality shared shots.</p>
                </div>
              </div>
            </div>

            {/* Frame 3 */}
            <div className="film-frame">
              <div className="film-frame-content">
                <div className="film-frame-media bg-yellow-light">
                  <span className="film-frame-emoji">🤖</span>
                </div>
                <div className="film-frame-text">
                  <div className="film-frame-number">FRAME 03</div>
                  <h3>Smart AI Backgrounds</h3>
                  <p>Using Google MediaPipe Selfie Segmentation, automatically isolate yourself to paste in cozy café, cyber sunset, or retro beach scenes. Toggle it off to keep your original backdrop!</p>
                </div>
              </div>
            </div>

            {/* Frame 4 */}
            <div className="film-frame alternate">
              <div className="film-frame-content">
                <div className="film-frame-media bg-pink-light">
                  <span className="film-frame-emoji">✨</span>
                </div>
                <div className="film-frame-text">
                  <div className="film-frame-number">FRAME 04</div>
                  <h3>Aesthetic Filters</h3>
                  <p>Level up your shots with professional-grade color filters. Cycle through Vintage warmth, dramatic Noir, or vibrant Cool styling to fit your exact vibe.</p>
                </div>
              </div>
            </div>

            {/* Frame 5 */}
            <div className="film-frame">
              <div className="film-frame-content">
                <div className="film-frame-media bg-blue-light">
                  <span className="film-frame-emoji">🦄</span>
                </div>
                <div className="film-frame-text">
                  <div className="film-frame-number">FRAME 05</div>
                  <h3>Interactive Stickers</h3>
                  <p>Express yourself with 19 unique custom SVGs (including pointing Flork, Tom & Jerry, Spider-Man, and custom battery graphics). Drag, rotate, scale, or double-click to remove stickers in the Design Studio.</p>
                </div>
              </div>
            </div>

            {/* Frame 6 */}
            <div className="film-frame alternate">
              <div className="film-frame-content">
                <div className="film-frame-media bg-yellow-light">
                  <span className="film-frame-emoji">🎨</span>
                </div>
                <div className="film-frame-text">
                  <div className="film-frame-number">FRAME 06</div>
                  <h3>Tailored Personalization</h3>
                  <p>Add custom captions, select custom font styling, adjust image properties (brightness, saturation, contrast), and download your customized high-resolution printable photostrip instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Duo Room Entry Modal */}
      {showDuoModal && (
        <div className="modal-overlay" onClick={() => setShowDuoModal(false)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDuoModal(false)}>&times;</button>
            <h2 className="title">Join a Duo Session</h2>
            <p className="subtitle">Share a room code with your partner to snap together in sync!</p>
            
            <form onSubmit={handleJoin} className="join-form">
              <input
                type="text"
                className="input-field"
                placeholder="Enter 5-Digit Room Code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={10}
              />
              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="btn btn-primary join-btn">
                Connect and Start
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <button onClick={generateRandomCode} className="btn btn-secondary generate-btn">
              Generate New Room Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
