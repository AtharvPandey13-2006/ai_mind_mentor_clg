import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Heart, Target, Zap, BookOpen } from 'lucide-react';

const PersonalizedTips = ({ user, moodStats, burnoutAnalysis }) => {
  const [currentTip, setCurrentTip] = useState(0);

  const generateTips = () => {
    const tips = [];

    // Career-based tips
    if (user?.targetCareer) {
      tips.push({
        icon: Target,
        title: '🎯 Career Focus',
        message: `Stay focused on your goal to become a ${user.targetCareer}. Check your roadmap daily!`,
        color: 'from-blue-500 via-purple-500 to-purple-600',
        bgColor: 'from-blue-50 to-purple-50',
        action: '📍 View Roadmap'
      });
    }

    // XP and streak tips
    if ((user?.currentStreak || 0) > 0) {
      tips.push({
        icon: Zap,
        title: '⚡ Keep the Momentum!',
        message: `You're on a ${user.currentStreak} day streak! Log your mood today to keep it going. 🔥`,
        color: 'from-orange-500 via-red-500 to-red-600',
        bgColor: 'from-orange-50 to-red-50',
        action: '📝 Log Mood'
      });
    }

    // Mood-based tips
    if (moodStats?.avgStress > 7) {
      tips.push({
        icon: Heart,
        title: '💖 Take a Break',
        message: 'Your stress levels are high. Consider talking to our Emotional Support companion or taking a short walk. 🌸',
        color: 'from-pink-500 via-red-400 to-red-500',
        bgColor: 'from-pink-50 to-red-50',
        action: '🤗 Get Support'
      });
    }

    if (moodStats?.avgEnergy < 4) {
      tips.push({
        icon: Lightbulb,
        title: '💡 Boost Your Energy',
        message: 'Low energy detected. Ensure you\'re getting enough sleep, staying hydrated, and eating well. 💪',
        color: 'from-yellow-500 via-orange-400 to-orange-500',
        bgColor: 'from-yellow-50 to-orange-50',
        action: '📊 Track Mood'
      });
    }

    // Productivity tips
    if (moodStats?.avgProductivity > 7) {
      tips.push({
        icon: TrendingUp,
        title: '🚀 You\'re on Fire!',
        message: 'Your productivity is excellent! Keep this momentum and tackle that challenging project. 🎉',
        color: 'from-green-500 via-emerald-500 to-emerald-600',
        bgColor: 'from-green-50 to-emerald-50',
        action: '🎯 Start Project'
      });
    }

    // Learning tips
    if ((user?.skills?.length || 0) < 5) {
      tips.push({
        icon: BookOpen,
        title: '📚 Expand Your Skills',
        message: 'Add more skills to your profile to get personalized learning recommendations! ✨',
        color: 'from-indigo-500 via-purple-500 to-purple-600',
        bgColor: 'from-indigo-50 to-purple-50',
        action: '✏️ Update Profile'
      });
    }

    // Default tips if none match
    if (tips.length === 0) {
      tips.push({
        icon: Lightbulb,
        title: '✨ Welcome to MindMentor!',
        message: 'Start by setting your career goals and logging your daily mood to get personalized insights. 🚀',
        color: 'from-blue-500 via-indigo-500 to-purple-600',
        bgColor: 'from-blue-50 to-purple-50',
        action: '🎯 Get Started'
      });
    }

    return tips;
  };

  const tips = generateTips();

  useEffect(() => {
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tips.length]);

  const tip = tips[currentTip];
  const Icon = tip.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl animate-fadeIn">
      <div className={`absolute inset-0 bg-gradient-to-br ${tip.bgColor} opacity-40`}></div>
      <div className={`card relative overflow-hidden bg-gradient-to-r ${tip.color}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 -translate-y-20 animate-pulse blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 translate-y-16 animate-pulse blur-xl" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-white rounded-full -translate-x-14 -translate-y-14 animate-pulse blur-2xl" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 flex items-start gap-5">
          <div className="flex-shrink-0 w-16 h-16 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/60 shadow-2xl float-animation glow-effect">
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-lg">{tip.title}</h3>
            <p className="text-white/95 text-base mb-4 font-medium leading-relaxed drop-shadow">{tip.message}</p>
            
            {tip.action && (
              <button className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/60 rounded-full text-white font-bold transition-all duration-300 hover:scale-110 hover:shadow-xl">
                {tip.action}
              </button>
            )}
            
            {tips.length > 1 && (
              <div className="flex gap-2 mt-6">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTip(index)}
                    className={`h-2 rounded-full transition-all duration-500 shadow-md ${
                      index === currentTip ? 'w-12 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedTips;
