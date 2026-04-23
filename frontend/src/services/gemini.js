import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mind-mentor-clg-3.onrender.com/api';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Send a message to Gemini API through the backend
 * @param {string} message - The user message
 * @param {string} systemPrompt - Optional system prompt for context
 * @returns {Promise<string>} The AI response
 */
export const sendMessageToGemini = async (message, systemPrompt = '') => {
  try {
    // Combine system prompt and user message if system prompt exists
    const fullMessage = systemPrompt ? `${systemPrompt}\n\nUser: ${message}` : message;
    
    // Call backend endpoint for Gemini API
    const response = await apiClient.post('/chat/gemini', {
      message: fullMessage
    });

    // Return the AI response
    if (response.data && response.data.response) {
      return response.data.response;
    } else if (response.data && response.data.text) {
      return response.data.text;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error calling Gemini API through backend:', error);
    
    // Return friendly fallback messages based on error
    if (error.response?.status === 429) {
      throw new Error('API rate limit reached. Please wait a moment and try again.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }

    throw new Error(error.response?.data?.message || 'Failed to get response from AI. Please try again.');
  }
};

/**
 * Send a career advice request to the backend
 * @param {string} userMessage - The user's question or request
 * @param {string} sessionId - Optional session ID for conversation tracking
 * @returns {Promise<string>} The career advice response
 */
export const getCareerAdvice = async (userMessage, sessionId = null) => {
  try {
    const response = await apiClient.post('/chat/career', {
      message: userMessage,
      sessionId: sessionId
    });
    
    return response.data?.response || response.data?.text || response.data;
  } catch (error) {
    console.error('Error getting career advice:', error);
    throw new Error(error.response?.data?.message || 'Failed to get career advice. Please try again.');
  }
};

/**
 * Send an emotional support request to the backend
 * @param {string} userMessage - The user's message
 * @param {string} sessionId - Optional session ID for conversation tracking
 * @returns {Promise<string>} The emotional support response
 */
export const getEmotionalSupport = async (userMessage, sessionId = null) => {
  try {
    const response = await apiClient.post('/chat/emotional', {
      message: userMessage,
      sessionId: sessionId
    });
    
    return response.data?.response || response.data?.text || response.data;
  } catch (error) {
    console.error('Error getting emotional support:', error);
    throw new Error(error.response?.data?.message || 'Failed to get emotional support. Please try again.');
  }
};

/**
 * Generate a career roadmap for the user
 * @returns {Promise<Object>} The career roadmap object
 */
export const generateCareerRoadmap = async () => {
  try {
    const response = await apiClient.post('/chat/roadmap/generate');
    return response.data || {};
  } catch (error) {
    console.error('Error generating career roadmap:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate roadmap. Please try again.');
  }
};

/**
 * Analyze burnout risk based on recent moods
 * @returns {Promise<string>} The burnout risk analysis
 */
export const analyzeBurnoutRisk = async () => {
  try {
    const response = await apiClient.get('/chat/mood/burnout-analysis');
    return response.data?.analysis || response.data;
  } catch (error) {
    console.error('Error analyzing burnout risk:', error);
    throw new Error(error.response?.data?.message || 'Failed to analyze burnout risk. Please try again.');
  }
};
