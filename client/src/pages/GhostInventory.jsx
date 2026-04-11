import { useState } from 'react';
import api from '../utils/api';

const riskColors = {
  critical: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400',
    text: 'text-red-400'
  },
  high: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    badge: 'bg-orange-500/20 text-orange-400',
    text: 'text-orange-400'
  },
  medium: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    badge: 'bg-yellow-500/20 text-yellow-400',
    text: 'text-yellow-400'
  }
};

const GhostInventory = () => {
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copiedProduct, setCopiedProduct] = useState('');

  const generateRecovery = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/ghost-inventory');
      setRecovery(res.data.recovery);
      setGenerated(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (message, name) => {
    navigator.clipboard.writeText(message);
    setCopiedProduct(name);
    setTimeout(() => setCopiedProduct(''), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            👻 Ghost Inventory
          </h1>
          <p className="text-gray-400 mt-1">
            Dead stock recovery and flash sale generator
          </p>
        </div>
        <button
          onClick={generateRecovery}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-500 text-white
                   px-6 py-2 rounded-lg text-sm font-medium
                   transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin">⏳</span>Analyzing...</>
          ) : (
            <><span>👻</span>
            {generated ? 'Re-Audit Stock' : 'Audit Dead Stock'}</>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4 animate-bounce">👻</p>
          <p className="text-white font-semibold text-lg mb-2">
            Hunting ghost inventory...
          </p>
          <p className="text-gray-400 text-sm">
            Finding products that have not sold in 14+ days
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !recovery && (
        <div className="bg-gray-900 border border-gray-800
                      rounded-2xl p-16 text-center">
          <p className="text-6xl mb-4">👻</p>
          <p className="text-white font-semibold text-xl mb-2">
            Find Your Dead Stock
          </p>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-3">
            In Karachi fashion market trends change every 2 weeks.
            Products sitting unsold are eating your cash flow.
            AI identifies them and creates flash sale strategies
            to recover your money.
          </p>
          <button
            onClick={generateRecovery}
            className="bg-orange-600 hover:bg-orange-500 text-white
                     px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Audit My Dead Stock →
          </button>
        </div>
      )}

      {/* No Ghost Products */}
      {!loading && recovery?.recoveryPlan?.length === 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20
                      rounded-2xl p-12 text-center">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-white font-semibold text-lg mb-2">
            No Ghost Inventory Found
          </p>
          <p className="text-emerald-400 text-sm">
            All your products have sold recently. Excellent stock management!
          </p>
        </div>
      )}

      {/* Recovery Results */}
      {!loading && recovery?.recoveryPlan?.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-500/10 border border-red-500/20
                          rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-400">
                {recovery.totalProductsAffected}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Dead Stock Items
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20
                          rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">
                PKR {(recovery.totalLiquidityRisk || 0).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Cash Stuck in Dead Stock
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20
                          rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                PKR {(recovery.totalRecoveryPotential || 0).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Recovery Potential
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-5">
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              {recovery.executiveSummary}
            </p>
            <div className="bg-orange-500/10 border border-orange-500/20
                          rounded-lg px-4 py-2">
              <p className="text-orange-400 text-xs">
                🎯 {recovery.topPriorityAction}
              </p>
            </div>
          </div>

          {/* Cash Flow Insight */}
          <div className="bg-emerald-500/10 border border-emerald-500/20
                        rounded-xl px-5 py-4">
            <p className="text-emerald-300 text-sm">
              💰 {recovery.cashFlowInsight}
            </p>
          </div>

          {/* Recovery Plans */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold">
              Recovery Plans by Product
            </h2>
            {recovery.recoveryPlan.map((item, i) => {
              const colors = riskColors[item.riskLevel] ||
                riskColors.medium;
              return (
                <div
                  key={i}
                  className={`border ${colors.border} ${colors.bg}
                             rounded-2xl p-6`}
                >
                  {/* Product Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">
                        {item.productName}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {item.daysSinceLastSale} days without a sale
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full
                                   ${colors.badge}`}>
                      {item.riskLevel?.toUpperCase()} RISK
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4
                                gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Stock</p>
                      <p className="text-white font-bold text-sm">
                        {item.quantity} units
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">
                        Cash at Risk
                      </p>
                      <p className={`font-bold text-sm ${colors.text}`}>
                        PKR {(item.liquidityRisk || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">
                        Suggested Discount
                      </p>
                      <p className="text-yellow-400 font-bold text-sm">
                        {item.recommendedDiscount}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">
                        Recovery Amount
                      </p>
                      <p className="text-emerald-400 font-bold text-sm">
                        PKR {(item.recoveryAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Strategy */}
                  <div className="bg-gray-800/50 rounded-lg px-4
                                py-3 mb-4">
                    <p className="text-gray-300 text-xs leading-relaxed">
                      📋 {item.strategy}
                    </p>
                  </div>

                  {/* Flash Sale Message */}
                  <div className="bg-gray-900 border border-gray-700
                                rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-xs font-medium">
                        📱 Flash Sale WhatsApp Message
                      </p>
                      <button
                        onClick={() => handleCopy(
                          item.flashSaleMessage,
                          item.productName
                        )}
                        className={`text-xs px-3 py-1.5 rounded-lg
                                   transition-colors ${
                          copiedProduct === item.productName
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-600 hover:bg-green-500 text-white'
                        }`}
                      >
                        {copiedProduct === item.productName
                          ? '✓ Copied'
                          : '📋 Copy'}
                      </button>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed
                                whitespace-pre-wrap">
                      {item.flashSaleMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default GhostInventory;