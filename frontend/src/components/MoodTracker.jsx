import React, { useState, useEffect } from 'react';
import { moodAPI } from '../services/api';
import { Smile, Meh, Frown, AlertTriangle, X, Heart, Check } from 'lucide-react';
import FloatingXP from './FloatingXP';

const MoodTracker = ({ onMoodLogged }) => {
  const [showForm, setShowForm] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [xpFloats, setXpFloats] = useState([]);
  const [formData, setFormData] = useState({
    mood: '',
    moodScore: 5,
    stressLevel: 5,
    energyLevel: 5,
    productivityLevel: 5,
    note: '',
    activities: '',
  });

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const response = await moodAPI.getMoodHistory();
      setMoodHistory(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error loading mood history:', error.response?.data?.message || error.message);
      }
    }
  };

  const moodOptions = [
    { value: 'happy', label: 'Happy', icon: '😊', color: 'bg-green-100 text-green-600', Icon: Smile },
    { value: 'neutral', label: 'Neutral', icon: '😐', color: 'bg-gray-100 text-gray-600', Icon: Meh },
    { value: 'stressed', label: 'Stressed', icon: '😰', color: 'bg-yellow-100 text-yellow-600', Icon: Frown },
    { value: 'anxious', label: 'Anxious', icon: '😟', color: 'bg-orange-100 text-orange-600', Icon: AlertTriangle },
    { value: 'burned_out', label: 'Burned Out', icon: '😫', color: 'bg-red-100 text-red-600', Icon: X },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await moodAPI.logMood(formData);
      
      // Show XP animation
      const buttonRect = e.target.getBoundingClientRect();
      const xpFloat = {
        id: Date.now(),
        amount: 5,
        position: { x: buttonRect.left + buttonRect.width / 2, y: buttonRect.top }
      };
      setXpFloats(prev => [...prev, xpFloat]);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      setShowForm(false);
      setFormData({
        mood: '',
        moodScore: 5,
        stressLevel: 5,
        energyLevel: 5,
        productivityLevel: 5,
        note: '',
        activities: '',
      });
      loadMoodHistory();
      if (onMoodLogged) onMoodLogged();
    } catch (error) {
      console.error('Error logging mood:', error.response?.data?.message || error.message);
    }
  };

  const getMoodColor = (mood) => {
    const option = moodOptions.find(m => m.value === mood);
    return option ? option.color : 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* XP Floating Animations */}
      {xpFloats.map(xp => (
        <FloatingXP
          key={xp.id}
          amount={xp.amount}
          position={xp.position}
          onComplete={() => setXpFloats(prev => prev.filter(x => x.id !== xp.id))}
        />
      ))}
      
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-8 z-50 success-badge">
          <div className="card bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 shadow-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Mood Logged! 🎉</p>
              <p className="text-sm text-white/90">+5 XP earned</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Log Mood Button */}
      {!showForm && (
        <div className="card text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
          <div className="relative z-10">
            <div className="mb-4">
              <h2 className="text-3xl font-bold gradient-text mb-2">How are you feeling today?</h2>
              <p className="text-gray-600">Take a moment to check in with yourself 💙</p>
            </div>
            <div className="flex justify-center gap-3 mb-6">
              {moodOptions.slice(0, 3).map(option => (
                <div key={option.value} className="text-4xl animate-bounce" style={{ animationDelay: `${Math.random() * 0.5}s` }}>
                  {option.icon}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-lg px-8 py-4"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Log Your Mood
            </button>
            {moodHistory.length > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                You've logged {moodHistory.length} mood {moodHistory.length === 1 ? 'entry' : 'entries'} so far! 🎉
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mood Form */}
      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Log Your Mood</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-4 text-lg">
                ✨ How do you feel?
              </label>
              <div className="grid grid-cols-5 gap-4">
                {moodOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: option.value })}
                    className={`p-5 rounded-2xl text-center transition-all duration-300 transform hover:scale-110 hover:shadow-xl animate-fadeIn ${
                      formData.mood === option.value
                        ? `${option.color} ring-4 ring-offset-2 shadow-2xl scale-110 animate-bounceIn`
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`text-4xl mb-2 ${formData.mood === option.value ? 'animate-bounce' : ''}`}>
                      {option.icon}
                    </div>
                    <div className="text-xs font-bold">{option.label}</div>
                    {formData.mood === option.value && (
                      <div className="mt-2">
                        <Check className="w-5 h-5 mx-auto text-current animate-bounceIn" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Sliders */}
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-gray-800">
                    😊 Mood Score
                  </label>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                    {formData.moodScore}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.moodScore}
                  onChange={(e) => setFormData({ ...formData, moodScore: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${formData.moodScore * 10}%, #e5e7eb ${formData.moodScore * 10}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-gray-800">
                    😰 Stress Level
                  </label>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
                    {formData.stressLevel}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stressLevel}
                  onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${formData.stressLevel * 10}%, #e5e7eb ${formData.stressLevel * 10}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-gray-800">
                    ⚡ Energy Level
                  </label>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                    {formData.energyLevel}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energyLevel}
                  onChange={(e) => setFormData({ ...formData, energyLevel: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${formData.energyLevel * 10}%, #e5e7eb ${formData.energyLevel * 10}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-gray-800">
                    🎯 Productivity Level
                  </label>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">
                    {formData.productivityLevel}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.productivityLevel}
                  onChange={(e) => setFormData({ ...formData, productivityLevel: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${formData.productivityLevel * 10}%, #e5e7eb ${formData.productivityLevel * 10}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>

            {/* Text Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What were you doing?
              </label>
              <input
                type="text"
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                className="input-field"
                placeholder="e.g., Coding, Studying, Meeting..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any notes? (Optional)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="What's on your mind..."
              />
            </div>

            <button
              type="submit"
              disabled={!formData.mood}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Mood Entry
            </button>
          </form>
        </div>
      )}

      {/* Mood History */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Mood History</h3>
        
        {moodHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No mood entries yet. Start tracking your emotional wellbeing!
          </p>
        ) : (
          <div className="space-y-3">
            {moodHistory.slice(0, 10).map((entry) => (
              <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`mood-badge ${getMoodColor(entry.mood)}`}>
                      {entry.mood.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{formatDate(entry.timestamp)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">Score: {entry.moodScore}/10</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                  <div>Stress: {entry.stressLevel}/10</div>
                  <div>Energy: {entry.energyLevel}/10</div>
                  <div>Productivity: {entry.productivityLevel}/10</div>
                </div>
                
                {entry.activities && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Activity:</span> {entry.activities}
                  </p>
                )}
                
                {entry.note && (
                  <p className="text-sm text-gray-600 italic">"{entry.note}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
