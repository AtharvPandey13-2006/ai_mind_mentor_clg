import Mood from '../models/Mood.js';
import User from '../models/User.js';
import { analyzeMoodPatterns } from '../services/geminiService.js';

/**
 * Log a new mood entry
 * POST /api/mood
 */
export const logMood = async (req, res) => {
  try {
    const { mood, moodScore, stressLevel, energyLevel, productivityLevel, note, activities } = req.body;

    // Validation
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    // Create mood entry
    const moodEntry = new Mood({
      userId: req.userId,
      mood,
      moodScore: moodScore || 5,
      stressLevel: stressLevel || 5,
      energyLevel: energyLevel || 5,
      productivityLevel: productivityLevel || 5,
      note,
      activities,
    });

    await moodEntry.save();

    // Update user's mood log count and add XP
    const user = await User.findById(req.userId);
    if (user) {
      user.totalMoodLogs += 1;
      const xpResult = await user.addXP(5); // 5 XP for logging mood
      
      return res.status(201).json({
        message: 'Mood logged successfully',
        mood: moodEntry,
        xp: xpResult,
      });
    }

    res.status(201).json({
      message: 'Mood logged successfully',
      mood: moodEntry,
    });
  } catch (error) {
    console.error('Log mood error:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
};

/**
 * Get mood history
 * GET /api/mood/history
 */
export const getMoodHistory = async (req, res) => {
  try {
    const { limit = 30, skip = 0 } = req.query;

    const moods = await Mood.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json(moods);
  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({ error: 'Failed to get mood history' });
  }
};

/**
 * Get mood statistics
 * GET /api/mood/stats
 */
export const getMoodStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const stats = await Mood.getMoodStats(req.userId, parseInt(days));

    res.json(stats);
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ error: 'Failed to get mood statistics' });
  }
};

/**
 * Analyze burnout risk using AI
 * GET /api/mood/analyze
 */
export const analyzeBurnout = async (req, res) => {
  try {
    // Get recent mood history
    const moods = await Mood.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(14); // Last 2 weeks

    if (moods.length === 0) {
      return res.json({
        burnoutRisk: 'unknown',
        message: 'Not enough mood data to analyze. Start tracking your mood!',
        recommendations: ['Log your mood regularly to get personalized insights'],
      });
    }

    // Calculate basic burnout risk without AI (fallback)
    const stats = await Mood.getMoodStats(req.userId, 14);
    
    // Try to get AI analysis
    let aiAnalysis = null;
    try {
      if (process.env.GEMINI_API_KEY && moods.length >= 3) {
        aiAnalysis = await analyzeMoodPatterns(moods);
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue with basic analysis
    }

    // Combine AI insights with statistical analysis
    const response = {
      burnoutRisk: aiAnalysis?.burnoutRisk || stats.burnoutRiskLevel,
      trend: aiAnalysis?.trend || stats.recentTrend,
      statistics: {
        averageStress: stats.averageStress,
        averageEnergy: stats.averageEnergy,
        averageMood: stats.averageMood,
        totalEntries: stats.totalEntries,
      },
      insights: aiAnalysis?.insights || [
        stats.burnoutRiskLevel === 'high' 
          ? 'Your stress levels have been concerning recently'
          : 'Your overall well-being seems stable',
        `You've logged ${stats.totalEntries} mood entries - great job tracking!`
      ],
      recommendations: aiAnalysis?.recommendations || [
        'Take regular breaks throughout your day',
        'Practice mindfulness or meditation',
        'Ensure you\'re getting enough sleep',
      ],
      concerningPatterns: aiAnalysis?.concerningPatterns || [],
    };

    res.json(response);
  } catch (error) {
    console.error('Analyze burnout error:', error);
    res.status(500).json({ error: 'Failed to analyze burnout risk' });
  }
};

/**
 * Delete a mood entry
 * DELETE /api/mood/:id
 */
export const deleteMood = async (req, res) => {
  try {
    const { id } = req.params;

    const mood = await Mood.findOneAndDelete({
      _id: id,
      userId: req.userId, // Ensure user can only delete their own moods
    });

    if (!mood) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    console.error('Delete mood error:', error);
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
};

export default {
  logMood,
  getMoodHistory,
  getMoodStats,
  analyzeBurnout,
  deleteMood,
};
