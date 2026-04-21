import mongoose from 'mongoose';

const roadmapStepSchema = new mongoose.Schema({
  id: String,
  title: {
    type: String,
    required: true
  },
  description: String,
  duration: String,
  resources: [String],
  skills: [String],
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, { _id: false });

const careerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // Career Information
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
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
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
  industry: {
    type: String,
    trim: true,
    default: ''
  },
  // Career Goals
  shortTermGoals: [{
    type: String,
    trim: true
  }],
  longTermGoals: [{
    type: String,
    trim: true
  }],
  // Roadmap
  roadmap: {
    generated: {
      type: Boolean,
      default: false
    },
    generatedAt: Date,
    steps: [roadmapStepSchema],
    estimatedDuration: String,
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  // Preferences
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading', 'mixed'],
    default: 'mixed'
  },
  availability: {
    hoursPerWeek: {
      type: Number,
      default: 5,
      min: 0,
      max: 168
    }
  },
  // AI-Generated Insights
  careerInsights: [{
    insight: String,
    category: {
      type: String,
      enum: ['strength', 'opportunity', 'recommendation', 'warning']
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Update completion percentage when roadmap steps change
careerProfileSchema.methods.updateCompletionPercentage = function() {
  if (!this.roadmap.steps || this.roadmap.steps.length === 0) {
    this.roadmap.completionPercentage = 0;
    return;
  }
  
  const completed = this.roadmap.steps.filter(step => step.completed).length;
  this.roadmap.completionPercentage = Math.round((completed / this.roadmap.steps.length) * 100);
};

// Mark a roadmap step as completed
careerProfileSchema.methods.completeStep = async function(stepId) {
  const step = this.roadmap.steps.find(s => s.id === stepId);
  if (step) {
    step.completed = true;
    step.completedAt = new Date();
    this.updateCompletionPercentage();
    await this.save();
    return true;
  }
  return false;
};

const CareerProfile = mongoose.model('CareerProfile', careerProfileSchema);

export default CareerProfile;
