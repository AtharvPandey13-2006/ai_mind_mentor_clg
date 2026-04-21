import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/gemini';
import { Send, User, Heart, Smile, Cloud, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const EmotionalChat = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.firstName || 'there'} 💙\n\nI'm here to listen and support you through everything. This is a safe space where you can share how you're really feeling.\n\nRemember: It's okay to not be okay sometimes. What's on your mind today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { emoji: "😰", text: "I'm feeling stressed", color: "from-orange-100 to-red-100" },
    { emoji: "😔", text: "I'm feeling burned out", color: "from-purple-100 to-pink-100" },
    { emoji: "😟", text: "I'm anxious about work", color: "from-blue-100 to-indigo-100" },
    { emoji: "💪", text: "I need motivation", color: "from-green-100 to-emerald-100" },
  ];

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    setInput('');
    
    const userMsg = { 
      role: 'user', 
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const systemPrompt = `You are MindMentor's compassionate emotional support companion talking to ${user?.firstName || 'someone'}, a person navigating their career and life. Listen with deep empathy, validate their feelings genuinely, and offer gentle, thoughtful guidance. Suggest practical coping strategies like breathing exercises, breaks, journaling, or perspective shifts when appropriate. Be warm, non-judgmental, supportive, and understanding like a caring friend who truly listens. Use comforting emojis naturally. Keep responses heartfelt but concise.`;
      
      const aiResponse = await sendMessageToGemini(textToSend, systemPrompt);
      
      const assistantMsg = { 
        role: 'assistant', 
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Emotional chat error:', error);
      
      const errorMsg = { 
        role: 'assistant', 
        content: error.message || "I'm here for you 💙. Sometimes I have trouble connecting, but I care deeply about how you're feeling. Please try again, and know that you're not alone.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-4 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Emotional Support
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Here for you • A safe space to share
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full">
              <Heart className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-700">You're not alone</span>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden" style={{ height: '600px' }}>
          {/* Messages Area */}
          <div className="h-[calc(100%-140px)] overflow-y-auto p-6 space-y-4">
            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt.text)}
                    className={`flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r ${prompt.color} hover:shadow-md rounded-xl border border-pink-200 transition-all duration-300 group text-left`}
                  >
                    <span className="text-2xl">{prompt.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700">{prompt.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 items-start animate-fadeIn ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                    : 'bg-gradient-to-br from-pink-400 via-rose-400 to-red-400'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <Heart className="w-6 h-6 text-white" fill="white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col max-w-[75%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-5 py-3 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-tr-sm'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm'
                      : 'bg-gradient-to-r from-pink-50 to-rose-50 text-gray-800 border border-pink-100 rounded-tl-sm'
                  }`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 items-start animate-fadeIn">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 rounded-xl flex items-center justify-center shadow-md animate-pulse">
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-lg">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-bounce"></span>
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share how you're feeling... I'm here to listen 💙"
                className="flex-1 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-gray-800 placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalChat;
