import express from 'express';
import mongoose from 'mongoose';
import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { STATIC_CURATED_ROADMAPS } from '../services/mockData.js';

const router = express.Router();

// GET /api/roadmaps
router.get('/', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }

    const dbRoadmaps = await Roadmap.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(dbRoadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/roadmaps/curated
router.get('/curated', auth, async (req, res) => {
  try {
    const { keywords } = req.query;
    let userKeywords = [];
    if (keywords) {
      userKeywords = keywords.split(',').map(s => s.trim().toLowerCase());
    }
    
    let userCategory = '';
    if (mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (user) userCategory = user.userCategory;
    }
    
    const normalizedCategory = userCategory ? userCategory.toLowerCase().replace(/\s+/g, '_') : '';
    let curatedList = [];
    
    if (normalizedCategory) {
      const categoryMatches = STATIC_CURATED_ROADMAPS.filter(r => 
        r.tags.some(tag => tag === normalizedCategory)
      );
      curatedList.push(...categoryMatches);
    }
    
    if (userKeywords.length > 0) {
      const keywordMatches = STATIC_CURATED_ROADMAPS.filter(r => 
        r.tags.some(tag => userKeywords.includes(tag.toLowerCase()))
      );
      curatedList.push(...keywordMatches);
    }
    
    curatedList = curatedList.filter((roadmap, index, self) =>
      index === self.findIndex((r) => r.title === roadmap.title)
    );
    
    if (curatedList.length === 0) {
      curatedList = STATIC_CURATED_ROADMAPS.slice(0, 3);
    }
    
    res.json(curatedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/roadmaps
router.post('/', auth, async (req, res) => {
  const { title, description, phases, isSubRoadmap, parentNodeId } = req.body;

  if (!title || !phases) {
    return res.status(400).json({ error: 'Title and phases structure are required!' });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }

    const newRoadmap = new Roadmap({
      owner: req.user.id,
      title,
      description: description || '',
      phases,
      isSubRoadmap: !!isSubRoadmap,
      parentNodeId: parentNodeId || '',
      completedNodes: {}
    });

    const saved = await newRoadmap.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/roadmaps/:id/complete
router.put('/:id/complete', auth, async (req, res) => {
  const { nodeId, completed } = req.body;

  if (!nodeId) {
    return res.status(400).json({ error: 'NodeId is required!' });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(404).json({ error: 'Roadmap not found or invalid session!' });
    }

    const roadmap = await Roadmap.findOne({ _id: req.params.id, owner: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found or unauthorized!' });
    }

    if (!roadmap.completedNodes) {
      roadmap.completedNodes = new Map();
    }
    roadmap.completedNodes.set(nodeId, !!completed);
    
    await roadmap.save();
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/roadmaps/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(404).json({ error: 'Roadmap not found or invalid session!' });
    }

    const result = await Roadmap.deleteOne({ _id: req.params.id, owner: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Roadmap not found or unauthorized!' });
    }
    res.json({ success: true, message: 'Roadmap deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
