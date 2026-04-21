import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { moodAPI, careerAPI } from '../services/api';
import { 
  Brain, Heart, LogOut, MessageSquare, TrendingUp, 
  Sparkles, Target, BookOpen, Award, User, MapPin, Zap 
} from 'lucide-react';
import MoodTracker from '../components/MoodTracker';
import CareerChat from '../components/CareerChat';
import EmotionalChat from '../components/EmotionalChat';
import DashboardStats from '../components/DashboardStats';
import CareerRoadmap from '../components/CareerRoadmap';
import ProfileEditor from '../components/ProfileEditor';
import ParticleBackground from '../components/ParticleBackground';
import PersonalizedTips from '../components/PersonalizedTips';
import { useAchievements } from '../components/AchievementBadge';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/i18n';
import AccessibilityToggle from '../components/AccessibilityToggle';
import KnowledgeGraph from '../components/KnowledgeGraph';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'overview');
  const [moodStats, setMoodStats] = useState(null);
  const [burnoutAnalysis, setBurnoutAnalysis] = useState(null);
  const { AchievementBadge, showAchievement } = useAchievements();
  const { t } = useI18n();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.tab) setActiveTab(e.detail.tab);
    };
    window.addEventListener('navigateTo', handler);
    return () => window.removeEventListener('navigateTo', handler);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, burnoutRes] = await Promise.all([
        moodAPI.getMoodStats(),
        moodAPI.analyzeBurnout(),
      ]);
      setMoodStats(statsRes.data);
      setBurnoutAnalysis(burnoutRes.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error loading dashboard data:', error.response?.data?.message || error.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      {AchievementBadge}
      
      {/* Header */}
      <header className="card-tilt relative z-10 animate-slideFromBottom" style={{ 
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(30px)',
        borderBottom: '2px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2), 0 0 100px rgba(102, 126, 234, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative group float-animation">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-75 group-hover:opacity-100 blur-lg transition duration-500 glow-effect"></div>
                <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-white/50">
                  <Brain className="w-9 h-9 text-blue-600" />
                  <Heart className="w-5 h-5 text-pink-500 absolute -bottom-1 -right-1 animate-heartbeat" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-black gradient-text neon-glow flex items-center gap-2">
                  {t('app.title')}
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </h1>
                <p className="text-base font-bold mt-1" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                  {(() => {
                    const hour = new Date().getHours();
                    const greeting = hour < 12 ? `🌅 ${t('app.greetingMorning')}` : hour < 18 ? `☀️ ${t('app.greetingAfternoon')}` : `🌙 ${t('app.greetingEvening')}`;
                    return `${greeting}, ${user?.firstName || ''}! ${user?.targetCareer ? `🚀 Keep pushing towards becoming a ${user.targetCareer}!` : ''}`;
                  })()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <AccessibilityToggle />
              <div className="card text-center px-5 py-3 badge-shine animate-bounceIn glow-effect" style={{ background: 'rgba(255, 255, 255, 0.8)', animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{
                      background: `conic-gradient(from 0deg, #667eea 0%, #764ba2 ${((user?.totalXP || 0) % 100)}%, transparent ${((user?.totalXP || 0) % 100)}%)`
                    }}>
                      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                        <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce">
                      {Math.floor((user?.totalXP || 0) / 100)}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Level {Math.floor((user?.totalXP || 0) / 100)}</p>
                    <p className="text-xl font-black gradient-text">{user?.totalXP || 0} XP</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-500 progress-bar"
                        style={{ width: `${((user?.totalXP || 0) % 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card text-center px-5 py-3 badge-shine animate-bounceIn" style={{ background: 'rgba(255, 255, 255, 0.8)', animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-4xl fire-emoji animate-wiggle">{(user?.currentStreak || 0) > 7 ? '🔥' : (user?.currentStreak || 0) > 3 ? '✨' : '⭐'}</span>
                    {(user?.currentStreak || 0) > 7 && (
                      <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{t('dashboard.dayStreak')}</p>
                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{user?.currentStreak || 0}</p>
                    {(user?.currentStreak || 0) > 0 && (
                      <p className="text-xs font-bold text-orange-600 mt-0.5">
                        {(user?.currentStreak || 0) > 7 ? '🎯 On Fire!' : (user?.currentStreak || 0) > 3 ? '💪 Keep Going!' : '⭐ Good Start!'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title={t('app.logout')}
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10" style={{ 
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto relative">
            {[
              { id: 'overview', label: t('tabs.overview'), icon: Sparkles },
              { id: 'career', label: t('tabs.career'), icon: Target },
              { id: 'emotional', label: t('tabs.emotional'), icon: Heart },
              { id: 'mood', label: t('tabs.mood'), icon: BookOpen },
              { id: 'roadmap', label: t('tabs.roadmap'), icon: MapPin },
              { id: 'brain', label: t('tabs.brain'), icon: Brain },
              { id: 'profile', label: t('tabs.profile'), icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'gradient-text scale-105'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={activeTab === tab.id ? {
                  textShadow: '0 0 20px rgba(102, 126, 234, 0.3)'
                } : {}}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Personalized Tips - Show on all tabs */}
        {(moodStats || user?.targetCareer) && (
          <div className="mb-6">
            <PersonalizedTips 
              user={user} 
              moodStats={moodStats} 
              burnoutAnalysis={burnoutAnalysis} 
            />
          </div>
        )}
        
        {activeTab === 'overview' && (
          <DashboardStats 
            moodStats={moodStats} 
            burnoutAnalysis={burnoutAnalysis}
            user={user}
            onTabChange={setActiveTab}
          />
        )}
        
        {activeTab === 'career' && <CareerChat />}
        
        {activeTab === 'emotional' && <EmotionalChat />}
        
        {activeTab === 'mood' && <MoodTracker onMoodLogged={loadDashboardData} />}
        
        {activeTab === 'roadmap' && <CareerRoadmap />}
        
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'brain' && <KnowledgeGraph />}
      </main>
    </div>
  );
};

export default Dashboard;
