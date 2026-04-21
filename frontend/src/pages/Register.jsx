import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Heart, Brain, Sparkles, UserPlus, Check, X } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ 
    email: false, 
    password: false, 
    firstName: false, 
    lastName: false 
  });
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setFocusedField('');
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const passwordStrength = (password) => {
    if (password.length < 6) return { level: 0, text: 'Too short' };
    if (password.length < 8) return { level: 1, text: 'Weak' };
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return { level: 3, text: 'Strong' };
    return { level: 2, text: 'Medium' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <ParticleBackground />
      <div className="max-w-md w-full relative z-10 chat-message">
        {/* Logo & Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-75 group-hover:opacity-100 blur-xl animate-pulse"></div>
              <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center card-tilt">
                <Brain className="w-12 h-12 text-blue-600" />
                <Heart className="w-6 h-6 text-pink-500 absolute -bottom-1 -right-1 animate-bounce" />
              </div>
            </div>
            <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))' }} />
          </div>
          <h1 className="text-5xl font-extrabold gradient-text neon-glow mb-3">MindMentor</h1>
          <p className="text-lg font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            🚀 Start Your Journey to Success & Wellness 🚀
          </p>
        </div>

        {/* Register Form */}
        <div className="card card-tilt animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.95)', animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-black gradient-text mb-2 text-center">Create Account 🎉</h2>
          <p className="text-center text-gray-600 mb-6 font-medium">Join thousands on their journey to growth</p>
          
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl mb-4 flex items-start gap-3 animate-slide-up shadow-lg">
              <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <X className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('firstName')}
                  onFocus={() => handleFocus('firstName')}
                  required
                  className={`input-field ${focusedField === 'firstName' ? 'ring-2 ring-purple-400' : ''}`}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastName')}
                  onFocus={() => handleFocus('lastName')}
                  required
                  className={`input-field ${focusedField === 'lastName' ? 'ring-2 ring-purple-400' : ''}`}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  onFocus={() => handleFocus('email')}
                  required
                  className={`input-field ${focusedField === 'email' ? 'ring-2 ring-blue-400' : ''} ${touched.email && !isValidEmail(formData.email) && formData.email ? 'border-red-400' : ''}`}
                  placeholder="your@email.com"
                />
                {touched.email && formData.email && (
                  isValidEmail(formData.email) ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-500 text-xs mt-1 font-semibold animate-slide-up">Please enter a valid email address</p>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  onFocus={() => handleFocus('password')}
                  required
                  minLength={6}
                  className={`input-field ${focusedField === 'password' ? 'ring-2 ring-blue-400' : ''}`}
                  placeholder="••••••••"
                />
                {formData.password && (
                  <div className="mt-2 animate-slide-up">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-600">Password Strength</span>
                      <span className={`text-xs font-bold ${
                        strength.level === 3 ? 'text-green-600' : 
                        strength.level === 2 ? 'text-yellow-600' : 
                        strength.level === 1 ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>{strength.text}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            strength.level >= level
                              ? strength.level === 3
                                ? 'bg-green-500'
                                : strength.level === 2
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 text-lg font-black"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500 font-semibold">OR</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-black text-base">
              Sign in ✨
            </Link>
            </p>
          </div>
        </div>
        
        {/* Benefits */}
        <div className="mt-6 grid grid-cols-1 gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { icon: '🎯', text: 'Personalized career roadmaps' },
            { icon: '💬', text: 'AI-powered mentorship' },
            { icon: '📈', text: 'Track your progress & growth' },
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/90 hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
                {benefit.icon}
              </div>
              <p className="text-sm font-bold text-gray-700">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Register;
