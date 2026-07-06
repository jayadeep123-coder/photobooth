import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Room from './components/Room';
import ResultScreen from './components/ResultScreen';

function App() {
  const [roomId, setRoomId] = useState(null);
  const [isSolo, setIsSolo] = useState(false);
  const [capturedData, setCapturedData] = useState(null); // { localCutouts, remoteCutouts }

  const handleJoinRoom = (id) => {
    setIsSolo(false);
    setRoomId(id);
  };

  const handleStartSolo = () => {
    setIsSolo(true);
    setRoomId('SOLO');
  };

  const handleReset = () => {
    setRoomId(null);
    setIsSolo(false);
    setCapturedData(null);
  };

  return (
    <div className="app-container">
      {capturedData ? (
        <ResultScreen 
          localCutouts={capturedData.localCutouts} 
          remoteCutouts={capturedData.remoteCutouts} 
          onReset={handleReset} 
        />
      ) : roomId ? (
        <Room roomId={roomId} isSolo={isSolo} onCaptureComplete={setCapturedData} />
      ) : (
        <LandingPage onJoinRoom={handleJoinRoom} onStartSolo={handleStartSolo} />
      )}
    </div>
  );
}

export default App;
