import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  stats: {
    racingHighScore: { type: Number, default: 0 },
    racingGamesPlayed: { type: Number, default: 0 },
    racingTotalScore: { type: Number, default: 0 },
    slapHighScore: { type: Number, default: 0 },
    slapGamesPlayed: { type: Number, default: 0 },
    slapTotalSlaps: { type: Number, default: 0 },
    slapMaxSpeed: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user stats summary
userSchema.methods.getStatsSummary = function() {
  return {
    racing: {
      highScore: this.stats.racingHighScore,
      gamesPlayed: this.stats.racingGamesPlayed,
      averageScore: this.stats.racingGamesPlayed > 0 
        ? Math.round(this.stats.racingTotalScore / this.stats.racingGamesPlayed) 
        : 0
    },
    slap: {
      highScore: this.stats.slapHighScore,
      gamesPlayed: this.stats.slapGamesPlayed,
      totalSlaps: this.stats.slapTotalSlaps,
      maxSpeed: this.stats.slapMaxSpeed
    }
  };
};

const User = mongoose.model('User', userSchema);

export default User;
