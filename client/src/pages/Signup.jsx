import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    brandName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/signup', formData);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center 
                    justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Style<span className="text-emerald-400">Sync</span> AI
          </h1>
          <p className="text-gray-400 mt-2">
            Smart assistant for clothing brands
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">
            Create your account
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 
                          text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Farman Ali"
                required
                className="w-full bg-gray-800 border border-gray-700 
                         text-white rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-emerald-500
                         placeholder-gray-600"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                placeholder="StyleSync Clothing"
                required
                className="w-full bg-gray-800 border border-gray-700 
                         text-white rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-emerald-500
                         placeholder-gray-600"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-800 border border-gray-700 
                         text-white rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-emerald-500
                         placeholder-gray-600"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 
                         text-white rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-emerald-500
                         placeholder-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 
                       text-white font-semibold py-3 rounded-lg 
                       transition-colors duration-200 mt-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;