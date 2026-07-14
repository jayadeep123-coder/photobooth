import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
console.log('[Socket] Initializing connection to:', URL);

export const socket = io(URL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('[Socket] Connected to server successfully. Connection ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('[Socket] Connection error details:', err.message, err);
});

socket.on('disconnect', (reason) => {
  console.warn('[Socket] Disconnected from server. Reason:', reason);
});
