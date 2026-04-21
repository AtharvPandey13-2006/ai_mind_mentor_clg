import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chatType: {
    type: String,
    enum: ['career', 'emotional', 'general'],
    required: true,
    index: true
  },
  messages: [messageSchema],
  metadata: {
    userMood: String,
    userGoals: [String],
    context: mongoose.Schema.Types.Mixed
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient session retrieval
chatSessionSchema.index({ userId: 1, chatType: 1, lastActivity: -1 });

// Update last activity timestamp when adding messages
chatSessionSchema.methods.addMessage = async function(role, content) {
  this.messages.push({ role, content, timestamp: new Date() });
  this.lastActivity = new Date();
  await this.save();
  return this.messages[this.messages.length - 1];
};

// Get recent messages (for context)
chatSessionSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Archive old inactive sessions (static method)
chatSessionSchema.statics.archiveOldSessions = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await this.updateMany(
    { 
      lastActivity: { $lt: cutoffDate },
      isActive: true 
    },
    { 
      $set: { isActive: false } 
    }
  );
  
  return result.modifiedCount;
};

// Static method to create or get session
chatSessionSchema.statics.getOrCreateSession = async function(userId, chatType, sessionId = null) {
  if (sessionId) {
    const existingSession = await this.findOne({ sessionId, userId });
    if (existingSession) {
      return existingSession;
    }
  }
  
  // Create new session
  const newSessionId = sessionId || `${chatType}_${userId}_${Date.now()}`;
  const session = new this({
    userId,
    sessionId: newSessionId,
    chatType,
    messages: [],
    lastActivity: new Date()
  });
  
  await session.save();
  return session;
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
