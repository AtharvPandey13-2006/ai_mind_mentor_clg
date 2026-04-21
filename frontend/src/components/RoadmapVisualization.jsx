import React, { useState } from 'react';
import { CheckCircle, Circle, Lock, MapPin, Rocket, Flag, ArrowRight, Star, Trophy, Award, Target, Sparkles } from 'lucide-react';

const RoadmapVisualization = ({ roadmap, parsedRoadmap }) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activePhase, setActivePhase] = useState(0);

  const toggleStepCompletion = (phaseIndex) => {
    if (completedSteps.includes(phaseIndex)) {
      setCompletedSteps(completedSteps.filter(i => i !== phaseIndex));
    } else {
      setCompletedSteps([...completedSteps, phaseIndex]);
    }
  };

  const getPhaseIcon = (index, isCompleted, isActive) => {
    if (index === 0) return <Rocket className="w-6 h-6" />;
    if (isCompleted) return <CheckCircle className="w-6 h-6" />;
    if (isActive) return <Star className="w-6 h-6 animate-pulse" />;
    return <Lock className="w-6 h-6" />;
  };

  const getPhaseColor = (index, isCompleted, isActive) => {
    if (isCompleted) return { bg: 'from-green-400 to-emerald-500', border: 'border-green-500', text: 'text-green-600' };
    if (isActive) return { bg: 'from-blue-500 to-purple-600', border: 'border-blue-500', text: 'text-blue-600' };
    return { bg: 'from-gray-400 to-gray-500', border: 'border-gray-400', text: 'text-gray-400' };
  };

  // If parsedRoadmap has phases, use them; otherwise create generic phases
  const phases = parsedRoadmap?.phases || [
    { title: 'Foundation', description: 'Build your base knowledge' },
    { title: 'Intermediate', description: 'Develop core skills' },
    { title: 'Advanced', description: 'Master advanced concepts' },
    { title: 'Expert', description: 'Become an industry expert' },
  ];

  const progressPercentage = (completedSteps.length / phases.length) * 100;

  return (
    <div className="space-y-8">
      {/* Overall Progress Header with Enhanced Personalization */}
      <div className="card bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                Your Career Journey
              </h3>
              <p className="text-white/90 text-lg">
                {roadmap?.careerPath ? (
                  <>Becoming a <span className="font-bold underline">{roadmap.careerPath}</span></>
                ) : 'Your personalized career roadmap'}
              </p>
              {completedSteps.length > 0 && (
                <p className="text-white/80 text-sm mt-2">
                  {completedSteps.length === phases.length ? '🎉 Congratulations! All phases completed!' :
                   completedSteps.length > phases.length / 2 ? '💪 You\'re over halfway there!' :
                   '🚀 Great start! Keep pushing forward!'}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <Star className="w-8 h-8 text-yellow-300" />
                <div className="text-5xl font-black">{Math.round(progressPercentage)}%</div>
              </div>
              <p className="text-sm text-white/90 font-semibold">{completedSteps.length} / {phases.length} phases completed</p>
              {phases.length - completedSteps.length > 0 && (
                <p className="text-xs text-white/70 mt-1">{phases.length - completedSteps.length} phases remaining</p>
              )}
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="h-6 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/30 shadow-lg">
              <div 
                className="h-full bg-gradient-to-r from-white via-yellow-200 to-green-300 rounded-full transition-all duration-1000 progress-bar relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 10 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-purple-900">
                    {Math.round(progressPercentage)}%
                  </div>
                )}
              </div>
            </div>
            {completedSteps.length === phases.length && (
              <div className="flex items-center justify-center gap-2 p-3 bg-white/30 rounded-lg backdrop-blur-sm animate-bounce">
                <Award className="w-5 h-5" />
                <span className="font-bold">Achievement Unlocked: Roadmap Master! 🏆</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Journey Path */}
      <div className="card relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.95) 100%)' }}>
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold gradient-text">Visual Roadmap</h3>
        </div>

        {/* Journey Path Visualization */}
        <div className="relative">
          {/* Connecting Path Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 via-pink-200 to-orange-200" style={{ top: '2rem', bottom: '2rem' }}></div>
          
          {/* Progress Line */}
          <div 
            className="absolute left-8 top-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500 transition-all duration-1000"
            style={{ 
              top: '2rem',
              height: `${(completedSteps.length / phases.length) * 100}%`,
              maxHeight: 'calc(100% - 4rem)'
            }}
          />

          {/* Phase Nodes */}
          <div className="space-y-8">
            {phases.map((phase, index) => {
              const isCompleted = completedSteps.includes(index);
              const isActive = index === activePhase;
              const isLocked = !isCompleted && index > 0 && !completedSteps.includes(index - 1);
              const colors = getPhaseColor(index, isCompleted, isActive);

              return (
                <div 
                  key={index}
                  className="relative pl-20 group"
                  onMouseEnter={() => !isLocked && setActivePhase(index)}
                >
                  {/* Node Circle */}
                  <div className="absolute left-0 top-0">
                    <button
                      onClick={() => !isLocked && toggleStepCompletion(index)}
                      disabled={isLocked}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
                      } bg-gradient-to-br ${colors.bg} border-4 ${colors.border} relative z-10`}
                    >
                      <div className="text-white">
                        {getPhaseIcon(index, isCompleted, isActive)}
                      </div>
                      
                      {/* Pulse Effect for Active */}
                      {isActive && !isCompleted && (
                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                      )}
                    </button>
                    
                    {/* Phase Number Badge */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 ${colors.border} flex items-center justify-center text-xs font-bold ${colors.text} shadow-md z-20`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Phase Content Card */}
                  <div 
                    className={`card card-tilt transition-all duration-300 ${
                      isActive ? 'scale-105 shadow-2xl' : 'scale-100'
                    } ${isCompleted ? 'bg-green-50/80' : isActive ? 'bg-blue-50/80' : 'bg-white/60'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`text-xl font-bold ${isCompleted ? 'text-green-700' : isActive ? 'gradient-text' : 'text-gray-700'}`}>
                            {phase.title || `Phase ${index + 1}`}
                          </h4>
                          {isCompleted && (
                            <span className="success-badge px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                        
                        {phase.duration && (
                          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                            <span>⏱️</span>
                            <span className="font-medium">{phase.duration}</span>
                          </p>
                        )}
                        
                        <p className="text-gray-700 mb-4">{phase.description}</p>
                      </div>
                    </div>

                    {/* Goals */}
                    {phase.goals && phase.goals.length > 0 && (
                      <div className="mb-4 p-3 bg-white/80 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-600" />
                          Goals
                        </p>
                        <ul className="space-y-1">
                          {phase.goals.slice(0, 3).map((goal, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills */}
                    {phase.skills && phase.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          Key Skills ({phase.skills.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {phase.skills.slice(0, 5).map((skill, i) => (
                            <span 
                              key={i}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {phase.skills.length > 5 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{phase.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {phase.projects && phase.projects.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-orange-600" />
                          Projects
                        </p>
                        <ul className="space-y-1">
                          {phase.projects.slice(0, 3).map((project, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-orange-500 mt-0.5">▸</span>
                              <span>{project}</span>
                            </li>
                          ))}
                          {phase.projects.length > 3 && (
                            <li className="text-xs text-gray-500 italic ml-4">
                              +{phase.projects.length - 3} more projects...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Milestones Preview */}
                    {phase.milestones && phase.milestones.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Flag className="w-4 h-4 text-yellow-600" />
                          Milestones
                        </p>
                        <ul className="space-y-1">
                          {phase.milestones.slice(0, 2).map((milestone, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <Circle className="w-3 h-3 text-yellow-600 mt-0.5" />
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    {!isLocked && (
                      <button
                        onClick={() => toggleStepCompletion(index)}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          isCompleted
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Mark as Incomplete
                          </>
                        ) : (
                          <>
                            <Circle className="w-5 h-5" />
                            Mark as Complete
                          </>
                        )}
                      </button>
                    )}

                    {isLocked && (
                      <div className="bg-gray-100 py-2 px-4 rounded-lg text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Complete previous phase to unlock
                      </div>
                    )}
                  </div>

                  {/* Arrow between phases */}
                  {index < phases.length - 1 && (
                    <div className="absolute left-8 -bottom-4 z-0">
                      <ArrowRight className={`w-6 h-6 rotate-90 transition-colors ${
                        isCompleted ? 'text-purple-500' : 'text-gray-300'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Flag */}
            <div className="relative pl-20">
              <div className="absolute left-0 top-0">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br transition-all duration-300 ${
                  completedSteps.length === phases.length 
                    ? 'from-yellow-400 to-orange-500 animate-bounce' 
                    : 'from-gray-300 to-gray-400'
                }`}>
                  {completedSteps.length === phases.length ? (
                    <Trophy className="w-8 h-8 text-white" />
                  ) : (
                    <Flag className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>

              <div className={`card transition-all duration-300 ${
                completedSteps.length === phases.length 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400' 
                  : 'bg-gray-50'
              }`}>
                <h4 className={`text-xl font-bold mb-2 ${
                  completedSteps.length === phases.length ? 'gradient-text' : 'text-gray-600'
                }`}>
                  {completedSteps.length === phases.length ? '🎉 Journey Complete!' : 'Your Goal'}
                </h4>
                <p className="text-gray-700">
                  {completedSteps.length === phases.length 
                    ? `Congratulations! You've completed your journey to becoming a ${roadmap?.careerPath || 'professional'}!`
                    : `Continue your journey to become a successful ${roadmap?.careerPath || 'professional'}`
                  }
                </p>
                
                {completedSteps.length === phases.length && (
                  <div className="mt-4 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-400 badge-shine">
                    <p className="text-center font-bold text-yellow-800 text-lg">
                      🏆 Achievement Unlocked: Roadmap Master! 🏆
                    </p>
                    <p className="text-center text-yellow-700 text-sm mt-1">
                      +100 XP Bonus!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card text-center" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-2xl font-bold text-purple-600">{phases.length}</p>
          <p className="text-sm text-gray-600">Total Phases</p>
        </div>
        
        <div className="card text-center" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
          <div className="text-3xl mb-2">✅</div>
          <p className="text-2xl font-bold text-green-600">{completedSteps.length}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        
        <div className="card text-center" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
          <div className="text-3xl mb-2">🔒</div>
          <p className="text-2xl font-bold text-orange-600">{phases.length - completedSteps.length}</p>
          <p className="text-sm text-gray-600">Remaining</p>
        </div>
      </div>
    </div>
  );
};

export default RoadmapVisualization;
