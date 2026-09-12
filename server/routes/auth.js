import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { users } from '../services/inMemoryDb.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cosmic-sketchbook-secret-key-99';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, geminiApiKey } = req.body;

  if (!username || !password || !geminiApiKey) {
    return res.status(400).json({ error: 'Username, password, and Gemini API Key are required!' });
  }

  try {
    let userExists = false;
    
    if (global.useInMemoryDb) {
      userExists = users.some(u => u.username === username.trim());
    } else {
      const existingUser = await User.findOne({ username });
      userExists = !!existingUser;
    }

    if (userExists) {
      return res.status(400).json({ error: 'Username is already taken!' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userId;
    let hasApiKey = !!geminiApiKey;

    if (global.useInMemoryDb) {
      userId = 'user_' + Date.now();
      const newUser = {
        _id: userId,
        username: username.trim(),
        password: hashedPassword,
        geminiApiKey: geminiApiKey,
        hasCompletedOnboarding: false,
        userCategory: '',
        curatedKeywords: [],
        initialInterests: [],
        interestTree: []
      };
      users.push(newUser);
    } else {
      const newUser = new User({
        username,
        password: hashedPassword,
        geminiApiKey
      });
      await newUser.save();
      userId = newUser._id;
    }

    // Sign JWT
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        username: username.trim(),
        hasApiKey,
        hasCompletedOnboarding: false,
        userCategory: '',
        curatedKeywords: [],
        initialInterests: [],
        interestTree: []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required!' });
  }

  try {
    let targetUser = null;

    if (global.useInMemoryDb) {
      targetUser = users.find(u => u.username === username.trim());
    } else {
      targetUser = await User.findOne({ username });
    }

    if (!targetUser) {
      return res.status(400).json({ error: 'Invalid username or password!' });
    }

    const isMatch = await bcrypt.compare(password, targetUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password!' });
    }

    // Sign JWT
    const token = jwt.sign({ id: targetUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: targetUser._id,
        username: targetUser.username,
        hasApiKey: !!targetUser.geminiApiKey,
        hasCompletedOnboarding: !!targetUser.hasCompletedOnboarding,
        userCategory: targetUser.userCategory || '',
        curatedKeywords: targetUser.curatedKeywords || [],
        initialInterests: targetUser.initialInterests || [],
        interestTree: targetUser.interestTree || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import mongoose from 'mongoose';

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    if (global.useInMemoryDb || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = users.find(u => u._id === req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'Session expired. Please sign in again.' });
      }
      return res.json({
        id: user._id,
        username: user.username,
        geminiApiKey: user.geminiApiKey || '',
        hasCompletedOnboarding: !!user.hasCompletedOnboarding,
        userCategory: user.userCategory || '',
        curatedKeywords: user.curatedKeywords || [],
        initialInterests: user.initialInterests || [],
        interestTree: user.interestTree || []
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    res.json({
      id: user._id,
      username: user.username,
      geminiApiKey: user.geminiApiKey || '',
      hasCompletedOnboarding: !!user.hasCompletedOnboarding,
      userCategory: user.userCategory || '',
      curatedKeywords: user.curatedKeywords || [],
      initialInterests: user.initialInterests || [],
      interestTree: user.interestTree || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/settings
router.put('/settings', auth, async (req, res) => {
  const { geminiApiKey } = req.body;

  try {
    if (global.useInMemoryDb || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = users.find(u => u._id === req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found or session expired!' });
      }
      user.geminiApiKey = geminiApiKey || '';
      return res.json({
        success: true,
        message: 'Gemini API Key settings updated successfully!',
        hasApiKey: !!user.geminiApiKey
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found or session expired!' });
    }

    user.geminiApiKey = geminiApiKey || '';
    await user.save();

    res.json({
      success: true,
      message: 'Gemini API Key settings updated successfully!',
      hasApiKey: !!user.geminiApiKey
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/onboarding
router.put('/onboarding', auth, async (req, res) => {
  const { userCategory, curatedKeywords, initialInterests, interestTree } = req.body;

  if (!interestTree || !Array.isArray(interestTree)) {
    return res.status(400).json({ error: 'interestTree (array) is required!' });
  }

  try {
    if (global.useInMemoryDb || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      const user = users.find(u => u._id === req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found or session expired!' });
      }
      user.userCategory = userCategory || '';
      user.curatedKeywords = curatedKeywords || [];
      user.initialInterests = initialInterests || [];
      user.interestTree = interestTree;
      user.hasCompletedOnboarding = true;
      return res.json({
        id: user._id,
        username: user.username,
        geminiApiKey: user.geminiApiKey || '',
        hasCompletedOnboarding: true,
        userCategory: user.userCategory,
        curatedKeywords: user.curatedKeywords,
        initialInterests: user.initialInterests,
        interestTree: user.interestTree
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found or session expired!' });
    }

    user.userCategory = userCategory || '';
    user.curatedKeywords = curatedKeywords || [];
    user.initialInterests = initialInterests || [];
    user.interestTree = interestTree;
    user.hasCompletedOnboarding = true;
    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      geminiApiKey: user.geminiApiKey || '',
      hasCompletedOnboarding: true,
      userCategory: user.userCategory,
      curatedKeywords: user.curatedKeywords,
      initialInterests: user.initialInterests,
      interestTree: user.interestTree
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
