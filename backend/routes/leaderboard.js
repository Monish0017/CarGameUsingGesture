import express from 'express';
import Score from '../models/Score.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/leaderboard/:gameMode
// @desc    Get top players for a game mode
// @access  Public
router.get('/:gameMode', async (req, res) => {
  try {
    const { gameMode } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!['racing', 'slap'].includes(gameMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game mode. Use "racing" or "slap"'
      });
    }
    
    const leaderboard = await Score.getLeaderboard(gameMode, limit);
    
    res.json({
      success: true,
      gameMode,
      leaderboard
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/:gameMode/rank
// @desc    Get user's rank in a game mode
// @access  Private
router.get('/:gameMode/rank', authMiddleware, async (req, res) => {
  try {
    const { gameMode } = req.params;
    
    if (!['racing', 'slap'].includes(gameMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game mode. Use "racing" or "slap"'
      });
    }
    
    const rank = await Score.getUserRank(req.userId, gameMode);
    
    if (!rank) {
      return res.json({
        success: true,
        rank: null,
        message: 'No scores found for this game mode'
      });
    }
    
    res.json({
      success: true,
      gameMode,
      rank
    });
  } catch (error) {
    console.error('Rank fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rank'
    });
  }
});

export default router;
