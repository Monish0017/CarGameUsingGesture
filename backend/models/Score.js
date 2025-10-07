import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  gameMode: {
    type: String,
    required: true,
    enum: ['racing', 'slap'],
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  // Racing game specific fields
  controlMode: {
    type: String,
    enum: ['lane', 'analog', null],
    default: null
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'complex', null],
    default: 'intermediate'
  },
  // Slap game specific fields
  totalSlaps: {
    type: Number,
    default: 0,
    min: 0
  },
  maxSpeed: {
    type: Number,
    default: 0,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient leaderboard queries
scoreSchema.index({ gameMode: 1, score: -1, date: -1 });
scoreSchema.index({ userId: 1, gameMode: 1, date: -1 });

// Static method to get top scores for a game mode
scoreSchema.statics.getLeaderboard = async function(gameMode, limit = 10) {
  return this.aggregate([
    { $match: { gameMode } },
    { $sort: { score: -1, date: -1 } },
    {
      $group: {
        _id: '$userId',
        username: { $first: '$username' },
        highScore: { $first: '$score' },
        totalSlaps: { $first: '$totalSlaps' },
        maxSpeed: { $first: '$maxSpeed' },
        controlMode: { $first: '$controlMode' },
        date: { $first: '$date' }
      }
    },
    { $sort: { highScore: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: 1,
        score: '$highScore',
        totalSlaps: 1,
        maxSpeed: 1,
        controlMode: 1,
        date: 1
      }
    }
  ]);
};

// Static method to get user's rank in a game mode
scoreSchema.statics.getUserRank = async function(userId, gameMode) {
  const userBestScore = await this.findOne({ userId, gameMode })
    .sort({ score: -1 })
    .select('score');
  
  if (!userBestScore) return null;
  
  const rank = await this.aggregate([
    { $match: { gameMode } },
    { $sort: { score: -1, date: -1 } },
    {
      $group: {
        _id: '$userId',
        highScore: { $first: '$score' }
      }
    },
    { $match: { highScore: { $gte: userBestScore.score } } },
    { $count: 'rank' }
  ]);
  
  return rank.length > 0 ? rank[0].rank : null;
};

const Score = mongoose.model('Score', scoreSchema);

export default Score;
