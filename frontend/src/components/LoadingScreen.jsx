import React from 'react';
import { Brain, Heart } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 3s ease infinite'
    }}>
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative inline-block mb-8">
          <div className="absolute -inset-4 bg-white/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <Brain className="w-16 h-16 text-blue-600" />
              <Heart className="w-10 h-10 text-pink-500 absolute -bottom-2 -right-2 animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-4xl font-bold text-white mb-4 neon-glow">
          MindMentor
        </h2>
        <p className="text-white/90 text-lg mb-8">{message}</p>
        
        {/* Loading Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              style={{
                animation: 'bounce 1.4s infinite',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
