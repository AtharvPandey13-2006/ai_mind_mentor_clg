import ChatSession from '../models/ChatSession.js';
import User from '../models/User.js';
import { sendToGemini } from '../services/geminiService.js';

/**
 * Send a message to career chat
 * POST /api/chat/career
 */
export const sendCareerMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat session
    const session = await ChatSession.getOrCreateSession(
      req.userId,
      'career',
      sessionId
    );

    // Add user message to session
    await session.addMessage('user', message);

    // Get conversation history for context
    const history = session.getRecentMessages(10);

    // Send to AI
    const aiResponse = await sendToGemini(message, 'career', history);

    // Add AI response to session
    await session.addMessage('assistant', aiResponse);

    // Update user chat count and add XP
    const user = await User.findById(req.userId);
    if (user) {
      user.totalChatMessages += 1;
      await user.addXP(3); // 3 XP per chat message
    }

    res.json({
      response: aiResponse,
      sessionId: session.sessionId,
    });
  } catch (error) {
    console.error('Career chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
};

/**
 * Send a message to emotional support chat
 * POST /api/chat/emotional
 */
export const sendEmotionalMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat session
    const session = await ChatSession.getOrCreateSession(
      req.userId,
      'emotional',
      sessionId
    );

    // Add user message to session
    await session.addMessage('user', message);

    // Get conversation history for context
    const history = session.getRecentMessages(10);

    // Send to AI with emotional support context
    const aiResponse = await sendToGemini(message, 'emotional', history);

    // Add AI response to session
    await session.addMessage('assistant', aiResponse);

    // Update user chat count and add XP
    const user = await User.findById(req.userId);
    if (user) {
      user.totalChatMessages += 1;
      await user.addXP(3); // 3 XP per chat message
    }

    res.json({
      response: aiResponse,
      sessionId: session.sessionId,
    });
  } catch (error) {
    console.error('Emotional chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
};

/**
 * Send a generic message to Gemini
 * POST /api/chat/gemini
 */
export const sendGeminiMessage = async (req, res) => {
  try {
    const { message, chatType = 'general' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Send to AI (no session tracking for generic messages)
    const aiResponse = await sendToGemini(message, chatType, []);

    res.json({
      response: aiResponse,
      text: aiResponse, // Alternative field name for compatibility
    });
  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
};

/**
 * Get chat history for a session
 * GET /api/chat/history/:sessionId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      sessionId,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: session.sessionId,
      chatType: session.chatType,
      messages: session.messages,
      lastActivity: session.lastActivity,
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

/**
 * Get all user's active sessions
 * GET /api/chat/sessions
 */
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.userId,
      isActive: true,
    })
      .sort({ lastActivity: -1 })
      .select('sessionId chatType lastActivity')
      .limit(20);

    res.json(sessions);
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
};

/**
 * Delete a chat session
 * DELETE /api/chat/session/:sessionId
 */
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await ChatSession.deleteOne({
      sessionId,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

export default {
  sendCareerMessage,
  sendEmotionalMessage,
  sendGeminiMessage,
  getChatHistory,
  getUserSessions,
  deleteSession,
};
