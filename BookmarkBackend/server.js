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

app.use(cors({
  origin: "https://full-stack-bookmark-19q0xptqa-yogash-s-projects.vercel.app",
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.options("*", cors());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});