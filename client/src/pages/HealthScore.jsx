import { useState, useEffect } from 'react';
import api from '../utils/api';

const gradeColors = {
  'A+': 'text-emerald-400',
  'A': 'text-emerald-400',
  'B+': 'text-blue-400',
  'B': 'text-blue-400',
  'C': 'text-yellow-400',
  'D': 'text-red-400'
};

const ScoreBar = ({ label, score, icon }) => {
  const color = score >= 75
    ? 'bg-emerald-500'
    : score >= 50
    ? 'bg-yellow-500'
    : 'bg-red-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </p>
        <p className="text-white font-bold text-sm">{score}/100</p>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all
                     duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const HealthScore = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthScore();
  }, []);

  const fetchHealthScore = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/health-score');
      setHealth(res.data.health);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = health
    ? health.overallScore >= 75
      ? 'text-emerald-400'
      : health.overallScore >= 50
      ? 'text-yellow-400'
      : 'text-red-400'
    : 'text-gray-400';

  const scoreRing = health
    ? health.overallScore >= 75
      ? 'border-emerald-500'
      : health.overallScore >= 50
      ? 'border-yellow-500'
      : 'border-red-500'
    : 'border-gray-700';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center
                    h-64 gap-4">
        <div className="w-24 h-24 rounded-full border-4 border-emerald-500
                      border-t-transparent animate-spin" />
        <p className="text-white font-semibold">
          Calculating your health score...
        </p>
        <p className="text-gray-400 text-sm">
          Analyzing inventory, customers and revenue
        </p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="flex flex-col items-center justify-center
                    h-64 gap-4">
        <p className="text-5xl">😕</p>
        <p className="text-white">Could not calculate score</p>
        <button
          onClick={fetchHealthScore}
          className="bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ❤️ Business Health Score
          </h1>
          <p className="text-gray-400 mt-1">
            AI powered overall business assessment
          </p>
        </div>
        <button
          onClick={fetchHealthScore}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300
                   hover:text-white px-4 py-2 rounded-lg text-sm
                   transition-colors"
        >
          🔄 Recalculate
        </button>
      </div>

      {/* Main Score Card */}
      <div className="bg-gray-900 border border-gray-800
                    rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className={`w-40 h-40 rounded-full border-8
                           ${scoreRing} flex flex-col items-center
                           justify-center bg-gray-800`}>
              <p className={`text-5xl font-bold ${scoreColor}`}>
                {health.overallScore}
              </p>
              <p className="text-gray-500 text-xs mt-1">out of 100</p>
            </div>
          </div>

          {/* Score Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center
                          md:justify-start mb-2">
              <p className={`text-4xl font-bold
                           ${gradeColors[health.grade] || 'text-white'}`}>
                {health.grade}
              </p>
              <div>
                <p className="text-white font-bold text-xl">
                  {health.status}
                </p>
                <p className="text-emerald-400 text-sm">
                  {health.weeklyChange}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {health.aiVerdict}
            </p>

            {/* Badges */}
            {health.badges?.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center
                            md:justify-start">
                {health.badges.map((badge, i) => (
                  <div
                    key={i}
                    className="bg-gray-800 border border-gray-700
                             rounded-full px-3 py-1.5 flex items-center
                             gap-1.5"
                    title={badge.reason}
                  >
                    <span className="text-sm">{badge.emoji}</span>
                    <span className="text-gray-300 text-xs">
                      {badge.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-6">
          📊 Score Breakdown
        </h2>
        <div className="space-y-5">
          <ScoreBar
            label="Inventory Health"
            score={health.scores?.inventory || 0}
            icon="📦"
          />
          <ScoreBar
            label="Customer Health"
            score={health.scores?.customer || 0}
            icon="👥"
          />
          <ScoreBar
            label="Revenue Health"
            score={health.scores?.revenue || 0}
            icon="💰"
          />
          <ScoreBar
            label="Sales Velocity"
            score={health.scores?.velocity || 0}
            icon="⚡"
          />
        </div>
      </div>

      {/* Strength and Weakness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20
                      rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💪</span>
            <h2 className="text-white font-semibold">
              Biggest Strength
            </h2>
          </div>
          <p className="text-emerald-300 text-sm leading-relaxed">
            {health.biggestStrength}
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/20
                      rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎯</span>
            <h2 className="text-white font-semibold">
              Needs Improvement
            </h2>
          </div>
          <p className="text-red-300 text-sm leading-relaxed">
            {health.biggestWeakness}
          </p>
        </div>
      </div>

      {/* Score Booster */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-gray-900
                    border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚀</span>
          <h2 className="text-white font-semibold">
            Score Booster — Do This Today
          </h2>
        </div>
        <p className="text-emerald-300 text-sm leading-relaxed">
          {health.scoreBooster}
        </p>
      </div>

      {/* Score Scale */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">
          📈 Score Scale
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { range: '75-100', label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { range: '50-74', label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { range: '25-49', label: 'Needs Work', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { range: '0-24', label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' }
          ].map((s, i) => (
            <div
              key={i}
              className={`border rounded-xl p-3 text-center ${s.bg}`}
            >
              <p className={`font-bold text-sm ${s.color}`}>
                {s.range}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthScore;