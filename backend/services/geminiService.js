import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model configuration
const MODEL_NAME = 'gemini-1.5-flash';
const GENERATION_CONFIG = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
};

const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

/**
 * System prompts for different chat types
 */
const SYSTEM_PROMPTS = {
  career: `You are an expert career counselor and mentor with deep knowledge of various industries, 
job roles, and career development strategies. Your role is to:
- Provide personalized career guidance and advice
- Help users identify their strengths and areas for improvement
- Suggest learning resources and skill development paths
- Offer insights on job market trends and opportunities
- Help users set and achieve career goals
- Be supportive, encouraging, and professional
- Provide actionable and practical advice

Keep responses concise (2-4 paragraphs) but informative. Be empathetic and understanding.`,

  emotional: `You are a compassionate and supportive emotional wellness companion. Your role is to:
- Listen actively and validate the user's feelings
- Provide emotional support and encouragement
- Help users manage stress, anxiety, and work-life balance
- Offer practical coping strategies and mindfulness techniques
- Be non-judgmental, warm, and understanding
- Recognize signs of serious mental health issues and suggest professional help when needed
- Focus on empowerment and positive mental health

IMPORTANT: You are not a replacement for professional mental health services. If a user shows 
signs of severe distress, self-harm, or crisis, encourage them to seek professional help.

Keep responses empathetic, supportive, and concise (2-4 paragraphs).`,

  general: `You are MindMentor, an AI assistant that combines career guidance with emotional wellness 
support. Be helpful, professional, and empathetic. Provide clear, actionable advice while being 
supportive of the user's emotional and professional well-being.`
};

/**
 * Send a message to Gemini API
 * @param {string} message - User message
 * @param {string} chatType - Type of chat (career, emotional, general)
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} AI response
 */
export const sendToGemini = async (message, chatType = 'general', conversationHistory = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });

    // Get appropriate system prompt
    const systemPrompt = SYSTEM_PROMPTS[chatType] || SYSTEM_PROMPTS.general;

    // Build conversation history
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will act as described and provide helpful, supportive guidance.' }],
        },
        ...history
      ],
    });

    // Send message
    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    if (error.message?.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.');
    }
    
    if (error.status === 429) {
      throw new Error('AI service is currently busy. Please try again in a moment.');
    }
    
    throw new Error('Failed to get AI response. Please try again.');
  }
};

/**
 * Generate career roadmap using Gemini
 * @param {Object} userProfile - User career profile data
 * @returns {Promise<Object>} Generated roadmap
 */
export const generateCareerRoadmap = async (userProfile) => {
  try {
    const prompt = `Generate a detailed career roadmap for the following profile:

Current Role: ${userProfile.currentRole || 'Entry Level'}
Target Role: ${userProfile.targetRole}
Experience: ${userProfile.experience} years
Skills: ${userProfile.skills?.join(', ') || 'None specified'}
Interests: ${userProfile.interests?.join(', ') || 'None specified'}
Education: ${userProfile.education || 'Not specified'}

Please provide:
1. A step-by-step roadmap with 5-8 major milestones
2. For each milestone, include:
   - Title (brief, actionable)
   - Description (2-3 sentences)
   - Duration estimate
   - Key skills to develop
   - Recommended resources/certifications

Format the response as a JSON object with this structure:
{
  "estimatedDuration": "total time estimate",
  "steps": [
    {
      "id": "step_1",
      "title": "milestone title",
      "description": "detailed description",
      "duration": "time estimate",
      "skills": ["skill1", "skill2"],
      "resources": ["resource1", "resource2"]
    }
  ]
}

Be specific, practical, and realistic. Consider the current job market and industry trends.`;

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        ...GENERATION_CONFIG,
        temperature: 0.7, // Lower temperature for more consistent structure
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If JSON parsing fails, return structured error
    throw new Error('Failed to generate structured roadmap');
  } catch (error) {
    console.error('Roadmap generation error:', error);
    throw new Error('Failed to generate career roadmap. Please try again.');
  }
};

/**
 * Analyze mood patterns and provide insights
 * @param {Array} moodHistory - Recent mood entries
 * @returns {Promise<Object>} Analysis and recommendations
 */
export const analyzeMoodPatterns = async (moodHistory) => {
  try {
    const recentMoods = moodHistory.slice(0, 10);
    const moodSummary = recentMoods.map(m => 
      `${new Date(m.timestamp).toLocaleDateString()}: ${m.mood} (stress: ${m.stressLevel}, energy: ${m.energyLevel})`
    ).join('\n');

    const prompt = `Analyze the following mood history and provide insights:

${moodSummary}

Please provide:
1. Overall mood trend analysis
2. Burnout risk assessment (low/medium/high)
3. 2-3 actionable recommendations for improvement
4. Any concerning patterns to watch

Format as JSON:
{
  "trend": "improving/declining/stable",
  "burnoutRisk": "low/medium/high",
  "insights": ["insight1", "insight2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "concerningPatterns": ["pattern1", "pattern2"] or []
}`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to generate mood analysis');
  } catch (error) {
    console.error('Mood analysis error:', error);
    throw new Error('Failed to analyze mood patterns.');
  }
};

export default {
  sendToGemini,
  generateCareerRoadmap,
  analyzeMoodPatterns,
};
