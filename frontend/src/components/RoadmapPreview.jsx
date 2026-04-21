import React from 'react';
import { Rocket, Code, Briefcase, Trophy, ArrowRight } from 'lucide-react';

const RoadmapPreview = ({ onStartClick }) => {
  const demoPhases = [
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Foundation',
      description: 'Learn the basics and build strong fundamentals',
      color: 'from-blue-400 to-blue-600',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Development',
      description: 'Master core skills through hands-on projects',
      color: 'from-purple-400 to-purple-600',
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Professional',
      description: 'Build portfolio and gain real experience',
      color: 'from-pink-400 to-pink-600',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Expert',
      description: 'Achieve mastery and career goals',
      color: 'from-orange-400 to-orange-600',
    },
  ];

  return (
    <div className="card card-tilt relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.95) 100%)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full translate-x-20 translate-y-20"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold gradient-text mb-3">
            Visualize Your Career Journey
          </h3>
          <p className="text-gray-600 text-lg">
            See your path from beginner to expert in an interactive timeline
          </p>
        </div>

        {/* Demo Journey */}
        <div className="relative py-8">
          {/* Path Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-orange-200 transform -translate-x-1/2 hidden md:block"></div>

          <div className="space-y-6">
            {demoPhases.map((phase, index) => (
              <div key={index} className="relative">
                <div className={`flex items-center gap-4 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Left/Right Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-left`}>
                    <div className="card bg-white/80 backdrop-blur-sm inline-block w-full md:w-auto md:max-w-xs">
                      <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-gray-800">
                        {index % 2 === 1 && <span>{phase.icon}</span>}
                        <span>{phase.title}</span>
                        {index % 2 === 0 && <span>{phase.icon}</span>}
                      </h4>
                      <p className="text-gray-600 text-sm">{phase.description}</p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="relative z-10 flex-shrink-0 hidden md:block">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${phase.color} text-white animate-pulse`}
                      style={{ animationDelay: `${index * 0.2}s` }}>
                      {phase.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600 shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="flex-1 hidden md:block"></div>
                </div>

                {/* Arrow */}
                {index < demoPhases.length - 1 && (
                  <div className="flex justify-center my-2 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-full">
                    <ArrowRight className="w-6 h-6 text-purple-400 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 mb-6">
            <div className="text-4xl">🎯</div>
            <div className="text-left">
              <p className="font-bold text-gray-800 text-lg">Ready to start your journey?</p>
              <p className="text-gray-600 text-sm">Generate your personalized AI roadmap now!</p>
            </div>
          </div>
          
          <button
            onClick={onStartClick}
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
          >
            <Rocket className="w-6 h-6" />
            Generate My Roadmap
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Features List */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-semibold text-gray-800 text-sm">Track Progress</p>
            <p className="text-xs text-gray-600">Mark phases complete</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl mb-2">🔒</div>
            <p className="font-semibold text-gray-800 text-sm">Unlock Phases</p>
            <p className="text-xs text-gray-600">Sequential learning path</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-xl">
            <div className="text-2xl mb-2">🏆</div>
            <p className="font-semibold text-gray-800 text-sm">Earn Rewards</p>
            <p className="text-xs text-gray-600">XP bonus on completion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPreview;
