import React, { useState, useEffect } from 'react';
import { Award, Zap, Target, Heart, Trophy, Star } from 'lucide-react';

const AchievementBadge = ({ achievement, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    xp: Zap,
    streak: Trophy,
    mood: Heart,
    career: Target,
    chat: Star,
  };

  const Icon = icons[achievement.type] || Award;

  return (
    <div
      className={`fixed top-20 right-8 z-50 transform transition-all duration-500 ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="card bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white p-6 shadow-2xl border-2 border-white/30 badge-shine">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-bounce">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">🎉 Achievement Unlocked!</h3>
            <p className="text-white/90 font-medium">{achievement.title}</p>
            {achievement.xp && (
              <p className="text-sm text-white/80 mt-1">+{achievement.xp} XP</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const useAchievements = () => {
  const [achievement, setAchievement] = useState(null);

  const showAchievement = (data) => {
    setAchievement(data);
  };

  const closeAchievement = () => {
    setAchievement(null);
  };

  return {
    achievement,
    showAchievement,
    AchievementBadge: achievement ? (
      <AchievementBadge achievement={achievement} onClose={closeAchievement} />
    ) : null,
  };
};

export default AchievementBadge;
