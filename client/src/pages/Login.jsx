import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { Sun, MoonStar, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >

      {/* Background glow blobs */}
      <div
        className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ backgroundColor: '#10b981' }}
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ backgroundColor: '#3b82f6' }}
      />

      {/* Theme Toggle — top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200"
        style={{
          backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(5,150,105,0.08)',
          borderColor: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(5,150,105,0.25)',
          color: 'var(--accent)'
        }}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun size={15} /> : <MoonStar size={15} />}
        <span className="hidden sm:block">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border"
            style={{
              backgroundColor: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(16,185,129,0.2)'
            }}
          >
            <span className="text-2xl font-black" style={{ color: 'var(--accent)' }}>S</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Style<span style={{ color: 'var(--accent)' }}>Sync</span> AI
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Smart assistant for clothing brands
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back 👋
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl px-4 py-3 pl-10 text-sm border outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <a href="#" className="text-xs" style={{ color: 'var(--accent)' }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-3 pl-10 text-sm border outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#fff',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>

          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium" style={{ color: 'var(--accent)' }}>
              Create one →
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} StyleSync AI · Built for Pakistani clothing brands
        </p>
      </div>
    </div>
  );
};

export default Login;