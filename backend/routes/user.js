import express from 'express';
import User from '../models/User.js';
import Score from '../models/Score.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile with stats
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        stats: user.getStatsSummary(),
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   POST /api/user/score
// @desc    Submit a new score
// @access  Private
router.post('/score', authMiddleware, async (req, res) => {
  try {
    const { gameMode, score, controlMode, totalSlaps, maxSpeed } = req.body;
    
    // Validation
    if (!gameMode || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Game mode and score are required'
      });
    }
    
    if (!['racing', 'slap'].includes(gameMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game mode. Use "racing" or "slap"'
      });
    }
    
    // Get user
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create score record
    const newScore = await Score.create({
      userId: user._id,
      username: user.username,
      gameMode,
      score,
      controlMode: gameMode === 'racing' ? controlMode : null,
      totalSlaps: gameMode === 'slap' ? totalSlaps : 0,
      maxSpeed: gameMode === 'slap' ? maxSpeed : 0
    });
    
    // Update user stats
    if (gameMode === 'racing') {
      user.stats.racingGamesPlayed += 1;
      user.stats.racingTotalScore += score;
      if (score > user.stats.racingHighScore) {
        user.stats.racingHighScore = score;
      }
    } else if (gameMode === 'slap') {
      user.stats.slapGamesPlayed += 1;
      user.stats.slapTotalSlaps += totalSlaps || 0;
      if (score > user.stats.slapHighScore) {
        user.stats.slapHighScore = score;
      }
      if (maxSpeed > user.stats.slapMaxSpeed) {
        user.stats.slapMaxSpeed = maxSpeed;
      }
    }
    
    await user.save();
    
    // Get updated rank
    const rank = await Score.getUserRank(user._id, gameMode);
    
    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      score: newScore,
      rank,
      stats: user.getStatsSummary()
    });
  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting score'
    });
  }
});

// @route   GET /api/user/scores
// @desc    Get user's score history
// @access  Private
router.get('/scores', authMiddleware, async (req, res) => {
  try {
    const { gameMode, limit = 10 } = req.query;
    
    const query = { userId: req.userId };
    if (gameMode) {
      query.gameMode = gameMode;
    }
    
    const scores = await Score.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      scores
    });
  } catch (error) {
    console.error('Score history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching score history'
    });
  }
});

export default router;
