import { useState } from 'react';
import api from '../utils/api';

const urgencyColors = {
  urgent: 'border-red-500/30 bg-red-500/5',
  warning: 'border-yellow-500/30 bg-yellow-500/5',
  ok: 'border-emerald-500/30 bg-emerald-500/5'
};

const urgencyBadge = {
  urgent: 'bg-red-500/20 text-red-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  ok: 'bg-emerald-500/20 text-emerald-400'
};

const EidForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/eid-forecast');
      setForecast(res.data.forecast);
      setGenerated(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            🕌 Eid Forecast
          </h1>
          <p className="text-gray-400 mt-1">
            AI powered Eid sales prediction and battle plan
          </p>
        </div>
        <button
          onClick={generateForecast}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-white
                   px-6 py-2 rounded-lg text-sm font-medium
                   transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <span>🕌</span>
              {generated ? 'Regenerate Forecast' : 'Generate Eid Forecast'}
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4 animate-bounce">🕌</p>
          <p className="text-white font-semibold text-lg mb-2">
            AI is analyzing your business...
          </p>
          <p className="text-gray-400 text-sm">
            Calculating sales velocity, stock levels,
            and Eid demand forecast
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !forecast && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-16 text-center">
          <p className="text-6xl mb-4">🕌</p>
          <p className="text-white font-semibold text-xl mb-2">
            Eid ul Adha is coming
          </p>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Get your personalized Eid battle plan based on your
            actual sales data, inventory levels and customer history.
          </p>
          <button
            onClick={generateForecast}
            className="bg-emerald-500 hover:bg-emerald-400 text-white
                     px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Generate My Eid Forecast →
          </button>
        </div>
      )}

      {/* Forecast Results */}
      {!loading && forecast && (
        <>
          {/* Countdown + Summary */}
          <div className="bg-gradient-to-r from-emerald-900/30
                        to-gray-900 border border-emerald-500/20
                        rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center bg-emerald-500/20 border
                            border-emerald-500/30 rounded-xl p-4
                            min-w-24">
                <p className="text-4xl font-bold text-emerald-400">
                  {forecast.daysUntilEid}
                </p>
                <p className="text-emerald-300 text-xs mt-1">
                  days to Eid
                </p>
              </div>
              <div>
                <h2 className="text-white font-bold text-xl mb-1">
                  {forecast.eidName}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {forecast.executiveSummary}
                </p>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20
                          rounded-xl px-4 py-3 mt-2">
              <p className="text-emerald-300 text-sm italic">
                💬 {forecast.motivationalMessage}
              </p>
            </div>
          </div>

          {/* Revenue Projections */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              💰 Revenue Projections
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Conservative</p>
                <p className="text-white font-bold text-xl">
                  PKR {forecast.revenueProjection.conservative
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-500/10 border
                            border-emerald-500/20 rounded-xl p-4
                            text-center">
                <p className="text-emerald-400 text-xs mb-1">
                  Realistic 🎯
                </p>
                <p className="text-emerald-400 font-bold text-xl">
                  PKR {forecast.revenueProjection.realistic
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Optimistic</p>
                <p className="text-white font-bold text-xl">
                  PKR {forecast.revenueProjection.optimistic
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Product Alerts */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              📦 Product Restock Plan
            </h2>
            <div className="space-y-3">
              {forecast.productAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4
                             ${urgencyColors[alert.urgency]
                               || urgencyColors.ok}`}
                >
                  <div className="flex items-center
                                justify-between mb-2">
                    <p className="text-white font-medium text-sm">
                      {alert.productName}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full
                                   ${urgencyBadge[alert.urgency]
                                     || urgencyBadge.ok}`}>
                      {alert.urgency?.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div>
                      <p className="text-gray-500 text-xs">
                        Current Stock
                      </p>
                      <p className="text-white text-sm font-medium">
                        {alert.currentStock} units
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">
                        Order Now
                      </p>
                      <p className="text-yellow-400 text-sm font-medium">
                        {alert.unitsToOrder} units
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">
                        Projected Revenue
                      </p>
                      <p className="text-emerald-400 text-sm font-medium">
                        PKR {(alert.projectedRevenue || 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">
                    → {alert.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Strategy */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              📱 Customer Win-Back Strategy
            </h2>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-6 mb-3">
                <div>
                  <p className="text-gray-400 text-xs">
                    Inactive Customers
                  </p>
                  <p className="text-white font-bold text-2xl">
                    {forecast.customerStrategy.inactiveCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">
                    Potential Revenue
                  </p>
                  <p className="text-emerald-400 font-bold text-2xl">
                    PKR {forecast.customerStrategy.potentialRevenue
                      .toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {forecast.customerStrategy.recommendation}
              </p>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              ✅ Your Eid Action Plan
            </h2>
            <div className="space-y-3">
              {forecast.actionPlan.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-gray-800
                           rounded-xl p-4"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20
                                border border-emerald-500/30 flex items-center
                                justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-400 text-xs font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EidForecast;