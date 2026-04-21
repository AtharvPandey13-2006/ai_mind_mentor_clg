import React from 'react';
import { Trophy, Flame, Star, Zap } from 'lucide-react';

const StatCard3D = ({ icon: Icon, value, label, color, glow }) => {
  return (
    <div 
      className="card card-tilt relative overflow-hidden group cursor-pointer"
      style={{ 
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderColor: `${color}30`
      }}
    >
      {/* Animated Background Orb */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />
      
      {/* Icon with Glow */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: `${color}` }}>
            {label}
          </p>
          <p 
            className="text-4xl font-bold mt-2 badge-shine"
            style={{ 
              color: color,
              textShadow: glow ? `0 0 20px ${color}80, 0 0 40px ${color}40` : 'none'
            }}
          >
            {value}
          </p>
        </div>
        
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
          style={{ 
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            boxShadow: `0 10px 30px ${color}40`
          }}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000" />
    </div>
  );
};

export const LevelBadge = ({ level, xp, nextLevelXP }) => {
  const progress = (xp / nextLevelXP) * 100;
  
  return (
    <div className="card card-tilt bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white relative overflow-hidden">
      {/* Animated Stars */}
      <div className="absolute top-2 right-2 animate-pulse">
        <Star className="w-4 h-4 fill-white" />
      </div>
      <div className="absolute bottom-2 left-2 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <Star className="w-3 h-3 fill-white opacity-70" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white/90">Your Level</p>
            <p className="text-5xl font-black mt-1" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
              {level}
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1 text-white/90">
            <span>{xp} XP</span>
            <span>{nextLevelXP} XP</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden progress-bar">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 10px rgba(255,255,255,0.8)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard3D;
