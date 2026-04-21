import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['happy', 'neutral', 'stressed', 'anxious', 'burned_out'],
    index: true
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  stressLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  energyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  productivityLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },
  activities: {
    type: String,
    trim: true,
    maxlength: [300, 'Activities cannot exceed 300 characters']
  },
  // Analysis results (calculated)
  burnoutRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries by user and date
moodSchema.index({ userId: 1, timestamp: -1 });

// Calculate burnout risk before saving
moodSchema.pre('save', function(next) {
  // Burnout risk calculation based on stress, energy, and mood
  const avgScore = (this.stressLevel + (10 - this.energyLevel) + (10 - this.moodScore)) / 3;
  
  if (avgScore >= 7) {
    this.burnoutRisk = 'high';
  } else if (avgScore >= 5) {
    this.burnoutRisk = 'medium';
  } else {
    this.burnoutRisk = 'low';
  }
  
  next();
});

// Static method to get mood statistics for a user
moodSchema.statics.getMoodStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const moods = await this.find({
    userId,
    timestamp: { $gte: startDate }
  }).sort({ timestamp: -1 });
  
  if (moods.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      averageStress: 0,
      averageEnergy: 0,
      averageProductivity: 0,
      moodDistribution: {},
      burnoutRiskLevel: 'low'
    };
  }
  
  // Calculate averages
  const totals = moods.reduce((acc, mood) => ({
    moodScore: acc.moodScore + mood.moodScore,
    stressLevel: acc.stressLevel + mood.stressLevel,
    energyLevel: acc.energyLevel + mood.energyLevel,
    productivityLevel: acc.productivityLevel + mood.productivityLevel
  }), { moodScore: 0, stressLevel: 0, energyLevel: 0, productivityLevel: 0 });
  
  const count = moods.length;
  
  // Mood distribution
  const moodDistribution = moods.reduce((acc, mood) => {
    acc[mood.mood] = (acc[mood.mood] || 0) + 1;
    return acc;
  }, {});
  
  // Burnout risk analysis
  const recentMoods = moods.slice(0, Math.min(7, moods.length));
  const highRiskCount = recentMoods.filter(m => m.burnoutRisk === 'high').length;
  const mediumRiskCount = recentMoods.filter(m => m.burnoutRisk === 'medium').length;
  
  let burnoutRiskLevel = 'low';
  if (highRiskCount >= 3 || (highRiskCount + mediumRiskCount) >= 5) {
    burnoutRiskLevel = 'high';
  } else if (mediumRiskCount >= 3) {
    burnoutRiskLevel = 'medium';
  }
  
  return {
    totalEntries: count,
    averageMood: Math.round((totals.moodScore / count) * 10) / 10,
    averageStress: Math.round((totals.stressLevel / count) * 10) / 10,
    averageEnergy: Math.round((totals.energyLevel / count) * 10) / 10,
    averageProductivity: Math.round((totals.productivityLevel / count) * 10) / 10,
    moodDistribution,
    burnoutRiskLevel,
    recentTrend: this.calculateTrend(moods)
  };
};

// Calculate mood trend (improving, declining, stable)
moodSchema.statics.calculateTrend = function(moods) {
  if (moods.length < 3) return 'stable';
  
  const recent = moods.slice(0, Math.min(7, moods.length));
  const older = moods.slice(Math.min(7, moods.length), Math.min(14, moods.length));
  
  if (older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, m) => sum + m.moodScore, 0) / recent.length;
  const olderAvg = older.reduce((sum, m) => sum + m.moodScore, 0) / older.length;
  
  const difference = recentAvg - olderAvg;
  
  if (difference > 1) return 'improving';
  if (difference < -1) return 'declining';
  return 'stable';
};

const Mood = mongoose.model('Mood', moodSchema);

export default Mood;
