import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route files
import authRoutes from './routes/auth.js';
import roadmapRoutes from './routes/roadmaps.js';
import generateRoutes from './routes/generate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-roadmap-generator';

// Configure Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas database successfully!');
  })
  .catch((err) => {
    console.error('[ERROR] MongoDB connection failed:', err.message);
  });

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/generate', generateRoutes);

// General Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
