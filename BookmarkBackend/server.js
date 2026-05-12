const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const folderRoutes = require('./routes/folderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

require('dotenv').config();

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://full-stack-bookmark.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ 
    status: 'Backend Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: 'Connected'
  });
});

// Debug endpoint to test CORS
app.get("/api/test", (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.get('origin'),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎯 Bookmark Backend Server Running   ║
╚════════════════════════════════════════╝
  
  🌐 Server: http://localhost:${PORT}
  📊 Health: http://localhost:${PORT}/health
  ✅ Test: http://localhost:${PORT}/api/test
  
  📝 API Endpoints:
     POST   /api/users               (Register)
     GET    /api/users/:id           (Get User)
     GET    /api/users/email/:email  (Login)
     POST   /api/users/logout        (Logout)
     
  💾 Database: ${process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'MongoDB Local'}
  🔐 CORS: ${process.env.FRONTEND_URL || 'localhost:3000'}
  
  Press CTRL+C to stop the server
  `)
});