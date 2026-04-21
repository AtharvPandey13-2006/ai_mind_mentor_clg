import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Award, Zap, Flame, Heart, Brain } from 'lucide-react';
import StatCard3D, { LevelBadge } from './StatCard3D';

const DashboardStats = ({ moodStats, burnoutAnalysis, user, onTabChange }) => {
  const getBurnoutColor = (analysis) => {
    if (!analysis) return 'text-gray-600';
    const lower = analysis.toLowerCase();
    if (lower.includes('low')) return 'text-green-600';
    if (lower.includes('moderate')) return 'text-yellow-600';
    if (lower.includes('high')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatsIcon = (value, threshold = 5) => {
    if (value > threshold) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (value < threshold) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner - Enhanced with Animations */}
      <div className="card bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white relative overflow-hidden group animate-fade-in">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
        
        {/* Sparkle Effects */}
        <div className="absolute top-4 right-20 w-2 h-2 bg-white rounded-full animate-ping"></div>
        <div className="absolute bottom-10 right-40 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-20 right-60 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 animate-slide-up">
              <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">
                {new Date().getHours() < 12 ? '🌅 Good Morning' : new Date().getHours() < 18 ? '☀️ Good Afternoon' : '🌙 Good Evening'}, {user?.firstName}!
              </h2>
              <p className="text-white/95 text-xl font-medium drop-shadow-md">
                {user?.targetCareer ? 
                  `You're ${Math.floor((user?.totalXP || 0) / 10)}% closer to becoming a ${user.targetCareer}! 🚀` :
                  'Set your career goal in Profile to start tracking progress! 🎯'
                }
              </p>
            </div>
            <div className="text-right animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative group/level">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover/level:bg-white/30 transition-all"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 transform group-hover/level:scale-110 transition-transform duration-300">
                  <p className="text-white/90 text-sm mb-1 font-semibold">Current Level</p>
                  <p className="text-6xl font-black drop-shadow-2xl">{Math.floor((user?.totalXP || 0) / 100) + 1}</p>
                </div>
              </div>
            </div>
          </div>
          {(user?.currentStreak || 0) > 0 && (
            <div className="flex items-center gap-3 bg-white/25 backdrop-blur-md rounded-xl px-5 py-3 w-fit border border-white/30 shadow-lg hover:bg-white/30 hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <span className="text-3xl fire-emoji">🔥</span>
              <p className="font-bold text-lg drop-shadow-md">
                {(user?.currentStreak || 0) > 7 ? 'Amazing! ' : (user?.currentStreak || 0) > 3 ? 'Great job! ' : ''}
                {user?.currentStreak || 0} day streak - keep it going!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Enhanced 3D Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Level Badge */}
        <LevelBadge 
          level={Math.floor((user?.totalXP || 0) / 100) + 1}
          xp={(user?.totalXP || 0) % 100}
          nextLevelXP={100}
        />
        
        {/* XP Card */}
        <StatCard3D
          icon={Zap}
          value={user?.totalXP || 0}
          label="Total XP"
          color="#3b82f6"
          glow={true}
        />
        
        {/* Streak Card */}
        <StatCard3D
          icon={Flame}
          value={`${user?.currentStreak || 0}`}
          label="Day Streak 🔥"
          color="#f97316"
          glow={true}
        />
        
        {/* Achievements */}
        <StatCard3D
          icon={Award}
          value={Math.floor((user?.totalXP || 0) / 50)}
          label="Achievements"
          color="#8b5cf6"
          glow={false}
        />

        {/* Career Info - Enhanced */}
        <div className="card group hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Career Path</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Current Role</p>
              <p className="text-lg font-bold text-gray-800">
                {user?.currentRole || '🎯 Not set yet'}
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500 rounded-full p-1 shadow-md">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Target Career</p>
              <p className="text-lg font-bold text-gray-800">
                {user?.targetCareer || '🚀 Set your goal!'}
              </p>
            </div>
          </div>
        </div>

        {/* Burnout Analysis - Enhanced */}
        <div className="card group hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Burnout Risk</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          {burnoutAnalysis?.analysis ? (
            <div>
              <div className="relative mb-4">
                <div className={`inline-block px-4 py-2 rounded-xl font-black text-3xl ${getBurnoutColor(burnoutAnalysis.analysis)} bg-gradient-to-r from-gray-50 to-gray-100 shadow-md`}>
                  {burnoutAnalysis.analysis?.split(' ')[0] === 'No' ? '📊 No Data' : 
                   burnoutAnalysis.analysis?.split(' ')[0] + (burnoutAnalysis.analysis?.split(' ')[1] === 'Risk' ? ' Risk' : '')}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed font-medium">
                {burnoutAnalysis.analysis?.substring(burnoutAnalysis.analysis.indexOf('-') + 1).trim() || 
                 'Log your mood to get personalized insights'}
              </p>
              {/* Enhanced Risk Meter */}
              {!burnoutAnalysis.analysis?.includes('No Data') && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <span className="text-green-600">Low</span>
                    <span className="text-yellow-600">Moderate</span>
                    <span className="text-red-600">High</span>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 relative ${
                        burnoutAnalysis.analysis?.toLowerCase().includes('high') ? 'bg-gradient-to-r from-red-400 to-red-600 w-full' :
                        burnoutAnalysis.analysis?.toLowerCase().includes('moderate') ? 'bg-gradient-to-r from-yellow-400 to-orange-500 w-2/3' :
                        'bg-gradient-to-r from-green-400 to-green-600 w-1/3'
                      }`}
                      style={{ boxShadow: '0 0 10px currentColor' }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-6xl mb-3 animate-bounce">📊</div>
              <p className="text-gray-700 font-semibold mb-2">Not Available</p>
              <p className="text-sm text-gray-500 leading-relaxed">Start logging your daily mood to unlock burnout risk tracking and insights</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Mood Stats - Enhanced */}
      {moodStats && (
        <div className="card hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-gray-800">This Week's Wellness Stats</h3>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg">
              <Heart className="w-5 h-5 animate-pulse" />
              <span className="font-bold">{moodStats.entriesCount} Entries</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Stress Card */}
            <div className="group p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-red-600 uppercase tracking-wide">Average Stress</p>
                <div className="p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform">
                  {getStatsIcon(moodStats.avgStress, 5)}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-5xl font-black text-red-600">
                  {moodStats.avgStress?.toFixed(1) || 0}
                </p>
                <p className="text-xl text-gray-500 font-bold">/10</p>
              </div>
              <div className="relative mt-3 bg-red-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-700 progress-bar relative"
                  style={{ width: `${(moodStats.avgStress / 10) * 100}%`, boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>
            </div>

            {/* Energy Card */}
            <div className="group p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Average Energy</p>
                <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                  {getStatsIcon(moodStats.avgEnergy, 5)}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-5xl font-black text-green-600">
                  {moodStats.avgEnergy?.toFixed(1) || 0}
                </p>
                <p className="text-xl text-gray-500 font-bold">/10</p>
              </div>
              <div className="relative mt-3 bg-green-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-700 progress-bar relative"
                  style={{ width: `${(moodStats.avgEnergy / 10) * 100}%`, boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>
            </div>

            {/* Productivity Card */}
            <div className="group p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">Average Productivity</p>
                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  {getStatsIcon(moodStats.avgProductivity, 5)}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-5xl font-black text-blue-600">
                  {moodStats.avgProductivity?.toFixed(1) || 0}
                </p>
                <p className="text-xl text-gray-500 font-bold">/10</p>
              </div>
              <div className="relative mt-3 bg-blue-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-700 progress-bar relative"
                  style={{ width: `${(moodStats.avgProductivity / 10) * 100}%`, boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg text-white animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💪</span>
                </div>
                <p className="text-sm font-bold">
                  Amazing progress! You've logged {moodStats.entriesCount} mood entries this week. Keep tracking your wellness journey!
                </p>
              </div>
            </div>
            
            {/* Personalized Insights - Enhanced */}
            {moodStats.avgStress > 7 && (
              <div className="group p-5 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl hover:shadow-xl transition-all duration-300 animate-slide-up">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div>
                    <p className="font-black text-red-800 mb-1">High Stress Detected!</p>
                    <p className="text-sm text-red-700 leading-relaxed">
                      Consider taking breaks and talking to our Emotional Support companion. Your well-being matters!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {moodStats.avgEnergy < 4 && (
              <div className="group p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-2xl hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-xl">🔋</span>
                  </div>
                  <div>
                    <p className="font-black text-yellow-800 mb-1">Low Energy Levels</p>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                      Make sure you're getting enough rest and staying active! Small steps make a big difference.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {moodStats.avgProductivity > 7 && moodStats.avgEnergy > 7 && (
              <div className="group p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform animate-bounce">
                    <span className="text-xl">🌟</span>
                  </div>
                  <div>
                    <p className="font-black text-green-800 mb-1">You're On Fire!</p>
                    <p className="text-sm text-green-700 leading-relaxed">
                      Your productivity and energy are excellent - keep up the amazing momentum! You're crushing it! 🚀
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions - Enhanced with Hover Effects */}
      <div className="card hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-800">Quick Actions</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <button
            onClick={() => onTabChange('career')}
            className="group relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 hover:border-blue-400 transition-all duration-300 cursor-pointer text-left overflow-hidden hover:shadow-xl hover:-translate-y-2 transform"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full opacity-10 -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all">
                  🎯
                </div>
                <h4 className="font-black text-blue-800 text-lg">Get Career Advice</h4>
              </div>
              <p className="text-sm text-blue-600 font-medium">Ask AI mentor about your career path and growth opportunities</p>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('emotional')}
            className="group relative p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-100 hover:border-pink-400 transition-all duration-300 cursor-pointer text-left overflow-hidden hover:shadow-xl hover:-translate-y-2 transform"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-400 rounded-full opacity-10 -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all animate-pulse">
                  💙
                </div>
                <h4 className="font-black text-pink-800 text-lg">Talk About Feelings</h4>
              </div>
              <p className="text-sm text-pink-600 font-medium">Share your emotions with AI companion for support and guidance</p>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('mood')}
            className="group relative p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all duration-300 cursor-pointer text-left overflow-hidden hover:shadow-xl hover:-translate-y-2 transform"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400 rounded-full opacity-10 -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all">
                  📝
                </div>
                <h4 className="font-black text-purple-800 text-lg">Log Your Mood</h4>
              </div>
              <p className="text-sm text-purple-600 font-medium">Track how you're feeling today and build healthy habits</p>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('roadmap')}
            className="group relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 hover:border-green-400 transition-all duration-300 cursor-pointer text-left overflow-hidden hover:shadow-xl hover:-translate-y-2 transform"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-400 rounded-full opacity-10 -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all">
                  🚀
                </div>
                <h4 className="font-black text-green-800 text-lg">View Roadmap</h4>
              </div>
              <p className="text-sm text-green-600 font-medium">Check your personalized career plan and milestones</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
