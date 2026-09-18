import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Map of userId -> socketId(s)
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  // User joins with their userId
  socket.on('user:join', (userId) => {
    if (userId) {
      socket.userId = userId;
      userSockets.set(userId, socket.id);
      io.emit('users:online', Array.from(userSockets.keys()));
      console.log(`[Socket.IO] User registered: ${userId}`);
    }
  });

  // Join a specific chat conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Real-time message broadcast
  socket.on('message:send', ({ conversationId, message, recipientId }) => {
    // Broadcast to room
    io.to(`conversation:${conversationId}`).emit('message:received', message);

    // Also send direct notification event to recipient if online
    if (recipientId && userSockets.has(recipientId)) {
      const recipientSocketId = userSockets.get(recipientId);
      io.to(recipientSocketId).emit('notification:new', {
        title: `New message from ${message.sender?.name || 'a user'}`,
        message: message.content,
        type: 'chat',
        link: '/student/messages',
      });
    }
  });

  // Typing indicator
  socket.on('typing:start', ({ conversationId, userName }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:status', {
      isTyping: true,
      userName,
    });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:status', {
      isTyping: false,
    });
  });

  // Broadcast notification to specific user
  socket.on('notification:send', ({ recipientId, notification }) => {
    if (userSockets.has(recipientId)) {
      io.to(userSockets.get(recipientId)).emit('notification:received', notification);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      io.emit('users:online', Array.from(userSockets.keys()));
    }
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start DB and HTTP server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 LearnHub LMS Backend Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💬 Socket.IO Real-time Engine: Active`);
    console.log(`=========================================`);
  });
};

startServer();
