const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      socket.join(roomId);
      socket.roomId = roomId;
      callback({ status: 'created' });
      console.log(`User ${socket.id} created room ${roomId}`);
    } else if (numClients === 1) {
      socket.join(roomId);
      socket.roomId = roomId;
      callback({ status: 'joined' });
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
