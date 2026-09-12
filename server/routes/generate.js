import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { users } from '../services/inMemoryDb.js';
import { 
  generateRoadmap, 
  generateSubRoadmap, 
  generateResources,
  generateQuizStep,
  generatePresets
} from '../services/gemini.js';
import { 
  generateFallbackMockRoadmap, 
  generateFallbackMockSubRoadmap, 
  generateFallbackMockResources 
} from '../services/mockData.js';

const router = express.Router();

// Helper to fetch user based on DB mode
async function getUser(id) {
  if (global.useInMemoryDb) {
    return users.find(u => u._id === id);
  }
  return await User.findById(id);
}

// POST /api/generate
router.post('/', auth, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required!' });
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    let data;
    if (user.geminiApiKey) {
      data = await generateRoadmap(topic, user.geminiApiKey, 'high');
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      data = generateFallbackMockRoadmap(topic);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// POST /api/generate/sub
router.post('/sub', auth, async (req, res) => {
  const { parentTopic, subTopic, nodeId } = req.body;

  if (!parentTopic || !subTopic || !nodeId) {
    return res.status(400).json({ error: 'parentTopic, subTopic, and nodeId are required!' });
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    let data;
    if (user.geminiApiKey) {
      data = await generateSubRoadmap(parentTopic, subTopic, user.geminiApiKey, 'high');
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      data = generateFallbackMockSubRoadmap(nodeId, subTopic);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Sub-generation failed' });
  }
});

// POST /api/generate/resources
router.post('/resources', auth, async (req, res) => {
  const { topic, nodeId } = req.body;

  if (!topic || !nodeId) {
    return res.status(400).json({ error: 'Topic and nodeId are required!' });
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    let data;
    if (user.geminiApiKey) {
      data = await generateResources(topic, user.geminiApiKey, 'low');
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));
      data = generateFallbackMockResources(nodeId, topic);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Resources fetch failed' });
  }
});

// POST /api/generate/quiz-step
router.post('/quiz-step', auth, async (req, res) => {
  const { userCategory, initialInterests, history, stepNumber } = req.body;

  if (!userCategory || !Array.isArray(initialInterests) || !Array.isArray(history) || !stepNumber) {
    return res.status(400).json({ error: 'userCategory, initialInterests, history (array) and stepNumber are required!' });
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    if (!user.geminiApiKey) {
      return res.status(403).json({ error: 'Gemini API Key is required for the dynamic quiz.' });
    }

    const data = await generateQuizStep(userCategory, initialInterests, history, stepNumber, user.geminiApiKey, 'low');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Quiz generation failed' });
  }
});

// POST /api/generate/presets
router.post('/presets', auth, async (req, res) => {
  const { interestTree } = req.body;

  if (!interestTree || !Array.isArray(interestTree)) {
    return res.status(400).json({ error: 'interestTree (array) is required!' });
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    if (!user.geminiApiKey) {
      return res.status(403).json({ error: 'Gemini API Key is required to generate presets.' });
    }

    const data = await generatePresets(interestTree, user.geminiApiKey, 'low');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Preset generation failed' });
  }
});

export default router;
