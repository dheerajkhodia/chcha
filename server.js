
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

console.log("Starting server.js...");

try {
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
    try {
      console.log(`A user connected: ${socket.id}`);

      socket.on('join-room', ({ roomId, username, isAdmin }) => {
        try {
          socket.join(roomId);
          console.log(`${username} (${socket.id}) joined room: ${roomId}`);

          if (!rooms[roomId]) {
            console.log(`Creating new room: ${roomId}`);
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
          } else {
            console.log(`User ${username} (${socket.id}) is already in room ${roomId}.`);
          }

          // Send current room state to the new user
          console.log(`Sending room-state to ${socket.id}`);
          socket.emit('room-state', {
            users: rooms[roomId].users,
            playbackState: rooms[roomId].playbackState,
          });
          
          // Notify others in the room
          console.log(`Notifying room ${roomId} that user ${username} has joined.`);
          socket.to(roomId).emit('user-joined', { id: socket.id, username, isAdmin });

          socket.on('send-message', (message) => {
            console.log(`Message received in room ${roomId}:`, message);
            io.to(roomId).emit('receive-message', message);
          });

          socket.on('playback-control', (control) => {
              const user = rooms[roomId]?.users.find(u => u.id === socket.id);
              if (user && user.isAdmin) {
                  console.log(`Playback control from admin ${user.username} in room ${roomId}:`, control.state);
                  rooms[roomId].playbackState = control.state;
                  socket.to(roomId).emit('playback-update', control.state);
              } else {
                  console.log(`Playback control attempt by non-admin in room ${roomId}.`);
              }
          });

          socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            if (rooms[roomId]) {
              const user = rooms[roomId].users.find(u => u.id === socket.id);
              if (user) {
                console.log(`User ${user.username} left room ${roomId}.`);
                io.to(roomId).emit('user-left', { id: socket.id, username: user.username });
                rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);
                
                if(rooms[roomId].users.length === 0){
                    delete rooms[roomId];
                    console.log(`Room ${roomId} is empty and has been deleted.`);
                }
              }
            }
          });
        } catch (error) {
          console.error(`Error in join-room handler for socket ${socket.id}:`, error);
        }
      });
    } catch (error) {
      console.error(`Error in socket connection handler for socket ${socket.id}:`, error);
    }
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Socket.IO server running successfully on port ${PORT}`);
  });

} catch (e) {
  console.error("An unexpected error occurred while starting the server:", e);
  process.exit(1);
}
