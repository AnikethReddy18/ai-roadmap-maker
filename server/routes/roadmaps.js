import express from 'express';
import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { roadmaps, users } from '../services/inMemoryDb.js';
import { STATIC_CURATED_ROADMAPS } from '../services/mockData.js';

const router = express.Router();

// GET /api/roadmaps
router.get('/', auth, async (req, res) => {
  try {
    if (global.useInMemoryDb) {
      const userRoadmaps = roadmaps
        .filter(r => r.owner === req.user.id)
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.json(userRoadmaps);
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
    
    // Fetch user to get userCategory
    let userCategory = '';
    if (global.useInMemoryDb) {
      const user = users.find(u => u._id === req.user.id);
      if (user) userCategory = user.userCategory;
    } else {
      const user = await User.findById(req.user.id);
      if (user) userCategory = user.userCategory;
    }
    
    // Normalize category (e.g. "College Student" -> "college_student")
    const normalizedCategory = userCategory ? userCategory.toLowerCase().replace(/\s+/g, '_') : '';
    
    let curatedList = [];
    
    // 1. ALWAYS return master roadmaps matching the exact category tag
    if (normalizedCategory) {
      const categoryMatches = STATIC_CURATED_ROADMAPS.filter(r => 
        r.tags.some(tag => tag === normalizedCategory)
      );
      curatedList.push(...categoryMatches);
    }
    
    // 2. Append roadmaps that match additional keywords
    if (userKeywords.length > 0) {
      const keywordMatches = STATIC_CURATED_ROADMAPS.filter(r => 
        r.tags.some(tag => userKeywords.includes(tag.toLowerCase()))
      );
      curatedList.push(...keywordMatches);
    }
    
    // Remove duplicates based on title
    curatedList = curatedList.filter((roadmap, index, self) =>
      index === self.findIndex((r) => r.title === roadmap.title)
    );
    
    // If no matches at all, return a default set
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
    if (global.useInMemoryDb) {
      const newRoadmap = {
        _id: 'rm_' + Date.now(),
        owner: req.user.id,
        title,
        description: description || '',
        phases,
        isSubRoadmap: !!isSubRoadmap,
        parentNodeId: parentNodeId || '',
        completedNodes: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      roadmaps.push(newRoadmap);
      return res.status(201).json(newRoadmap);
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
    if (global.useInMemoryDb) {
      const roadmap = roadmaps.find(r => r._id === req.params.id && r.owner === req.user.id);
      if (!roadmap) {
        return res.status(404).json({ error: 'Roadmap not found or unauthorized!' });
      }
      if (!roadmap.completedNodes) {
        roadmap.completedNodes = {};
      }
      roadmap.completedNodes[nodeId] = !!completed;
      roadmap.updatedAt = new Date();
      return res.json(roadmap);
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
    if (global.useInMemoryDb) {
      const index = roadmaps.findIndex(r => r._id === req.params.id && r.owner === req.user.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Roadmap not found or unauthorized!' });
      }
      roadmaps.splice(index, 1);
      return res.json({ success: true, message: 'Roadmap deleted successfully!' });
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
