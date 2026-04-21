import CareerProfile from '../models/CareerProfile.js';
import User from '../models/User.js';
import { generateCareerRoadmap } from '../services/geminiService.js';

/**
 * Get user's career profile
 * GET /api/career/profile
 */
export const getCareerProfile = async (req, res) => {
  try {
    let profile = await CareerProfile.findOne({ userId: req.userId });

    // If no profile exists, create a default one
    if (!profile) {
      const user = await User.findById(req.userId);
      profile = new CareerProfile({
        userId: req.userId,
        currentRole: user.currentRole || '',
        targetRole: user.targetRole || '',
        skills: user.skills?.map(s => ({ name: s, level: 'beginner' })) || [],
        interests: user.interests || [],
        experience: user.experience || 0,
        education: user.education || '',
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Get career profile error:', error);
    res.status(500).json({ error: 'Failed to get career profile' });
  }
};

/**
 * Update career profile
 * PUT /api/career/profile
 */
export const updateCareerProfile = async (req, res) => {
  try {
    const updates = req.body;

    let profile = await CareerProfile.findOne({ userId: req.userId });

    if (!profile) {
      // Create new profile
      profile = new CareerProfile({
        userId: req.userId,
        ...updates,
      });
    } else {
      // Update existing profile
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          profile[key] = updates[key];
        }
      });
    }

    await profile.save();

    // Also update user model if relevant fields changed
    if (updates.currentRole || updates.targetRole || updates.skills || updates.interests) {
      await User.findByIdAndUpdate(req.userId, {
        currentRole: updates.currentRole,
        targetRole: updates.targetRole,
        skills: updates.skills?.map(s => s.name || s),
        interests: updates.interests,
      });
    }

    res.json({
      message: 'Career profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update career profile error:', error);
    res.status(500).json({ error: 'Failed to update career profile' });
  }
};

/**
 * Generate career roadmap using AI
 * POST /api/career/roadmap
 */
export const createRoadmap = async (req, res) => {
  try {
    const { currentRole, targetRole, skills, interests, experience, education } = req.body;

    // Validation
    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    // Get or create career profile
    let profile = await CareerProfile.findOne({ userId: req.userId });
    
    if (!profile) {
      profile = new CareerProfile({ userId: req.userId });
    }

    // Update profile with provided data
    if (currentRole) profile.currentRole = currentRole;
    if (targetRole) profile.targetRole = targetRole;
    if (skills) profile.skills = skills.map(s => 
      typeof s === 'string' ? { name: s, level: 'beginner' } : s
    );
    if (interests) profile.interests = interests;
    if (experience !== undefined) profile.experience = experience;
    if (education) profile.education = education;

    // Generate roadmap using AI
    try {
      const roadmapData = await generateCareerRoadmap({
        currentRole: profile.currentRole,
        targetRole: profile.targetRole,
        skills: profile.skills?.map(s => s.name || s),
        interests: profile.interests,
        experience: profile.experience,
        education: profile.education,
      });

      // Update profile with generated roadmap
      profile.roadmap = {
        generated: true,
        generatedAt: new Date(),
        steps: roadmapData.steps || [],
        estimatedDuration: roadmapData.estimatedDuration || 'Not specified',
        completionPercentage: 0,
      };

      await profile.save();

      // Award XP for generating roadmap
      const user = await User.findById(req.userId);
      if (user) {
        await user.addXP(20); // 20 XP for creating roadmap
      }

      res.json({
        message: 'Career roadmap generated successfully',
        roadmap: profile.roadmap,
      });
    } catch (aiError) {
      console.error('AI roadmap generation failed:', aiError);
      
      // Provide a basic fallback roadmap
      const fallbackRoadmap = {
        generated: true,
        generatedAt: new Date(),
        estimatedDuration: '6-12 months',
        steps: [
          {
            id: 'step_1',
            title: 'Assess Current Skills',
            description: 'Identify your current skills and areas for improvement related to your target role.',
            duration: '1-2 weeks',
            skills: ['self-assessment', 'skill-gap-analysis'],
            resources: ['Online skill assessments', 'Industry job descriptions'],
          },
          {
            id: 'step_2',
            title: 'Build Required Skills',
            description: 'Take courses and practice to develop the essential skills for your target role.',
            duration: '3-6 months',
            skills: ['technical-skills', 'soft-skills'],
            resources: ['Online courses', 'Practice projects'],
          },
          {
            id: 'step_3',
            title: 'Gain Practical Experience',
            description: 'Work on real projects or contribute to open-source to build your portfolio.',
            duration: '2-4 months',
            skills: ['project-management', 'collaboration'],
            resources: ['GitHub', 'Personal projects'],
          },
        ],
        completionPercentage: 0,
      };

      profile.roadmap = fallbackRoadmap;
      await profile.save();

      res.json({
        message: 'Career roadmap created successfully (AI service unavailable, using template)',
        roadmap: profile.roadmap,
      });
    }
  } catch (error) {
    console.error('Create roadmap error:', error);
    res.status(500).json({ error: 'Failed to generate career roadmap' });
  }
};

/**
 * Get user's career roadmap
 * GET /api/career/roadmap
 */
export const getRoadmap = async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ userId: req.userId });

    if (!profile || !profile.roadmap.generated) {
      return res.status(404).json({ 
        error: 'No roadmap found. Generate one first!' 
      });
    }

    res.json(profile.roadmap);
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to get career roadmap' });
  }
};

/**
 * Update roadmap step completion
 * PUT /api/career/roadmap/step/:stepId
 */
export const updateRoadmapStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { completed } = req.body;

    const profile = await CareerProfile.findOne({ userId: req.userId });

    if (!profile || !profile.roadmap.generated) {
      return res.status(404).json({ error: 'No roadmap found' });
    }

    const step = profile.roadmap.steps.find(s => s.id === stepId);
    
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    step.completed = completed;
    if (completed) {
      step.completedAt = new Date();
      
      // Award XP for completing a step
      const user = await User.findById(req.userId);
      if (user) {
        await user.addXP(15); // 15 XP per completed step
      }
    } else {
      step.completedAt = null;
    }

    // Update completion percentage
    profile.updateCompletionPercentage();
    await profile.save();

    res.json({
      message: `Step ${completed ? 'completed' : 'uncompleted'} successfully`,
      roadmap: profile.roadmap,
    });
  } catch (error) {
    console.error('Update roadmap step error:', error);
    res.status(500).json({ error: 'Failed to update roadmap step' });
  }
};

export default {
  getCareerProfile,
  updateCareerProfile,
  createRoadmap,
  getRoadmap,
  updateRoadmapStep,
};
