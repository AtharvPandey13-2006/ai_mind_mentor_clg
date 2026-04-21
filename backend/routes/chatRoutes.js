import express from 'express';
import {
  sendCareerMessage,
  sendEmotionalMessage,
  sendGeminiMessage,
  getChatHistory,
  getUserSessions,
  deleteSession,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Chat message routes
router.post('/career', sendCareerMessage);
router.post('/emotional', sendEmotionalMessage);
router.post('/gemini', sendGeminiMessage);

// Chat history routes
router.get('/history/:sessionId', getChatHistory);
router.get('/sessions', getUserSessions);
router.delete('/session/:sessionId', deleteSession);

export default router;
