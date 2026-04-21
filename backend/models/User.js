import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  // Career Profile Fields
  currentRole: {
    type: String,
    trim: true,
    default: ''
  },
  targetRole: {
    type: String,
    trim: true,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  education: {
    type: String,
    trim: true,
    default: ''
  },
  // Gamification
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  achievements: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Activity Tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginStreak: {
    type: Number,
    default: 1
  },
  totalMoodLogs: {
    type: Number,
    default: 0
  },
  totalChatMessages: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    currentRole: this.currentRole,
    targetRole: this.targetRole,
    skills: this.skills,
    interests: this.interests,
    experience: this.experience,
    education: this.education,
    xp: this.xp,
    level: this.level,
    achievements: this.achievements,
    loginStreak: this.loginStreak,
    totalMoodLogs: this.totalMoodLogs,
    totalChatMessages: this.totalChatMessages,
    createdAt: this.createdAt
  };
};

// Update level based on XP
userSchema.methods.updateLevel = function() {
  // Level up every 100 XP
  const newLevel = Math.floor(this.xp / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    return true; // Leveled up
  }
  return false;
};

// Add XP
userSchema.methods.addXP = async function(amount) {
  this.xp += amount;
  const leveledUp = this.updateLevel();
  await this.save();
  return { xp: this.xp, level: this.level, leveledUp };
};

const User = mongoose.model('User', userSchema);

export default User;
