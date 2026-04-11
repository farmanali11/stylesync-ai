import { useState, useEffect } from 'react';
import api from '../utils/api';

const trendConfig = {
  up: { color: 'text-emerald-400', icon: '📈', bg: 'bg-emerald-500/10' },
  down: { color: 'text-red-400', icon: '📉', bg: 'bg-red-500/10' },
  same: { color: 'text-gray-400', icon: '➡️', bg: 'bg-gray-800' }
};

const DailyBriefing = () => {
  const [briefing, setBriefing] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/briefing');
      setBriefing(res.data.briefing);
      setMeta(res.data.meta);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const trend = briefing
    ? trendConfig[briefing.moneySnapshot?.weeklyTrend] || trendConfig.same
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-5xl animate-pulse">🌅</p>
        <p className="text-white font-semibold">
          Preparing your morning briefing...
        </p>
        <p className="text-gray-400 text-sm">
          AI is reviewing your entire business overnight
        </p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-5xl">😕</p>
        <p className="text-white">Could not load briefing</p>
        <button
          onClick={fetchBriefing}
          className="bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Morning Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-gray-900
                    border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">
              🌅 {meta?.dayName} • {meta?.dateStr}
            </p>
            <h1 className="text-2xl font-bold text-white mb-2">
              {briefing.greeting}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400
                            animate-pulse" />
              <p className="text-emerald-400 text-sm">
                🕌 Eid ul Adha in {meta?.daysUntilEid} days
              </p>
            </div>
          </div>
          <button
            onClick={fetchBriefing}
            className="text-gray-500 hover:text-white text-xs
                     bg-gray-800 hover:bg-gray-700 px-3 py-1.5
                     rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Urgent Items */}
      {briefing.urgentItems?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🚨</span> Needs Your Attention Today
          </h2>
          <div className="space-y-3">
            {briefing.urgentItems.map((item, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700
                         rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm">
                        {item.issue}
                      </p>
                      <span className="bg-gray-700 text-gray-400
                                     text-xs px-2 py-0.5 rounded-full">
                        #{item.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">
                      {item.detail}
                    </p>
                    <div className="bg-emerald-500/10 border
                                  border-emerald-500/20 rounded-lg
                                  px-3 py-2">
                      <p className="text-emerald-400 text-xs">
                        → {item.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Money Snapshot */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>💰</span> Money Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">Yesterday</p>
            <p className="text-white font-bold text-sm">
              PKR {(briefing.moneySnapshot?.yesterday || 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">This Week</p>
            <p className="text-white font-bold text-sm">
              PKR {(briefing.moneySnapshot?.thisWeek || 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">This Month</p>
            <p className="text-white font-bold text-sm">
              PKR {(briefing.moneySnapshot?.thisMonth || 0)
                .toLocaleString()}
            </p>
          </div>
          <div className={`${trend.bg} rounded-xl p-3 text-center`}>
            <p className="text-gray-500 text-xs mb-1">Weekly Trend</p>
            <p className={`font-bold text-sm ${trend.color}`}>
              {trend.icon} {briefing.moneySnapshot?.trendPercent}
            </p>
          </div>
        </div>
        <div className={`${trend.bg} border border-gray-700
                       rounded-lg px-4 py-2`}>
          <p className={`text-xs ${trend.color}`}>
            {briefing.moneySnapshot?.trendMessage}
          </p>
        </div>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Stock Health */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📦</span> Stock Health
          </h2>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between
                          bg-red-500/10 border border-red-500/20
                          rounded-lg px-3 py-2">
              <p className="text-red-400 text-xs">🔴 Critical</p>
              <p className="text-red-400 font-bold text-sm">
                {briefing.stockHealth?.critical} products
              </p>
            </div>
            <div className="flex items-center justify-between
                          bg-yellow-500/10 border border-yellow-500/20
                          rounded-lg px-3 py-2">
              <p className="text-yellow-400 text-xs">⚠️ Warning</p>
              <p className="text-yellow-400 font-bold text-sm">
                {briefing.stockHealth?.warning} products
              </p>
            </div>
            <div className="flex items-center justify-between
                          bg-emerald-500/10 border border-emerald-500/20
                          rounded-lg px-3 py-2">
              <p className="text-emerald-400 text-xs">✅ Healthy</p>
              <p className="text-emerald-400 font-bold text-sm">
                {briefing.stockHealth?.healthy} products
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-xs">
            {briefing.stockHealth?.stockMessage}
          </p>
        </div>

        {/* Customer Health */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>👥</span> Customer Health
          </h2>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between
                          bg-emerald-500/10 border border-emerald-500/20
                          rounded-lg px-3 py-2">
              <p className="text-emerald-400 text-xs">✅ Active</p>
              <p className="text-emerald-400 font-bold text-sm">
                {briefing.customerHealth?.active} customers
              </p>
            </div>
            <div className="flex items-center justify-between
                          bg-yellow-500/10 border border-yellow-500/20
                          rounded-lg px-3 py-2">
              <p className="text-yellow-400 text-xs">⚠️ At Risk</p>
              <p className="text-yellow-400 font-bold text-sm">
                {briefing.customerHealth?.atRisk} customers
              </p>
            </div>
            <div className="flex items-center justify-between
                          bg-red-500/10 border border-red-500/20
                          rounded-lg px-3 py-2">
              <p className="text-red-400 text-xs">💔 Lost</p>
              <p className="text-red-400 font-bold text-sm">
                {briefing.customerHealth?.lost} customers
                {briefing.customerHealth?.lostValue > 0 && (
                  <span className="text-xs ml-1">
                    (PKR {briefing.customerHealth.lostValue
                      .toLocaleString()})
                  </span>
                )}
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-xs">
            {briefing.customerHealth?.customerMessage}
          </p>
        </div>
      </div>

      {/* One Focus Today */}
      {briefing.oneFocusToday && (
        <div className="bg-gradient-to-r from-emerald-900/20 to-gray-900
                      border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎯</span>
            <h2 className="text-white font-semibold">
              Your One Focus Today
            </h2>
          </div>
          <p className="text-emerald-400 font-bold text-lg mb-2">
            {briefing.oneFocusToday.title}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {briefing.oneFocusToday.detail}
          </p>
          <div className="bg-emerald-500/10 border border-emerald-500/20
                        rounded-xl px-4 py-3">
            <p className="text-emerald-300 text-sm">
              💡 {briefing.oneFocusToday.expectedResult}
            </p>
          </div>
        </div>
      )}

      {/* Motivational Note */}
      {briefing.motivationalNote && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-6 text-center">
          <p className="text-3xl mb-3">✨</p>
          <p className="text-gray-300 text-sm leading-relaxed
                      italic max-w-lg mx-auto">
            "{briefing.motivationalNote}"
          </p>
          <p className="text-gray-600 text-xs mt-3">
            — StyleSync AI • Your Business Partner
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyBriefing;