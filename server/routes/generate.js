import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import QuizCache from '../models/QuizCache.js';
import { 
  generateRoadmap, 
  generateSubRoadmap, 
  generateCourseQuiz,
  generateRemedialRoadmap,
  generateQuizStep,
  generatePresets
} from '../services/gemini.js';
import { 
  generateFallbackMockRoadmap, 
  generateFallbackMockSubRoadmap, 
  generateFallbackMockCourseQuiz 
} from '../services/mockData.js';

const router = express.Router();

// Helper to fetch user strictly from MongoDB
async function getUser(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await User.findById(id);
}

// POST /api/generate (Single-pass roadmap generation with embedded node resources)
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

// POST /api/generate/sub (Single-pass sub-roadmap generation with embedded resources)
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

// POST /api/generate/course-quiz (10-question evaluation quiz, cached in MongoDB)
router.post('/course-quiz', auth, async (req, res) => {
  const { roadmapId } = req.body;

  if (!roadmapId || !mongoose.Types.ObjectId.isValid(roadmapId)) {
    return res.status(400).json({ error: 'Valid roadmapId is required!' });
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found!' });
    }

    // Check MongoDB QuizCache
    let cachedQuiz = await QuizCache.findOne({ roadmapId });
    if (cachedQuiz) {
      // Send question set without exposing correct answers prematurely
      const sanitizedQuestions = cachedQuiz.questions.map(q => ({
        id: q.id,
        targetSkill: q.targetSkill,
        question: q.question,
        options: q.options
      }));
      return res.json({ quizId: cachedQuiz._id, questions: sanitizedQuestions });
    }

    // Generate new 10-question quiz via Gemini or mock
    let questions;
    if (user.geminiApiKey) {
      questions = await generateCourseQuiz(roadmap.title, roadmap.phases, user.geminiApiKey, 'high');
    } else {
      questions = generateFallbackMockCourseQuiz(roadmap.title, roadmap.phases);
    }

    const newQuizCache = new QuizCache({
      roadmapId: roadmap._id,
      questions
    });

    const savedQuiz = await newQuizCache.save();

    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      targetSkill: q.targetSkill,
      question: q.question,
      options: q.options
    }));

    res.json({ quizId: savedQuiz._id, questions: sanitizedQuestions });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Quiz generation failed' });
  }
});

