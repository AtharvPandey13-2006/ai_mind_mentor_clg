import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Heart, Brain, Sparkles, LogIn } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
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
          <h1 className="text-5xl font-extrabold gradient-text neon-glow mb-3">
            MindMentor
          </h1>
          <p className="text-lg font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            ✨ Your AI-powered Career & Wellness Companion ✨
          </p>
        </div>

        {/* Login Form */}
        <div className="card card-tilt animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.95)', animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-black gradient-text mb-2 text-center">Welcome Back! 👋</h2>
          <p className="text-center text-gray-600 mb-6 font-medium">Sign in to continue your journey</p>
          
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl mb-4 flex items-start gap-3 animate-slide-up shadow-lg">
              <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                {touched.email && !isValidEmail(formData.email) && formData.email && (
                  <p className="text-red-500 text-xs mt-1 font-semibold animate-slide-up">Please enter a valid email address</p>
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
                  className={`input-field ${focusedField === 'password' ? 'ring-2 ring-blue-400' : ''}`}
                  placeholder="••••••••"
                />
                {touched.password && formData.password.length > 0 && formData.password.length < 6 && (
                  <p className="text-yellow-600 text-xs mt-1 font-semibold animate-slide-up">Password should be at least 6 characters</p>
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
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
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
            Don't have an account?{' '}
            <Link to="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-black text-base">
              Create one now ✨
            </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="group p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50 hover:bg-white/80 hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">🧭</div>
            <p className="text-gray-700 font-bold text-xs">Career Guidance</p>
          </div>
          <div className="group p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50 hover:bg-white/80 hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-3xl mb-2 group-hover:scale-125 transition-transform animate-pulse">💙</div>
            <p className="text-gray-700 font-bold text-xs">Emotional Support</p>
          </div>
          <div className="group p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50 hover:bg-white/80 hover:scale-110 transition-all duration-300 cursor-pointer">
            <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">📊</div>
            <p className="text-gray-700 font-bold text-xs">Progress Tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
