import { useState } from 'react';
import api from '../utils/api';

const healthConfig = {
  excellent: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: '🚀'
  },
  good: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: '✅'
  },
  warning: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: '⚠️'
  },
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: '🚨'
  }
};

const ProfitIntelligence = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/profit');
      if (res.data.report) {
        setReport(res.data.report);
        setGenerated(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const health = report
    ? healthConfig[report.overallHealth] || healthConfig.good
    : null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            💰 Profit Intelligence
          </h1>
          <p className="text-gray-400 mt-1">
            AI powered profit analysis and business insights
          </p>
        </div>
        <button
          onClick={generateReport}
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
              Analyzing...
            </>
          ) : (
            <>
              <span>💰</span>
              {generated ? 'Refresh Report' : 'Generate Profit Report'}
            </>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-16 text-center">
          <p className="text-4xl mb-4 animate-pulse">💰</p>
          <p className="text-white font-semibold text-lg mb-2">
            AI is analyzing your profits...
          </p>
          <p className="text-gray-400 text-sm">
            Calculating margins, identifying opportunities,
            finding your most valuable customers
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !report && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-16 text-center">
          <p className="text-6xl mb-4">💰</p>
          <p className="text-white font-semibold text-xl mb-2">
            Know your real profit
          </p>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Get a complete profit intelligence report based on your
            actual sales data. Find your best products, most valuable
            customers and biggest opportunities.
          </p>
          <button
            onClick={generateReport}
            className="bg-emerald-500 hover:bg-emerald-400 text-white
                     px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Generate My Profit Report →
          </button>
        </div>
      )}

      {/* Report */}
      {!loading && report && (
        <>
          {/* Business Health */}
          <div className={`${health.bg} border ${health.border}
                         rounded-2xl p-6`}>
            <div className="flex items-center gap-4">
              <p className="text-5xl">{health.icon}</p>
              <div>
                <p className={`text-sm font-medium ${health.color} mb-1`}>
                  Business Health: {report.overallHealth?.toUpperCase()}
                </p>
                <p className="text-white font-bold text-xl">
                  {report.healthMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              📊 Financial Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">
                  Total Revenue
                </p>
                <p className="text-white font-bold">
                  PKR {(report.financials?.totalRevenue || 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-500/10 border
                            border-emerald-500/20 rounded-xl p-4
                            text-center">
                <p className="text-emerald-400 text-xs mb-1">
                  Est. Profit
                </p>
                <p className="text-emerald-400 font-bold">
                  PKR {(report.financials?.estimatedProfit || 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">
                  Profit Margin
                </p>
                <p className="text-white font-bold">
                  {report.financials?.profitMargin || '0%'}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">
                  This Month
                </p>
                <p className="text-white font-bold">
                  PKR {(report.financials?.monthlyRevenue || 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">
                  Monthly Profit
                </p>
                <p className="text-white font-bold">
                  PKR {(report.financials?.monthlyProfit || 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Product Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Star Product */}
            {report.starProduct && (
              <div className="bg-gray-900 border border-emerald-500/20
                            rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⭐</span>
                  <h2 className="text-white font-semibold">
                    Star Product
                  </h2>
                </div>
                <p className="text-emerald-400 font-bold text-lg mb-2">
                  {report.starProduct.productName}
                </p>
                <p className="text-gray-300 text-sm mb-3">
                  {report.starProduct.insight}
                </p>
                <div className="bg-emerald-500/10 border
                              border-emerald-500/20 rounded-lg px-3 py-2">
                  <p className="text-emerald-400 text-xs">
                    → {report.starProduct.action}
                  </p>
                </div>
              </div>
            )}

            {/* Dead Weight */}
            {report.deadWeightProduct && (
              <div className="bg-gray-900 border border-red-500/20
                            rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📉</span>
                  <h2 className="text-white font-semibold">
                    Dead Weight
                  </h2>
                </div>
                <p className="text-red-400 font-bold text-lg mb-2">
                  {report.deadWeightProduct.productName}
                </p>
                <p className="text-gray-300 text-sm mb-2">
                  {report.deadWeightProduct.insight}
                </p>
                {report.deadWeightProduct.suggestedDiscountPrice > 0 && (
                  <p className="text-yellow-400 text-sm mb-3">
                    Suggested discount price: PKR{' '}
                    {report.deadWeightProduct
                      .suggestedDiscountPrice.toLocaleString()}
                  </p>
                )}
                <div className="bg-red-500/10 border border-red-500/20
                              rounded-lg px-3 py-2">
                  <p className="text-red-400 text-xs">
                    → {report.deadWeightProduct.action}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Customer Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* VIP Customer */}
            {report.vipCustomer?.customerName && (
              <div className="bg-gray-900 border border-yellow-500/20
                            rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👑</span>
                  <h2 className="text-white font-semibold">
                    VIP Customer
                  </h2>
                </div>
                <p className="text-yellow-400 font-bold text-lg mb-1">
                  {report.vipCustomer.customerName}
                </p>
                <p className="text-emerald-400 text-sm mb-2">
                  PKR {(report.vipCustomer.totalSpent || 0)
                    .toLocaleString()} total spent
                </p>
                <p className="text-gray-300 text-sm mb-3">
                  {report.vipCustomer.insight}
                </p>
                <div className="bg-yellow-500/10 border
                              border-yellow-500/20 rounded-lg px-3 py-2">
                  <p className="text-yellow-400 text-xs">
                    → {report.vipCustomer.action}
                  </p>
                </div>
              </div>
            )}

            {/* At Risk Customer */}
            {report.atRiskCustomer?.customerName && (
              <div className="bg-gray-900 border border-orange-500/20
                            rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚡</span>
                  <h2 className="text-white font-semibold">
                    At Risk Customer
                  </h2>
                </div>
                <p className="text-orange-400 font-bold text-lg mb-1">
                  {report.atRiskCustomer.customerName}
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  {report.atRiskCustomer.daysSinceLastPurchase} days
                  since last purchase •{' '}
                  PKR {(report.atRiskCustomer.totalSpent || 0)
                    .toLocaleString()} spent
                </p>
                <div className="bg-orange-500/10 border
                              border-orange-500/20 rounded-lg px-3 py-2">
                  <p className="text-orange-400 text-xs">
                    → {report.atRiskCustomer.action}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Top Opportunity */}
          {report.topOpportunity && (
            <div className="bg-gradient-to-r from-emerald-900/20
                          to-gray-900 border border-emerald-500/20
                          rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <h2 className="text-white font-semibold">
                  Biggest Opportunity Right Now
                </h2>
              </div>
              <p className="text-emerald-300 text-sm leading-relaxed">
                {report.topOpportunity}
              </p>
            </div>
          )}

          {/* Weekly Actions */}
          {report.weeklyActions && (
            <div className="bg-gray-900 border border-gray-800
                          rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">
                ✅ This Week's Action Plan
              </h2>
              <div className="space-y-3">
                {report.weeklyActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-gray-800
                             rounded-xl p-4"
                  >
                    <div className="w-6 h-6 rounded-full
                                  bg-emerald-500/20 border
                                  border-emerald-500/30 flex items-center
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
          )}

          {/* Profit Tip */}
          {report.profitTip && (
            <div className="bg-gray-900 border border-gray-800
                          rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h2 className="text-white font-semibold mb-2">
                    Profit Tip of the Day
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {report.profitTip}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfitIntelligence;