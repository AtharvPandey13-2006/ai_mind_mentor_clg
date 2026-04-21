import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/gemini';
import { Send, Bot, User, Sparkles, Target, Rocket } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const CareerChat = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.firstName || 'there'}! 🧭 I'm your AI Career Mentor. I can help you with:\n\n✨ Career roadmaps & planning\n🎯 Skill development strategies\n🚀 Project ideas & portfolios\n📚 Learning resources\n\nWhat would you like to explore today?`,
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
    { icon: Target, text: "Create a learning roadmap", emoji: "🎯" },
    { icon: Rocket, text: "Project ideas for my portfolio", emoji: "🚀" },
    { icon: Sparkles, text: "Skills to learn this month", emoji: "✨" },
  ];

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    setInput('');
    
    // Add user message immediately
    const userMsg = { 
      role: 'user', 
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const systemPrompt = `You are MindMentor's AI Career Mentor helping ${user?.firstName || 'a professional'} ${user?.targetCareer ? `become a ${user.targetCareer}` : 'with their career journey'}. Be encouraging, specific, and actionable. Use emojis naturally. Provide clear roadmaps, concrete project ideas, specific learning resources, and daily challenges. Keep responses conversational, supportive, and structured with bullet points when helpful.`;
      
      const aiResponse = await sendMessageToGemini(textToSend, systemPrompt);
      
      const assistantMsg = { 
        role: 'assistant', 
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Career chat error:', error);
      
      const errorMsg = { 
        role: 'assistant', 
        content: error.message || "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 💙",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-4 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Mentor AI
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online • Ready to help you grow
              </p>
            </div>
            {user?.targetCareer && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">{user.targetCareer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden" style={{ height: '600px' }}>
          {/* Messages Area */}
          <div className="h-[calc(100%-140px)] overflow-y-auto p-6 space-y-4">
            {/* Quick Prompts - Show only at start */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSend(prompt.text)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border border-blue-200 transition-all duration-300 hover:shadow-md group"
                    >
                      <span className="text-lg">{prompt.emoji}</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{prompt.text}</span>
                    </button>
                  );
                })}
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
                    : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <Bot className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col max-w-[75%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-5 py-3 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-sm'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md animate-pulse">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-lg">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
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
                placeholder="Ask about career paths, skills, projects, or learning resources..."
                className="flex-1 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-gray-800 placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerChat;