// POST /api/generate/evaluate-quiz (Evaluates user answers & identifies weak topics)
router.post('/evaluate-quiz', auth, async (req, res) => {
  const { quizId, userAnswers } = req.body; // userAnswers: { [questionId]: selectedIndex }

  if (!quizId || !userAnswers) {
    return res.status(400).json({ error: 'quizId and userAnswers map are required!' });
  }

  try {
    const cachedQuiz = await QuizCache.findById(quizId);
    if (!cachedQuiz) {
      return res.status(404).json({ error: 'Quiz not found!' });
    }

    const questions = cachedQuiz.questions;
    let correctCount = 0;
    const weakTopicsSet = new Set();
    const detailedResults = [];

    questions.forEach(q => {
      const selected = userAnswers[q.id];
      const isCorrect = selected === q.correctIndex;

      if (isCorrect) {
        correctCount++;
      } else {
        if (q.targetSkill) weakTopicsSet.add(q.targetSkill);
      }

      detailedResults.push({
        id: q.id,
        targetSkill: q.targetSkill,
        question: q.question,
        selectedOption: selected !== undefined ? q.options[selected] : 'No answer',
        correctOption: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const totalQuestions = questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const weakTopics = Array.from(weakTopicsSet);

    res.json({
      score: correctCount,
      total: totalQuestions,
      percentage: scorePercentage,
      weakTopics,
      detailedResults
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Evaluation failed' });
  }
});

// POST /api/generate/redesign-course (Synthesizes a remedial roadmap in MongoDB for weak topics)
router.post('/redesign-course', auth, async (req, res) => {
  const { roadmapTitle, weakTopics } = req.body;

  if (!roadmapTitle || !Array.isArray(weakTopics) || weakTopics.length === 0) {
    return res.status(400).json({ error: 'roadmapTitle and weakTopics array are required!' });
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    let remedialData;
    if (user.geminiApiKey) {
      remedialData = await generateRemedialRoadmap(roadmapTitle, weakTopics, user.geminiApiKey, 'high');
    } else {
      remedialData = generateFallbackMockRoadmap(`${roadmapTitle} (Remedial Focus: ${weakTopics[0]})`);
    }

    // Save directly to MongoDB Roadmap collection
    const newRoadmap = new Roadmap({
      owner: user._id,
      title: remedialData.title || `Remedial: ${roadmapTitle}`,
      description: remedialData.description || `Focused review path targeting weak skills: ${weakTopics.join(', ')}`,
      phases: remedialData.phases,
      isSubRoadmap: false,
      completedNodes: {}
    });

    const saved = await newRoadmap.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Remedial course redesign failed' });
  }
});

/**
 * Resolves the parent topic for a quiz node from a pool of candidate parents
 * using exact matching, substring inclusion, and domain keyword similarity.
 */
function resolveParentNode(suggestedParent, candidateParents, initialInterests, question = '', treeNodeLabel = '') {
  if (!Array.isArray(candidateParents) || candidateParents.length === 0) {
    return initialInterests[0] || 'General Focus';
  }

  // 1. Exact case-insensitive match
  if (suggestedParent && typeof suggestedParent === 'string') {
    const cleanSug = suggestedParent.trim().toLowerCase();
    const exact = candidateParents.find(p => p.trim().toLowerCase() === cleanSug);
    if (exact) return exact;

    // 2. Contains match (either candidate contains suggested or vice-versa)
    const containsMatch = candidateParents.find(p => {
      const cleanP = p.trim().toLowerCase();
      return cleanP.includes(cleanSug) || cleanSug.includes(cleanP);
    });
    if (containsMatch) return containsMatch;
  }

  // 3. Domain taxonomy keywords to semantically score candidate parents
  const DOMAIN_KEYWORDS = {
    web: ['web', 'frontend', 'backend', 'fullstack', 'react', 'vue', 'angular', 'svelte', 'css', 'html', 'javascript', 'typescript', 'node', 'express', 'api', 'nextjs', 'tailwind', 'dom', 'browser'],
    data: ['data', 'ml', 'ai', 'machine learning', 'deep learning', 'neural', 'python', 'pandas', 'numpy', 'model', 'nlp', 'computer vision', 'dataset', 'pytorch', 'tensorflow', 'scikit', 'analytics'],
    mobile: ['mobile', 'app', 'ios', 'android', 'swift', 'flutter', 'react native', 'kotlin', 'expo'],
    security: ['security', 'cyber', 'cybersecurity', 'hack', 'penetration', 'auth', 'network', 'firewall', 'encryption', 'vulnerability', 'owasp', 'crypto'],
    cloud: ['cloud', 'devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'terraform', 'linux', 'server', 'deployment', 'infra'],
    game: ['game', 'unity', 'unreal', 'godot', 'shader', '3d', 'physics', 'c#', 'c++', 'rendering'],
    design: ['design', 'ui', 'ux', 'figma', 'wireframe', 'color', 'typography', 'prototype', 'animation'],
    blockchain: ['blockchain', 'solidity', 'crypto', 'web3', 'ethereum', 'smart contract']
  };

  const contextText = `${suggestedParent || ''} ${treeNodeLabel || ''} ${question || ''}`.toLowerCase();
  
  let bestCandidate = candidateParents[0];
  let highestScore = -1;

  candidateParents.forEach((cand) => {
    let score = 0;
    const candLower = cand.toLowerCase();

    // Word match between candidate and context
    const candWords = candLower.split(/\W+/).filter(w => w.length > 2);
    candWords.forEach(w => {
      if (contextText.includes(w)) score += 3;
    });

    // Domain keywords match
    Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
      const candBelongsToDomain = keywords.some(k => candLower.includes(k));
      if (candBelongsToDomain) {
        keywords.forEach(kw => {
          if (contextText.includes(kw)) score += 2;
        });
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestCandidate = cand;
    }
  });

  return bestCandidate;
}

// POST /api/generate/quiz-step
router.post('/quiz-step', auth, async (req, res) => {
  const { userCategory, initialInterests, history, stepNumber, existingNodes } = req.body;

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

    // Build candidates list: initialInterests plus any existing node labels passed in
    const candidateParents = Array.from(
      new Set([
        ...initialInterests,
        ...(Array.isArray(existingNodes) ? existingNodes : [])
      ])
    ).filter(Boolean);

    const data = await generateQuizStep(
      userCategory,
      initialInterests,
      history,
      stepNumber,
      user.geminiApiKey,
      'low',
      candidateParents
    );

    // Resolve & guarantee parentNode matches a genuine candidate
    data.parentNode = resolveParentNode(
      data.parentNode,
      candidateParents,
      initialInterests,
      data.question,
      data.treeNodeLabel
    );

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
