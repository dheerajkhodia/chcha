
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join-room', ({ roomId, username, isAdmin }) => {
    socket.join(roomId);
    console.log(`${username} (${socket.id}) joined room: ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        playbackState: { isPlaying: false, time: 0 },
        videoUrl: ''
      };
    }
    
    // Add user to room
    const isUserInRoom = rooms[roomId].users.some(u => u.id === socket.id);
    if (!isUserInRoom) {
      rooms[roomId].users.push({ id: socket.id, username, isAdmin });
    }

    // Send current room state to the new user
    socket.emit('room-state', {
      users: rooms[roomId].users,
      playbackState: rooms[roomId].playbackState,
    });
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', { id: socket.id, username, isAdmin });

    socket.on('send-message', (message) => {
      io.to(roomId).emit('receive-message', message);
    });

    socket.on('playback-control', (control) => {
        // Only admin can control playback
        const user = rooms[roomId].users.find(u => u.id === socket.id);
        if (user && user.isAdmin) {
            rooms[roomId].playbackState = control.state;
            socket.to(roomId).emit('playback-update', control.state);
        }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
      if (rooms[roomId]) {
        const user = rooms[roomId].users.find(u => u.id === socket.id);
        if (user) {
          io.to(roomId).emit('user-left', { id: socket.id, username: user.username });
          rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);
          
          if(rooms[roomId].users.length === 0){
              delete rooms[roomId];
              console.log(`Room ${roomId} is empty and has been deleted.`);
          }
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
