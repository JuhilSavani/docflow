import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectMongo } from './config/database.js';
import apiRoutes from './routes/api.js';
import SocketService from './services/socketService.js';

const PORT = process.env.PORT || 8000;
const IS_PROD = process.env.NODE_ENV === "production";

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.APP_ORIGIN_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true  
  },
  transports: ['websocket', 'polling'],  
  allowEIO3: true,  
  pingTimeout: 60000,  
  pingInterval: 25000  
});

// Initialize Socket.IO service
const socketService = new SocketService(io);
socketService.initialize();

// Add connection logging
io.engine.on("connection_error", (err) => {
  console.log('Connection error:', err.req);
  console.log('Error code:', err.code);
  console.log('Error message:', err.message);
  console.log('Error context:', err.context);
});

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: IS_PROD ?  process.env.APP_ORIGIN_URL : "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>200:OK</title>
      </head>
      <style>
        *, *::before, *::after{
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
        ::selection {
          background-color: rgb(252, 181, 59, 0.05); 
          color: #FCB53B;
        }
        body{
          min-height: 100vh;
          background: #191919;
          font-family: "Lucida Console", Monaco, monospace;
        }
        h1{
          padding: 1rem;
          color: #FFF287;
        }
      </style>
      <body>
        <h1>Server is up and running!</h1>
      </body>
    </html>
  `);
});

// Application Routes
app.use('/api', apiRoutes);

// Start server
connectMongo().then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${process.env.NODE_ENV || "development"} mode at http://localhost:${PORT}`);
    console.log(`WebSocket server is ready`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});