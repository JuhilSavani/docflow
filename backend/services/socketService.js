import { v4 as uuidv4 } from 'uuid';
import Room from '../models/Room.js';
import Document from '../models/Document.js';

export default class SocketService {
  constructor(io) {
    this.io = io;
    this.activeUsers = {};
    this.roomUsers = {};
  }
  
  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      socket.on('disconnect', () => this.handleDisconnect(socket));
      socket.on('join_room', (data) => this.handleJoinRoom(socket, data));
      socket.on('leave_room', (data) => this.handleLeaveRoom(socket, data));
      socket.on('document_change', (data) => this.handleDocumentChange(socket, data));
      socket.on('cursor_position', (data) => this.handleCursorPosition(socket, data));
      socket.on('title_change', (data) => this.handleTitleChange(socket, data));
    });
  }
  
  handleDisconnect(socket) {
    console.log(`Client disconnected: ${socket.id}`);
    
    if (this.activeUsers[socket.id]) {
      const userData = this.activeUsers[socket.id];
      const roomId = userData.room_id;
      
      delete this.activeUsers[socket.id];
      
      if (this.roomUsers[roomId]) {
        this.roomUsers[roomId] = this.roomUsers[roomId].filter(u => u.sid !== socket.id);
        
        socket.to(roomId).emit('user-disconnected', {
          userId: userData.userId,
          userName: userData.userName
        });
        
        this.io.to(roomId).emit('users-update', this.roomUsers[roomId]);
      }
    }
  }
  
  handleJoinRoom(socket, data) {
    const roomId = data.roomId;
    const userName = data.userName || 'Anonymous';
    const userId = data.userId || uuidv4();
    
    const userData = {
      sid: socket.id,
      userId,
      userName,
      room_id: roomId,
      color: data.color || '#3b82f6'
    };
    
    this.activeUsers[socket.id] = userData;
    socket.join(roomId);
    
    if (!this.roomUsers[roomId]) {
      this.roomUsers[roomId] = [];
    }
    
    // Remove any existing entry for this userId (in case of reconnection)
    this.roomUsers[roomId] = this.roomUsers[roomId].filter(u => u.userId !== userId);
    
    // Add the new connection
    this.roomUsers[roomId].push(userData);
    
    // Notify others about new user
    socket.to(roomId).emit('user-connected', {
      userId,
      userName,
      color: userData.color
    });
    
    // Send updated user list to ALL users in the room (including the new one)
    this.io.to(roomId).emit('users-update', this.roomUsers[roomId]);
    
    console.log(`User ${userName} joined room ${roomId}`);
  }
  
  handleLeaveRoom(socket, data) {
    const roomId = data.roomId;
    socket.leave(roomId);
    
    if (this.activeUsers[socket.id]) {
      delete this.activeUsers[socket.id];
      
      if (this.roomUsers[roomId]) {
        this.roomUsers[roomId] = this.roomUsers[roomId].filter(u => u.sid !== socket.id);
        this.io.to(roomId).emit('users-update', this.roomUsers[roomId]);
      }
    }
  }
  
  async handleDocumentChange(socket, data) {
    const roomId = data.roomId;
    const content = data.content || '';
    
    try {
      console.log(`Document change in room ${roomId}, content length: ${content.length}`);
      await Document.updateContent(roomId, content);
      // Broadcast to other users (excluding sender)
      socket.to(roomId).emit('document-update', { content });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }
  
  handleCursorPosition(socket, data) {
    const roomId = data.roomId;
    const position = data.position;
    
    if (this.activeUsers[socket.id]) {
      const userData = this.activeUsers[socket.id];
      
      socket.to(roomId).emit('cursor-update', {
        userId: userData.userId,
        userName: userData.userName,
        color: userData.color,
        position
      });
    }
  }
  
  async handleTitleChange(socket, data) {
    const roomId = data.roomId;
    const title = data.title || 'Untitled Document';
    
    try {
      await Room.updateTitle(roomId, title);
      // Broadcast to other users (excluding sender)
      socket.to(roomId).emit('title-update', { title });
    } catch (error) {
      console.error('Error updating title:', error);
    }
  }
}

