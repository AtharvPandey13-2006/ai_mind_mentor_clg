import React, { useState, useEffect } from 'react';
import { careerAPI } from '../services/api';
import { generateRoadmapWithGemini } from '../services/roadmapGenerator';
import { Target, MapPin, BookOpen, Code, Award, CheckCircle, Circle, Loader, Sparkles, Eye, List, Flag, AlertTriangle } from 'lucide-react';
import RoadmapVisualization from './RoadmapVisualization';
import RoadmapPreview from './RoadmapPreview';
import { useAuthStore } from '../store/authStore';

const CareerRoadmap = () => {
  const { user } = useAuthStore();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'detailed'
  const [showForm, setShowForm] = useState(false);
  const [useClientGeneration, setUseClientGeneration] = useState(false);
  const [formData, setFormData] = useState({
    targetCareer: '',
    currentRole: 'Beginner',
    currentLevel: 'Beginner',
    skills: []
  });

  useEffect(() => {
    loadRoadmap();
  }, []);

  useEffect(() => {
    if (roadmap) return;
    const auto = localStorage.getItem('roadmap_autogenerate');
    const prefillStr = localStorage.getItem('roadmap_prefill');
    if (auto === 'true' && prefillStr) {
      try {
        const prefill = JSON.parse(prefillStr);
        setFormData((prev) => ({ ...prev, ...prefill }));
        (async () => {
          setGenerating(true);
          try {
            const clientRoadmap = await generateRoadmapWithGemini(user, prefill);
            const roadmapData = {
              careerPath: prefill.targetCareer,
              currentLevel: prefill.currentLevel || 'Beginner',
              aiGeneratedRoadmap: clientRoadmap,
              completionPercentage: 0,
              createdAt: new Date().toISOString()
            };
            setRoadmap(roadmapData);
            setUseClientGeneration(true);
            careerAPI.generateRoadmap(prefill).catch(() => {});
          } catch (err) {
            console.error('Auto generation failed:', err);
          } finally {
            setGenerating(false);
            localStorage.removeItem('roadmap_autogenerate');
            localStorage.removeItem('roadmap_prefill');
          }
        })();
      } catch (e) {
        console.error('Invalid roadmap_prefill:', e);
        localStorage.removeItem('roadmap_autogenerate');
        localStorage.removeItem('roadmap_prefill');
      }
    }
  }, [roadmap, user]);

  const loadRoadmap = async () => {
    try {
      const response = await careerAPI.getRoadmap();
      const loadedRoadmap = response.data;
      
      // Check if the roadmap contains an error message (from previous failed generation)
      if (loadedRoadmap?.aiGeneratedRoadmap?.includes('apologize') || 
          loadedRoadmap?.aiGeneratedRoadmap?.includes('trouble connecting') ||
          loadedRoadmap?.aiGeneratedRoadmap?.includes('API may be temporarily unavailable')) {
        console.log('Roadmap contains error message, will need regeneration');
        setRoadmap(null); // Force user to regenerate
      } else {
        setRoadmap(loadedRoadmap);
      }
    } catch (error) {
      // If roadmap doesn't exist (404), that's normal - user hasn't created one yet
      if (error.response?.status === 404) {
        console.log('No roadmap found - user can create one');
      } else if (error.response?.status === 401) {
        console.error('Authentication error - please log in');
      } else {
        console.error('Error loading roadmap:', error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      // Use client-side generation directly (backend has connection issues)
      console.log('Generating roadmap with direct AI...');
      const clientRoadmap = await generateRoadmapWithGemini(user, formData);
      
      // Create roadmap object matching backend structure
      const roadmapData = {
        careerPath: formData.targetCareer,
        currentLevel: formData.currentLevel,
        aiGeneratedRoadmap: clientRoadmap,
        completionPercentage: 0,
        createdAt: new Date().toISOString()
      };
      
      setRoadmap(roadmapData);
      setUseClientGeneration(true);
      
      // Try to save to backend in background (don't wait for it)
      careerAPI.generateRoadmap(formData)
        .then(() => console.log('Successfully saved to backend'))
        .catch((error) => {
          console.log('Backend save failed (expected if server is having issues):', error.message);
        });
        
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      alert('Failed to generate roadmap. Please check your internet connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const parseRoadmap = (roadmapText) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(roadmapText);
      return parsed;
    } catch {
      // If not JSON, check if it's an error message
      if (roadmapText?.includes('apologize') || 
          roadmapText?.includes('trouble connecting') ||
          roadmapText?.includes('API may be temporarily unavailable')) {
        return { isError: true, description: roadmapText };
      }
      // Otherwise return as text sections
      return { description: roadmapText };
    }
  };

  const careerOptions = [
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'Mobile App Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Cloud Architect',
    'Cybersecurity Specialist',
    'UI/UX Designer',
    'Product Manager',
    'Other'
  ];

  if (loading) {
    return (
      <div className="card text-center py-12">
        <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-gray-600">Loading your roadmap...</p>
      </div>
    );
  }

  if (!roadmap) {
    if (!showForm) {
      return <RoadmapPreview onStartClick={() => setShowForm(true)} />;
    }

    return (
      <div className="card max-w-2xl mx-auto card-tilt" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Generate Your Career Roadmap</h2>
          <p className="text-gray-600 text-lg">Get a personalized AI-powered career development plan</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Career Path
            </label>
            <select
              value={formData.targetCareer}
              onChange={(e) => setFormData({ ...formData, targetCareer: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select your target career</option>
              {careerOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Level
            </label>
            <select
              value={formData.currentLevel}
              onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
              className="input-field"
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={generating || !formData.targetCareer}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Generating Your Roadmap...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate AI Roadmap
              </span>
            )}
          </button>
        </form>
        
        <button
          onClick={() => setShowForm(false)}
          className="w-full btn-secondary text-center"
        >
          Back to Preview
        </button>
      </div>
    );
  }

  const parsedRoadmap = parseRoadmap(roadmap.aiGeneratedRoadmap);

  // If roadmap contains error, show regeneration option
  if (parsedRoadmap.isError) {
    return (
      <div className="space-y-6">
        <div className="card bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Roadmap Needs Regeneration</h2>
              <p className="text-white/90 mb-4">
                Your previous roadmap generation encountered an issue. Let's create a fresh, personalized roadmap for you!
              </p>
              <button
                onClick={() => setRoadmap(null)}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate New Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        {useClientGeneration && (
          <div className="mb-4 p-3 bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-200" />
            <p className="text-sm text-yellow-100">
              ✨ Generated with direct AI assistance - Your personalized roadmap is ready!
            </p>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">Your Career Roadmap</h2>
            <p className="text-blue-100 mb-4">{roadmap.careerPath} - {roadmap.currentLevel}</p>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm">Progress</p>
                <p className="text-2xl font-bold">{roadmap.completionPercentage}%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm">Created</p>
                <p className="text-sm font-medium">
                  {new Date(roadmap.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* View Toggle */}
            <div className="flex gap-2 bg-white/20 backdrop-blur-sm p-1 rounded-lg">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'visual' 
                    ? 'bg-white text-purple-600 shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Eye className="w-4 h-4" />
                Visual
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'detailed' 
                    ? 'bg-white text-purple-600 shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <List className="w-4 h-4" />
                Detailed
              </button>
            </div>
            
            <button
              onClick={() => setRoadmap(null)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Generate New
            </button>
          </div>
        </div>
      </div>

      {/* Visual Roadmap Journey */}
      {viewMode === 'visual' && (
        <RoadmapVisualization roadmap={roadmap} parsedRoadmap={parsedRoadmap} />
      )}

      {/* Detailed Roadmap Content */}
      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {/* Overview Section */}
          {parsedRoadmap.overview && (
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold gradient-text mb-2">Your Personalized Journey</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{parsedRoadmap.overview}</p>
                  {parsedRoadmap.totalDuration && (
                    <div className="mt-3 flex items-center gap-2 text-purple-700">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">Total Duration: {parsedRoadmap.totalDuration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Phases */}
          {typeof parsedRoadmap === 'object' && parsedRoadmap.phases ? (
            <div className="space-y-6">
              {parsedRoadmap.phases.map((phase, index) => (
                <div key={index} className="card bg-white border-l-4 border-purple-500 hover:shadow-2xl transition-shadow duration-300">
                  {/* Phase Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold gradient-text mb-1">{phase.title}</h3>
                        {phase.duration && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-lg">⏱️</span>
                            <span className="font-medium">{phase.duration}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                        Phase {index + 1}
                      </span>
                    </div>
                  </div>
                  
                  {/* Phase Description */}
                  {phase.description && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <p className="text-gray-800 text-lg leading-relaxed">{phase.description}</p>
                    </div>
                  )}

                  {/* Goals */}
                  {phase.goals && phase.goals.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-green-600" />
                        <span>Phase Goals</span>
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {phase.goals.map((goal, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills to Learn */}
                  {phase.skills && phase.skills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                        <Code className="w-5 h-5 text-blue-600" />
                        <span>Skills to Master ({phase.skills.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.skills.map((skill, i) => (
                          <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold border-2 border-blue-200 hover:shadow-md transition-shadow">
                            ✨ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Projects */}
                  {phase.projects && phase.projects.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                        <Award className="w-5 h-5 text-orange-600" />
                        <span>Recommended Projects</span>
                      </h4>
                      <div className="space-y-3">
                        {phase.projects.map((project, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-gray-700 flex-1">{project}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Learning Resources */}
                  {phase.resources && phase.resources.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <span>Learning Resources</span>
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {phase.resources.map((resource, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <span className="text-indigo-600 font-bold flex-shrink-0">📚</span>
                            <span className="text-gray-700">{resource}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  {phase.milestones && phase.milestones.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                        <Flag className="w-5 h-5 text-purple-600" />
                        <span>Key Milestones</span>
                      </h4>
                      <div className="space-y-2">
                        {phase.milestones.map((milestone, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <Circle className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700 font-medium">{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {phase.tips && phase.tips.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-yellow-600" />
                        <span>Pro Tips</span>
                      </h4>
                      <ul className="space-y-2">
                        {phase.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-yellow-600 font-bold">💡</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">
                {parsedRoadmap.description || roadmap.aiGeneratedRoadmap}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Tracker - Only show in detailed view */}
      {viewMode === 'detailed' && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Track Your Progress</h3>
          <div className="space-y-3">
            {['Complete Phase 1', 'Complete Phase 2', 'Complete Phase 3', 'Build Portfolio', 'Apply for Jobs'].map((milestone, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {index < Math.floor(roadmap.completionPercentage / 20) ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <span className={index < Math.floor(roadmap.completionPercentage / 20) ? 'text-gray-800 font-medium' : 'text-gray-600'}>
                  {milestone}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
