import express from 'express';
import {
  getCareerProfile,
  updateCareerProfile,
  createRoadmap,
  getRoadmap,
  updateRoadmapStep,
} from '../controllers/careerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All career routes require authentication
router.use(authenticate);

// Career profile routes
router.get('/profile', getCareerProfile);
router.put('/profile', updateCareerProfile);

// Roadmap routes
router.post('/roadmap', createRoadmap);
router.get('/roadmap', getRoadmap);
router.put('/roadmap/step/:stepId', updateRoadmapStep);

export default router;
