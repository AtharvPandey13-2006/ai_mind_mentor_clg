import express from 'express';
import {
  logMood,
  getMoodHistory,
  getMoodStats,
  analyzeBurnout,
  deleteMood,
} from '../controllers/moodController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All mood routes require authentication
router.use(authenticate);

// Mood tracking routes
router.post('/', logMood);
router.get('/history', getMoodHistory);
router.get('/stats', getMoodStats);
router.get('/analyze', analyzeBurnout);
router.delete('/:id', deleteMood);

export default router;
