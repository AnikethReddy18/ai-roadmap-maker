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

// Global flag to track database fallback status
global.useInMemoryDb = false;

// Configure Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000 // Quick timeout to resolve fallbacks instantly
})
  .then(() => {
    console.log('Connected to MongoDB database successfully!');
  })
  .catch((err) => {
    global.useInMemoryDb = true;
    console.log('\n========================================================================');
    console.log('[WARNING] Local MongoDB daemon was not detected or failed to connect.');
    console.log('👉 FALLING BACK TO IN-MEMORY DATABASE MODE.');
    console.log('All user accounts, settings, and roadmaps will run successfully in-memory!');
    console.log('========================================================================\n');
  });

// Register Api Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/generate', generateRoutes);

// General Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    database: global.useInMemoryDb ? 'in-memory-fallback' : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected') 
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
