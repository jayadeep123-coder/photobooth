const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow if origin is undefined (e.g. server-to-server or local testing)
    if (!origin) return callback(null, true);
    
    // If FRONTEND_URL is set, allow it (strip trailing slash if present)
    const sanitizedFrontendUrl = FRONTEND_URL ? FRONTEND_URL.replace(/\/$/, '') : null;
    const sanitizedOrigin = origin ? origin.replace(/\/$/, '') : null;
    if (sanitizedFrontendUrl && sanitizedOrigin === sanitizedFrontendUrl) {
      return callback(null, true);
    }
    
    // Allow localhost for local development
    if (/^https?:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow any onrender.com subdomains for easy deployment
    if (/\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any vercel.app subdomains for easy deployment
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any railway.app subdomains for easy deployment
    if (/\.railway\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions));

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions
});

const getIceServers = () => {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  // If environment variables are set for TURN, use them.
  // Otherwise, default to Metered.ca Open Relay for out-of-the-box WebRTC traversal support.
  const turnUrl = process.env.TURN_URL || 'turn:openrelay.metered.ca:443';
  const turnUsername = process.env.TURN_USERNAME || 'openrelayproject';
  const turnPassword = process.env.TURN_PASSWORD || 'openrelayproject';

  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnPassword
    });
  }

  const turnUrlTcp = process.env.TURN_URL_TCP || 'turn:openrelay.metered.ca:443?transport=tcp';
  if (turnUrlTcp) {
    iceServers.push({
      urls: turnUrlTcp,
      username: turnUsername,
      credential: turnPassword
    });
  }

  return iceServers;
};

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;
    const iceServers = getIceServers();

    if (numClients === 0) {
      socket.join(roomId);
      socket.roomId = roomId;
      callback({ status: 'created', iceServers });
      console.log(`User ${socket.id} created room ${roomId}`);
    } else if (numClients === 1) {
      socket.join(roomId);
      socket.roomId = roomId;
      callback({ status: 'joined', iceServers });
      console.log(`User ${socket.id} joined room ${roomId}`);
      // Notify the other user that someone joined
      socket.to(roomId).emit('user-joined', socket.id);
    } else {
      callback({ status: 'full' });
      console.log(`User ${socket.id} tried to join full room ${roomId}`);
    }
  });

  socket.on('webrtc-offer', (data) => {
    socket.to(data.roomId).emit('webrtc-offer', {
      offer: data.offer,
      sender: socket.id
    });
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(data.roomId).emit('webrtc-answer', {
      answer: data.answer,
      sender: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  socket.on('start-countdown', (data) => {
    // data.roomId is passed from client
    console.log(`Room ${data.roomId} starting countdown`);
    
    // Calculate a synchronized start time: current server time + 1000ms delay for network buffering
    const targetTimestamp = Date.now() + 1000;
    
    // Broadcast to everyone in the room (including the sender)
    io.in(data.roomId).emit('countdown-started', {
      targetTimestamp
    });
  });

  socket.on('pose-status', (data) => {
    socket.to(data.roomId).emit('remote-pose-status', {
      isInPosition: data.isInPosition
    });
  });

  socket.on('config-change', (data) => {
    socket.to(data.roomId).emit('remote-config-change', data);
  });

  socket.on('trigger-reaction', (data) => {
    socket.to(data.roomId).emit('remote-reaction', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-disconnected', socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
});
