import React, { useState, useEffect } from 'react';
import { careerAPI } from '../services/api';
import { User, Linkedin, Github, Code2, Save, Loader, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const ProfileEditor = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    currentRole: '',
    targetCareer: '',
    skills: [],
    linkedinProfile: '',
    githubProfile: '',
    leetcodeProfile: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await careerAPI.getProfile();
      if (response.data) {
        setFormData({
          currentRole: response.data.currentRole || '',
          targetCareer: response.data.targetCareer || '',
          skills: response.data.skills || [],
          linkedinProfile: response.data.linkedinProfile || '',
          githubProfile: response.data.githubProfile || '',
          leetcodeProfile: response.data.leetcodeProfile || ''
        });
      } else {
        // Use user data from auth store
        setFormData({
          currentRole: user?.currentRole || '',
          targetCareer: user?.targetCareer || '',
          skills: user?.skills || [],
          linkedinProfile: user?.linkedinProfile || '',
          githubProfile: user?.githubProfile || '',
          leetcodeProfile: user?.leetcodeProfile || ''
        });
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error loading profile:', error.response?.data?.message || error.message);
      }
      // Use user data from auth store as fallback
      setFormData({
        currentRole: user?.currentRole || '',
        targetCareer: user?.targetCareer || '',
        skills: user?.skills || [],
        linkedinProfile: user?.linkedinProfile || '',
        githubProfile: user?.githubProfile || '',
        leetcodeProfile: user?.leetcodeProfile || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    try {
      const response = await careerAPI.updateProfile(formData);
      
      // Update user in auth store
      setUser({
        ...user,
        ...formData
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error.response?.data?.message || error.message);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="card max-w-3xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-white shadow-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg glow-effect float-animation">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-black gradient-text mb-1">Edit Your Profile</h2>
          <p className="text-gray-600 font-medium">🚀 Update your career information and goals</p>
        </div>
        {saved && (
          <div className="animate-bounceIn">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-black text-gray-800">💼 Career Information</h3>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              📍 Current Role
            </label>
            <input
              type="text"
              value={formData.currentRole}
              onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
              className="input-field text-lg font-medium transition-all duration-300 focus:ring-4 focus:ring-blue-200 focus:scale-105"
              placeholder="e.g., Third Year CS Student, Junior Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              🎯 Target Career
            </label>
            <input
              type="text"
              value={formData.targetCareer}
              onChange={(e) => setFormData({ ...formData, targetCareer: e.target.value })}
              className="input-field text-lg font-medium transition-all duration-300 focus:ring-4 focus:ring-purple-200 focus:scale-105"
              placeholder="e.g., Backend Developer, Data Scientist"
              required
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-black text-gray-800">⚡ Skills</h3>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800">
              ✨ Add Your Skills
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                className="input-field flex-1 text-lg font-medium transition-all duration-300 focus:ring-4 focus:ring-green-200 focus:scale-105"
                placeholder="e.g., Java, React, MongoDB"
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-primary px-6 hover:scale-110 transition-transform shadow-lg"
              >
                ➕ Add
              </button>
            </div>
          </div>

          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="animate-bounceIn px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  ✨ {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="w-5 h-5 bg-blue-500 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors duration-300 hover:rotate-90"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social Profiles */}
        <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-black text-gray-800">🔗 Social Profiles</h3>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-600" />
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={formData.linkedinProfile}
              onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
              className="input-field text-lg font-medium transition-all duration-300 focus:ring-4 focus:ring-blue-200 focus:scale-105"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
              <Github className="w-5 h-5 text-gray-800" />
              GitHub Profile
            </label>
            <input
              type="url"
              value={formData.githubProfile}
              onChange={(e) => setFormData({ ...formData, githubProfile: e.target.value })}
              className="input-field text-lg font-medium transition-all duration-300 focus:ring-4 focus:ring-gray-200 focus:scale-105"
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-orange-600" />
              LeetCode Profile
            </label>
            <input
              type="url"
              value={formData.leetcodeProfile}
              onChange={(e) => setFormData({ ...formData, leetcodeProfile: e.target.value })}
              className="input-field text-lg font-medium transition-all duration-300 focus:ring-4 focus:ring-orange-200 focus:scale-105"
              placeholder="https://leetcode.com/yourusername"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-glow-xl transition-all duration-300 hover:scale-105 glow-effect"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-3">
                <Loader className="w-6 h-6 animate-spin" />
                Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center justify-center gap-3 animate-bounceIn">
                <CheckCircle className="w-6 h-6" />
                Saved! 🎉
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Save className="w-6 h-6" />
                💾 Save Profile
              </span>
            )}
          </button>
        </div>

        {saved && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-xl animate-bounceIn">
            <p className="text-green-800 text-center font-black text-xl">
              ✅ Profile updated successfully! 🎉
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileEditor;
